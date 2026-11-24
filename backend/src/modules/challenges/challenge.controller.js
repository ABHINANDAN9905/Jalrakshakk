import { ChallengeService } from './challenge.service.js';

export class ChallengeController {
  /**
   * GET /api/v1/challenges
   * List all currently active daily & weekly challenges
   */
  static async getChallenges(req, res, next) {
    try {
      const challenges = await ChallengeService.getActiveChallenges();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Active challenges retrieved successfully',
        data: challenges
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/challenges/:id/join
   * Join an active challenge
   */
  static async joinChallenge(req, res, next) {
    try {
      const result = await ChallengeService.joinChallenge(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message,
        data: result.participation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/challenges/my
   * List challenges joined by authenticated student
   */
  static async getMyChallenges(req, res, next) {
    try {
      const challenges = await ChallengeService.getUserChallenges(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User challenges retrieved successfully',
        data: challenges
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ChallengeController;
