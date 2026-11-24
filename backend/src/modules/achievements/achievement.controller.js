import { AchievementService } from './achievement.service.js';

export class AchievementController {
  /**
   * GET /api/v1/achievements
   * List all available achievements in the game
   */
  static async getAchievements(req, res, next) {
    try {
      const achievements = await AchievementService.getAchievements();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Achievements catalog retrieved successfully',
        data: achievements
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/achievements/my
   * List achievements unlocked by the current authenticated student
   */
  static async getMyAchievements(req, res, next) {
    try {
      const achievements = await AchievementService.getUserAchievements(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User achievements retrieved successfully',
        data: achievements
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AchievementController;
