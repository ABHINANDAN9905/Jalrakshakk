import { UserService } from './user.service.js';

export class UserController {
  /**
   * GET /api/v1/users (Admin only)
   */
  static async getUsers(req, res, next) {
    try {
      const { search, role, page, limit } = req.query;
      const pageNum = parseInt(page || '1', 10);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));

      const result = await UserService.getUsers({ search, role }, pageNum, limitNum);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: result.users,
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
   * GET /api/v1/users/profile
   */
  static async getProfile(req, res, next) {
    try {
      const profile = await UserService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const updated = await UserService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Profile updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id
   */
  static async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User details retrieved successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id/status (Admin only)
   */
  static async updateStatus(req, res, next) {
    try {
      const updated = await UserService.updateStatus(req.params.id, req.body.isActive);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `User account ${req.body.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id/role (Admin only)
   */
  static async updateRole(req, res, next) {
    try {
      const updated = await UserService.updateRole(req.params.id, req.body.role);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User role updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
