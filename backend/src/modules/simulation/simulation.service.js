import { prisma } from '../../config/database.js';
import { runSimulationEngine } from './engine/waterBalance.js';
import { getScenarioList, getScenarioById } from './engine/scenarioEngine.js';
import { SimulationLog } from '../simulation-logs/simulationLog.model.js';
import {
  emitSimulationStarted,
  emitSimulationCompleted,
  emitSimulationFailed
} from '../../config/socket.js';

// In-flight simulation tracking for duplicate request prevention
const activeSimulations = new Set();

export class SimulationService {
  /**
   * Run a groundwater simulation step
   * @param {string} userId - Authenticated user executing the run
   * @param {Object} payload - Validated simulation parameters
   */
  static async runSimulation(userId, payload) {
    // Prevent duplicate concurrent simulation submissions from the same user
    if (activeSimulations.has(userId)) {
      const err = new Error('A simulation is already currently running for this user. Please wait for completion.');
      err.statusCode = 409;
      throw err;
    }

    activeSimulations.add(userId);
    emitSimulationStarted(userId, { villageId: payload.villageId, scenarioId: payload.scenarioId });

    try {
      let baseInputs = {};

    // 1. If scenario preset is selected, populate baseline environmental defaults
    if (payload.scenarioId) {
      try {
        const scenario = getScenarioById(payload.scenarioId);
        baseInputs = {
          scenarioId: scenario.id,
          season: scenario.season,
          ...scenario.initialConditions
        };
      } catch (err) {
        // Fall back to custom if scenario ID unrecognized
        baseInputs = { scenarioId: payload.scenarioId };
      }
    }

    // 2. Merge user overrides on top of scenario baseline
    const mergedInputs = {
      ...baseInputs,
      ...payload
    };

    // 3. Execute scientific water balance simulation engine
    const calculationResult = runSimulationEngine(mergedInputs);

    // 4. Persist authoritative relational record in PostgreSQL
    let simulationRunId = `sim-${Date.now()}`;
    let persistedInDb = false;

    try {
      const runRecord = await prisma.simulationRun.create({
        data: {
          userId,
          villageId: payload.villageId,
          initialStorage: calculationResult.waterBalance.initialStorageM3,
          finalStorage: calculationResult.waterBalance.finalStorageM3,
          rainfall: calculationResult.waterBalance.rainfallMm,
          recharge: calculationResult.waterBalance.rechargeM3,
          extraction: calculationResult.waterBalance.extractionM3,
          losses: calculationResult.waterBalance.naturalDischargeM3,
          sustainabilityScore: calculationResult.sustainability.overallScore
        }
      });

      simulationRunId = runRecord.id;
      persistedInDb = true;

      // Persist associated state snapshot record in PostgreSQL
      await prisma.groundwaterRecord.create({
        data: {
          villageId: payload.villageId,
          simulationRunId: runRecord.id,
          storageIndex: +(calculationResult.waterBalance.storagePercentage / 100.0).toFixed(4),
          recharge: calculationResult.waterBalance.rechargeM3,
          extraction: calculationResult.waterBalance.extractionM3,
          waterQualityIndex: calculationResult.waterQuality.finalWQI
        }
      });
    } catch (dbError) {
      // In standalone, offline, or unit test environments without live PostgreSQL
      persistedInDb = false;
    }

    // 5. Asynchronously log telemetry event in MongoDB (SimulationLog)
    SimulationLog.create({
      userId,
      villageId: payload.villageId,
      simulationRunId,
      eventType: 'TICK',
      rainfall: calculationResult.waterBalance.rainfallMm,
      recharge: calculationResult.waterBalance.rechargeM3,
      extraction: calculationResult.waterBalance.extractionM3,
      storageIndex: Math.min(1.0, Math.max(0.0, +(calculationResult.waterBalance.storagePercentage / 100.0).toFixed(4))),
      metadata: {
        scenarioId: calculationResult.scenarioId,
        season: calculationResult.season,
        sustainabilityScore: calculationResult.sustainability.overallScore,
        waterQualityIndex: calculationResult.waterQuality.finalWQI,
        waterSavingsM3: calculationResult.sectors.waterSavingsM3,
        conditionCategory: calculationResult.waterBalance.conditionCategory
      }
    }).catch(() => {});

    const finalResponse = {
      simulationId: simulationRunId,
      persistedInPostgres: persistedInDb,
      executedAt: new Date(),
      ...calculationResult
    };

    // Emit real-time simulation completed event via Socket.IO
    emitSimulationCompleted(userId, payload.villageId, finalResponse);

    return finalResponse;
    } catch (simError) {
      emitSimulationFailed(userId, simError);
      throw simError;
    } finally {
      activeSimulations.delete(userId);
    }
  }

  /**
   * Retrieve a simulation run by ID with access control
   */
  static async getSimulationById(simulationId, requestingUser) {
    const run = await prisma.simulationRun.findUnique({
      where: { id: simulationId },
      include: {
        village: {
          select: { id: true, name: true, region: true, state: true }
        },
        user: {
          select: { id: true, name: true, role: true }
        },
        groundwaterRecords: true
      }
    });

    if (!run) {
      const error = new Error('Simulation run not found.');
      error.statusCode = 404;
      throw error;
    }

    // RBAC: Students can only view their own runs
    if (requestingUser.role === 'STUDENT' && run.userId !== requestingUser.id) {
      const error = new Error('Forbidden: Students can only view their own simulation records.');
      error.statusCode = 403;
      throw error;
    }

    // RBAC: Teachers can view own or assigned students' runs
    if (requestingUser.role === 'TEACHER' && run.userId !== requestingUser.id) {
      const assignment = await prisma.teacherStudentAssignment.findUnique({
        where: {
          teacherId_studentId: {
            teacherId: requestingUser.id,
            studentId: run.userId
          }
        }
      });

      if (!assignment) {
        const error = new Error('Forbidden: You are not assigned to monitor this student’s simulations.');
        error.statusCode = 403;
        throw error;
      }
    }

    return run;
  }

  /**
   * Retrieve simulation run history with role-scoped filtering and pagination
   */
  static async getSimulationHistory(requestingUser, { villageId, page = 1, limit = 20 } = {}) {
    const skip = (Math.max(1, page) - 1) * limit;
    const where = {};

    if (villageId) {
      where.villageId = villageId;
    }

    if (requestingUser.role === 'STUDENT') {
      where.userId = requestingUser.id;
    } else if (requestingUser.role === 'TEACHER') {
      // Find all students assigned to this teacher
      const assignments = await prisma.teacherStudentAssignment.findMany({
        where: { teacherId: requestingUser.id },
        select: { studentId: true }
      });
      const allowedStudentIds = assignments.map((a) => a.studentId);
      allowedStudentIds.push(requestingUser.id);
      where.userId = { in: allowedStudentIds };
    }
    // ADMIN has no userId restriction

    const [runs, total] = await Promise.all([
      prisma.simulationRun.findMany({
        where,
        include: {
          village: { select: { id: true, name: true, region: true } },
          user: { select: { id: true, name: true, role: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.simulationRun.count({ where })
    ]);

    return {
      runs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    };
  }

  /**
   * List available educational scenarios
   */
  static getScenarios() {
    return getScenarioList();
  }

  /**
   * Get single scenario specification with initial conditions
   */
  static getScenarioById(scenarioId) {
    return getScenarioById(scenarioId);
  }
}

export default SimulationService;
