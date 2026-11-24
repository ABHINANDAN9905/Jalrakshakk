import { ActivityLog } from './activityLog.model.js';

export class ActivityLogService {
  /**
   * Create a new student or teacher activity log entry
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  static async recordActivity(data) {
    const log = new ActivityLog({
      userId: data.userId,
      villageId: data.villageId,
      activityType: data.activityType,
      description: data.description,
      metadata: data.metadata || {},
      timestamp: data.timestamp || new Date()
    });
    return await log.save();
  }

  /**
   * Retrieve activity logs with filtering and pagination
   * @param {Object} filter 
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{ logs: Array, total: number, page: number, totalPages: number }>}
   */
  static async getActivities(filter = {}, page = 1, limit = 20) {
    const query = {};
    if (filter.userId) query.userId = filter.userId;
    if (filter.villageId) query.villageId = filter.villageId;
    if (filter.activityType) query.activityType = filter.activityType;

    const skip = (Math.max(1, page) - 1) * limit;
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query)
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get activity summary counts by type for a student or village
   * @param {string} userId 
   * @param {string} villageId 
   * @returns {Promise<Array>}
   */
  static async getActivityStats(userId, villageId) {
    const match = {};
    if (userId) match.userId = userId;
    if (villageId) match.villageId = villageId;

    return await ActivityLog.aggregate([
      { $match: match },
      { $group: { _id: '$activityType', count: { $sum: 1 }, latest: { $max: '$timestamp' } } },
      { $sort: { count: -1 } }
    ]);
  }
}

export default ActivityLogService;
