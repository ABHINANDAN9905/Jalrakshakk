import { SimulationLog } from './simulationLog.model.js';

export class SimulationLogService {
  /**
   * Record a discrete simulation state event snapshot
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  static async recordSimulationEvent(data) {
    const log = new SimulationLog({
      userId: data.userId,
      villageId: data.villageId,
      simulationRunId: data.simulationRunId,
      eventType: data.eventType,
      rainfall: data.rainfall ?? 0,
      recharge: data.recharge ?? 0,
      extraction: data.extraction ?? 0,
      storageIndex: data.storageIndex,
      metadata: data.metadata || {},
      timestamp: data.timestamp || new Date()
    });
    return await log.save();
  }

  /**
   * Retrieve time-series simulation telemetry for a specific gameplay session
   * @param {string} simulationRunId 
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  static async getRunTelemetry(simulationRunId, limit = 100) {
    return await SimulationLog.find({ simulationRunId })
      .sort({ timestamp: 1 })
      .limit(limit)
      .lean();
  }

  /**
   * Retrieve filtered simulation logs with pagination
   * @param {Object} filter 
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{ logs: Array, total: number, page: number, totalPages: number }>}
   */
  static async getSimulationLogs(filter = {}, page = 1, limit = 50) {
    const query = {};
    if (filter.simulationRunId) query.simulationRunId = filter.simulationRunId;
    if (filter.villageId) query.villageId = filter.villageId;
    if (filter.userId) query.userId = filter.userId;
    if (filter.eventType) query.eventType = filter.eventType;

    const skip = (Math.max(1, page) - 1) * limit;
    const [logs, total] = await Promise.all([
      SimulationLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SimulationLog.countDocuments(query)
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default SimulationLogService;
