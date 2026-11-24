import { SimulationLogService } from './simulationLog.service.js';

export class SimulationLogController {
  /**
   * POST /api/v1/simulation-logs
   */
  static async createLog(req, res, next) {
    try {
      const {
        userId,
        villageId,
        simulationRunId,
        eventType,
        rainfall,
        recharge,
        extraction,
        storageIndex,
        metadata
      } = req.body;

      if (!userId || !villageId || !simulationRunId || !eventType || storageIndex === undefined) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Missing required fields: userId, villageId, simulationRunId, eventType, and storageIndex are required.'
        });
      }

      const log = await SimulationLogService.recordSimulationEvent({
        userId,
        villageId,
        simulationRunId,
        eventType,
        rainfall,
        recharge,
        extraction,
        storageIndex,
        metadata
      });

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Simulation log recorded successfully',
        data: log
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/simulation-logs
   */
  static async getLogs(req, res, next) {
    try {
      const { simulationRunId, villageId, userId, eventType, page, limit } = req.query;

      const pageNum = parseInt(page || '1', 10);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit || '50', 10)));

      const result = await SimulationLogService.getSimulationLogs(
        { simulationRunId, villageId, userId, eventType },
        pageNum,
        limitNum
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Simulation logs retrieved successfully',
        data: result.logs,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: limitNum
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/simulation-logs/run/:simulationRunId
   */
  static async getByRunId(req, res, next) {
    try {
      const { simulationRunId } = req.params;
      const { limit } = req.query;
      const limitNum = Math.min(500, Math.max(1, parseInt(limit || '100', 10)));

      const telemetry = await SimulationLogService.getRunTelemetry(simulationRunId, limitNum);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Simulation run telemetry retrieved successfully',
        data: telemetry,
        meta: {
          count: telemetry.length,
          simulationRunId
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SimulationLogController;
