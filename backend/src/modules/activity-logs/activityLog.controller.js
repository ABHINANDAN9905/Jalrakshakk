import { ActivityLogService } from './activityLog.service.js';

export class ActivityLogController {
  /**
   * POST /api/v1/activity-logs
   */
  static async createLog(req, res, next) {
    try {
      const { userId, villageId, activityType, description, metadata } = req.body;

      if (!userId || !villageId || !activityType || !description) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Missing required fields: userId, villageId, activityType, and description are required.'
        });
      }

      const log = await ActivityLogService.recordActivity({
        userId,
        villageId,
        activityType,
        description,
        metadata
      });

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Activity log recorded successfully',
        data: log
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/activity-logs
   */
  static async getLogs(req, res, next) {
    try {
      const { userId, villageId, activityType, page, limit } = req.query;

      const pageNum = parseInt(page || '1', 10);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));

      const result = await ActivityLogService.getActivities(
        { userId, villageId, activityType },
        pageNum,
        limitNum
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Activity logs retrieved successfully',
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
}

export default ActivityLogController;
