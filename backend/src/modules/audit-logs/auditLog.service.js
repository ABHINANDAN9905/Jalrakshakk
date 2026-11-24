import { AuditLog } from './auditLog.model.js';

export class AuditLogService {
  /**
   * Record an administrative or system security action
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  static async recordAudit(data) {
    const log = new AuditLog({
      actorId: data.actorId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId || null,
      metadata: data.metadata || {},
      timestamp: data.timestamp || new Date()
    });
    return await log.save();
  }

  /**
   * Query audit logs with pagination and filters
   * @param {Object} filter 
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{ logs: Array, total: number, page: number, totalPages: number }>}
   */
  static async getAuditLogs(filter = {}, page = 1, limit = 50) {
    const query = {};
    if (filter.actorId) query.actorId = filter.actorId;
    if (filter.action) query.action = filter.action;
    if (filter.resource) query.resource = filter.resource;
    if (filter.resourceId) query.resourceId = filter.resourceId;

    const skip = (Math.max(1, page) - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default AuditLogService;
