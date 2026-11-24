import { TeacherAssignmentService } from './teacherAssignment.service.js';

export class TeacherAssignmentController {
  /**
   * POST /api/v1/teacher/missions/assign (Teacher only)
   */
  static async assignMission(req, res, next) {
    try {
      const result = await TeacherAssignmentService.assignMission(req.user.id, req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: result.message,
        data: result.assignment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/teacher/missions/assign-bulk (Teacher only)
   */
  static async assignMissionBulk(req, res, next) {
    try {
      const result = await TeacherAssignmentService.assignMissionBulk(req.user.id, req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: result.message,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teacher/missions/assignments (Teacher only)
   */
  static async getTeacherAssignments(req, res, next) {
    try {
      const assignments = await TeacherAssignmentService.getTeacherAssignments(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Classroom mission assignments retrieved successfully',
        data: assignments
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teacher/students/:studentId/progress (Teacher only)
   */
  static async getStudentProgress(req, res, next) {
    try {
      const progress = await TeacherAssignmentService.getStudentProgress(req.user.id, req.params.studentId);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Student progress retrieved successfully',
        data: progress
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teacher/students/:studentId/detail (Teacher only)
   */
  static async getStudentDetailedProfile(req, res, next) {
    try {
      const profile = await TeacherAssignmentService.getStudentDetailedProfile(req.user.id, req.params.studentId);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Student detailed profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teacher/dashboard (Teacher only)
   */
  static async getDashboardSummary(req, res, next) {
    try {
      const summary = await TeacherAssignmentService.getDashboardSummary(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Teacher dashboard overview retrieved successfully',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teacher/analytics (Teacher only)
   */
  static async getClassroomAnalytics(req, res, next) {
    try {
      const analytics = await TeacherAssignmentService.getClassroomAnalytics(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Classroom analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teacher/notifications (Teacher only)
   */
  static async getTeacherNotifications(req, res, next) {
    try {
      const notifications = await TeacherAssignmentService.getTeacherNotifications(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Teacher notifications retrieved successfully',
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/teacher/reports/export (Teacher only)
   */
  static async exportClassroomReport(req, res, next) {
    try {
      const { format = 'json' } = req.query;
      const report = await TeacherAssignmentService.generateClassroomReport(req.user.id, { format });

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
        return res.status(200).send(report.content);
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Classroom report generated successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TeacherAssignmentController;
