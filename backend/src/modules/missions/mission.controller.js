import { MissionService } from './mission.service.js';

export class MissionController {
  /**
   * GET /api/v1/missions
   * List all available missions
   */
  static async getMissions(req, res, next) {
    try {
      const { category, difficulty, level } = req.query;
      const missions = await MissionService.getMissions({ category, difficulty, level });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Missions retrieved successfully',
        data: missions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/missions/my/progress
   * List authenticated student's mission progress records
   */
  static async getMyMissionProgress(req, res, next) {
    try {
      const progress = await MissionService.getMyMissionProgress(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Mission progress retrieved successfully',
        data: progress
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/missions/:id
   * Get mission details and task progress
   */
  static async getMissionById(req, res, next) {
    try {
      const mission = await MissionService.getMissionById(req.params.id, req.user?.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Mission details retrieved successfully',
        data: mission
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/missions/:id/start
   * Start a mission for the authenticated student
   */
  static async startMission(req, res, next) {
    try {
      const result = await MissionService.startMission(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/missions/:id/tasks/:taskId/complete
   * Complete a task within a mission with verified simulation outputs
   */
  static async completeTask(req, res, next) {
    try {
      const { id: missionId, taskId } = req.params;
      const submission = req.body;

      const result = await MissionService.completeTask(req.user.id, missionId, taskId, submission);

      if (!result.taskPassed) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: result.message,
          data: result
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message || 'Task completed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/missions (Admin only)
   */
  static async createMission(req, res, next) {
    try {
      const mission = await MissionService.createMission(req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Mission created successfully',
        data: mission
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/missions/:id (Admin only)
   */
  static async updateMission(req, res, next) {
    try {
      const updated = await MissionService.updateMission(req.params.id, req.body);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Mission updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/missions/:id (Admin only)
   */
  static async deleteMission(req, res, next) {
    try {
      const result = await MissionService.deleteMission(req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MissionController;
