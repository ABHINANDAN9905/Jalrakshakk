import { LeaderboardService } from './leaderboard.service.js';

export class LeaderboardController {
  /**
   * GET /api/v1/leaderboard
   * Get student rankings across Total XP, Weekly XP, Missions, or Badges
   */
  static async getLeaderboard(req, res, next) {
    try {
      const { type = 'TOTAL_XP', limit = 20 } = req.query;
      const rankings = await LeaderboardService.getLeaderboard({ type, limit });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Leaderboard rankings retrieved successfully',
        data: rankings,
        meta: {
          rankingType: type,
          count: rankings.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LeaderboardController;
