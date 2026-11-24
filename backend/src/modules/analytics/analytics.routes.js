import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  studentAnalyticsQuerySchema,
  groundwaterInsightsQuerySchema,
  reportGenerationSchema
} from './analytics.validation.js';

const router = Router();

// All analytics endpoints require active authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/analytics/student
 * @desc    Get student learning analytics (self for student, or supervised student for teacher/admin)
 * @access  STUDENT, TEACHER, ADMIN
 */
router.get(
  '/student',
  validate(studentAnalyticsQuerySchema, 'query'),
  AnalyticsController.getStudentAnalytics
);

/**
 * @route   GET /api/v1/analytics/student/:studentId
 * @desc    Get student learning analytics by ID
 * @access  STUDENT, TEACHER, ADMIN
 */
router.get(
  '/student/:studentId',
  AnalyticsController.getStudentAnalytics
);

/**
 * @route   GET /api/v1/analytics/insights/groundwater
 * @desc    Get rule-based hydrological insights and before/after simulation comparisons
 * @access  STUDENT, TEACHER, ADMIN
 */
router.get(
  '/insights/groundwater',
  validate(groundwaterInsightsQuerySchema, 'query'),
  AnalyticsController.getGroundwaterInsights
);

/**
 * @route   GET /api/v1/analytics/teacher
 * @desc    Get supervised classroom analytics, category coverage, and student support alerts
 * @access  TEACHER, ADMIN
 */
router.get(
  '/teacher',
  authorize('TEACHER', 'ADMIN'),
  AnalyticsController.getTeacherClassroomAnalytics
);

/**
 * @route   GET /api/v1/analytics/admin
 * @desc    Get platform-wide analytics and cross-village engagement telemetry
 * @access  ADMIN
 */
router.get(
  '/admin',
  authorize('ADMIN'),
  AnalyticsController.getAdminPlatformAnalytics
);

/**
 * @route   GET /api/v1/analytics/reports
 * @desc    Generate and export multi-format reports (CSV, HTML print view, JSON)
 * @access  STUDENT, TEACHER, ADMIN
 */
router.get(
  '/reports',
  validate(reportGenerationSchema, 'query'),
  AnalyticsController.generateReport
);

export default router;
