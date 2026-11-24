import { MembershipService } from './membership.service.js';

export class MembershipController {
  /**
   * POST /api/v1/villages/:id/join
   * Current authenticated user joins a village
   */
  static async joinVillage(req, res, next) {
    try {
      const villageId = req.params.id;
      const userId = req.user.id;

      const membership = await MembershipService.joinVillage(userId, villageId);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Successfully enrolled into village community',
        data: membership
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/villages/:id/leave
   * Current authenticated user leaves a village
   */
  static async leaveVillage(req, res, next) {
    try {
      const villageId = req.params.id;
      const userId = req.user.id;

      const result = await MembershipService.leaveVillage(userId, villageId);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/villages/:id/members
   * List all members enrolled in a village with pagination
   */
  static async getVillageMembers(req, res, next) {
    try {
      const villageId = req.params.id;
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));

      const result = await MembershipService.getVillageMembers(villageId, page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Village members retrieved successfully',
        data: result.members,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: result.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id/villages
   * List all villages a target user belongs to (with privacy / authorization checks)
   */
  static async getUserVillages(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const requestingUser = req.user;

      const villages = await MembershipService.getUserVillages(targetUserId, requestingUser);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Enrolled villages retrieved successfully',
        data: villages
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MembershipController;
