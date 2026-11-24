import { prisma } from '../../config/database.js';
import { SimulationLog } from '../simulation-logs/simulationLog.model.js';

// Circuit breaker for local offline environments where PostgreSQL is paused
let isDbKnownOffline = false;
let lastDbCheck = 0;

/**
 * Prepares sanitized, authorized educational context for the AI Water Mentor.
 * Strictly filters out sensitive credentials, PII, and system tokens.
 */
export class AiMentorContext {
  /**
   * Fetches the latest simulation run and village context for a given user
   * @param {string} userId - Authenticated student ID
   * @param {string} [villageId] - Optional specific village ID
   * @returns {Promise<Object|null>}
   */
  static async getStudentHydroContext(userId, villageId) {
    let latestRun = null;

    // 1. Try relational PostgreSQL store if not known to be offline
    const shouldTryDb = !isDbKnownOffline || (Date.now() - lastDbCheck > 60000);

    if (shouldTryDb) {
      try {
        const whereClause = { userId };
        if (villageId) whereClause.villageId = villageId;

        const findPromise = prisma.simulationRun.findFirst({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          include: {
            village: {
              select: { id: true, name: true, region: true, state: true }
            }
          }
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Prisma connection timeout')), 350)
        );
        latestRun = await Promise.race([findPromise, timeoutPromise]);
        isDbKnownOffline = false;
      } catch (err) {
        isDbKnownOffline = true;
        lastDbCheck = Date.now();
      }
    }

    if (!latestRun) {
      // Offline fallback: Query MongoDB SimulationLog telemetry
      try {
        const query = { userId };
        if (villageId) query.villageId = villageId;
        const mongoLog = await SimulationLog.findOne(query).sort({ createdAt: -1 }).lean();
        if (mongoLog) {
          latestRun = {
            id: mongoLog.simulationRunId,
            villageId: mongoLog.villageId,
            initialStorage: 500000,
            finalStorage: mongoLog.storageIndex * 1000000,
            rainfall: mongoLog.rainfall,
            recharge: mongoLog.recharge,
            extraction: mongoLog.extraction,
            losses: 25000,
            sustainabilityScore: mongoLog.metadata?.sustainabilityScore || 75,
            village: { name: 'Kalyanpur Gram', region: 'Ahmednagar', state: 'Maharashtra' },
            metadata: mongoLog.metadata
          };
        }
      } catch (mongoErr) {
        latestRun = null;
      }
    }

    if (!latestRun) {
      // Default educational baseline context if no simulation has been run yet
      return {
        hasRunSimulation: false,
        villageName: 'Kalyanpur Gram, Maharashtra',
        baselineAquifer: {
          storagePercentage: 68.5,
          conditionCategory: 'SAFE',
          depthToWaterTableMeters: 14.2,
          annualRechargeM3: 420000,
          annualExtractionM3: 310000,
          waterQualityIndex: 82,
          rainfallMm: 680
        }
      };
    }

    const storagePercentage = Number(
      (((latestRun.finalStorage || 500000) / 1000000) * 100).toFixed(1)
    );

    let conditionCategory = 'SAFE';
    if (storagePercentage < 20.0) conditionCategory = 'CRITICAL';
    else if (storagePercentage < 40.0) conditionCategory = 'SEMI_CRITICAL';
    else if (storagePercentage > 70.0) conditionCategory = 'OPTIMAL';

    return {
      hasRunSimulation: true,
      simulationId: latestRun.id,
      villageName: latestRun.village?.name || 'Village Watershed',
      state: latestRun.village?.state || 'Maharashtra',
      waterBalance: {
        initialStorageM3: latestRun.initialStorage,
        finalStorageM3: latestRun.finalStorage,
        storagePercentage,
        conditionCategory,
        rainfallMm: latestRun.rainfall,
        rechargeM3: latestRun.recharge,
        extractionM3: latestRun.extraction,
        naturalDischargeM3: latestRun.losses || 25000,
        netChangeM3: (latestRun.finalStorage || 0) - (latestRun.initialStorage || 0)
      },
      sustainabilityScore: latestRun.sustainabilityScore || 75,
      waterQualityIndex: latestRun.metadata?.waterQualityIndex || 80,
      season: latestRun.metadata?.season || 'Monsoon'
    };
  }
}

export default AiMentorContext;
