import { AdminService } from './admin.service.js';

export class AdminController {
  /**
   * GET /api/v1/admin/dashboard
   */
  static async getDashboard(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Admin dashboard statistics retrieved successfully',
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users
   */
  static async getUsers(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const filter = {
        search: req.query.search,
        role: req.query.role,
        status: req.query.status
      };

      const result = await AdminService.getUsers(filter, page, limit);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
   */
  static async updateUserStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const targetUserId = req.params.id;
      const adminActorId = req.user.id;

      const updated = await AdminService.updateUserStatus(targetUserId, isActive, adminActorId);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `User account has been ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/role
   */
  static async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const targetUserId = req.params.id;
      const adminActorId = req.user.id;

      const updated = await AdminService.updateUserRole(targetUserId, role, adminActorId);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `User role has been updated to '${role}' successfully`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/teachers
   */
  static async getTeachers(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const filter = {
        search: req.query.search,
        status: req.query.status
      };

      const result = await AdminService.getTeachers(filter, page, limit);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Teachers directory retrieved successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/villages
   */
  static async getVillages(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const filter = {
        search: req.query.search,
        region: req.query.region,
        state: req.query.state
      };

      const result = await AdminService.getVillages(filter, page, limit);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Villages retrieved successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/villages
   */
  static async createVillage(req, res, next) {
    try {
      const village = await AdminService.createVillage(req.body, req.user.id);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Village created successfully',
        data: village
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/villages/:id
   */
  static async updateVillage(req, res, next) {
    try {
      const updated = await AdminService.updateVillage(req.params.id, req.body, req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Village updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/missions
   */
  static async getMissions(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const filter = {
        category: req.query.category,
        difficulty: req.query.difficulty,
        status: req.query.status
      };

      const result = await AdminService.getMissions(filter, page, limit);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Admin missions catalog retrieved successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/missions
   */
  static async createMission(req, res, next) {
    try {
      const mission = await AdminService.createMission(req.body, req.user.id);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Educational mission created successfully',
        data: mission
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/missions/:id
   */
  static async updateMission(req, res, next) {
    try {
      const updated = await AdminService.updateMission(req.params.id, req.body, req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Mission updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/missions/:id/status
   */
  static async toggleMissionStatus(req, res, next) {
    try {
      const { isActive } = req.body;
      const updated = await AdminService.toggleMissionStatus(req.params.id, isActive, req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: `Mission has been ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/challenges
   */
  static async getChallenges(req, res, next) {
    try {
      const challenges = await AdminService.getChallenges();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Admin challenges list retrieved successfully',
        data: challenges
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/challenges
   */
  static async createChallenge(req, res, next) {
    try {
      const challenge = await AdminService.createChallenge(req.body, req.user.id);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Challenge created successfully',
        data: challenge
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/challenges/:id
   */
  static async updateChallenge(req, res, next) {
    try {
      const updated = await AdminService.updateChallenge(req.params.id, req.body, req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Challenge updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/analytics
   */
  static async getAnalytics(req, res, next) {
    try {
      const analytics = await AdminService.getPlatformAnalytics();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Platform analytics retrieved successfully',
        data: analytics
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/audit-logs
   */
  static async getAuditLogs(req, res, next) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const filter = {
        actorId: req.query.actorId,
        action: req.query.action,
        resource: req.query.resource
      };

      const result = await AdminService.getAuditLogs(filter, page, limit);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Audit logs retrieved successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/system-health
   */
  static async getSystemHealth(req, res, next) {
    try {
      const health = await AdminService.getSystemHealth();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'System health diagnostics retrieved successfully',
        data: health
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AdminController;
