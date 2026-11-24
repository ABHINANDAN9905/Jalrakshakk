import { AnalyticsService } from './analytics.service.js';

export class AnalyticsController {
  /**
   * GET /api/v1/analytics/student
   * GET /api/v1/analytics/student/:studentId
   */
  static async getStudentAnalytics(req, res, next) {
    try {
      const targetStudentId = req.params.studentId || req.query.studentId || req.user.id;
      const analytics = await AnalyticsService.getStudentAnalytics(targetStudentId, req.query, req.user);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Student learning analytics retrieved successfully',
        data: analytics
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/insights/groundwater
   */
  static async getGroundwaterInsights(req, res, next) {
    try {
      const targetStudentId = req.query.studentId || req.user.id;
      const insights = await AnalyticsService.getGroundwaterLearningInsights(targetStudentId, req.query, req.user);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Groundwater hydrological learning insights retrieved successfully',
        data: insights
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/teacher
   */
  static async getTeacherClassroomAnalytics(req, res, next) {
    try {
      const analytics = await AnalyticsService.getTeacherClassroomAnalytics(req.user.id, req.query);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Teacher classroom analytics retrieved successfully',
        data: analytics
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/admin
   */
  static async getAdminPlatformAnalytics(req, res, next) {
    try {
      const analytics = await AnalyticsService.getAdminPlatformAnalytics(req.query);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Platform-wide analytics retrieved successfully',
        data: analytics
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/analytics/reports
   */
  static async generateReport(req, res, next) {
    try {
      const reportType = req.query.reportType || 'STUDENT_PROGRESS';
      const result = await AnalyticsService.generateReport(reportType, req.query, req.user);

      if (req.query.format === 'csv' || req.query.format === 'html') {
        res.setHeader('Content-Type', result.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        return res.send(result.content);
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Report generated successfully',
        data: result.content
      });
    } catch (err) {
      next(err);
    }
  }
}
