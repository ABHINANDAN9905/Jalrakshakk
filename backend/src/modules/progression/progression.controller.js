import { ProgressionService } from './progression.service.js';

export class ProgressionController {
  /**
   * GET /api/v1/progression/me
   * Get authenticated student's level, XP, and progression perks
   */
  static async getMyProgression(req, res, next) {
    try {
      const progression = await ProgressionService.getUserProgression(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User progression retrieved successfully',
        data: progression
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/xp/history
   * Get authenticated student's XP earning audit ledger
   */
  static async getXPHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));

      const history = await ProgressionService.getXPHistory(req.user.id, page, limit);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'XP transaction history retrieved successfully',
        data: history.transactions,
        meta: {
          total: history.total,
          page: history.page,
          totalPages: history.totalPages,
          limit: history.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProgressionController;
