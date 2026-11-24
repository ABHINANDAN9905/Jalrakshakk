import { Router } from 'express';
import { TeacherAssignmentController } from './teacherAssignment.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  assignMissionSchema,
  bulkAssignMissionSchema,
  studentProgressParamsSchema,
  reportQuerySchema
} from './teacherAssignment.validation.js';

const router = Router();

// Only TEACHER or ADMIN role can manage classroom assignments
router.use(authenticate, authorize('TEACHER', 'ADMIN'));

// Dashboard Overview & Analytics
router.get('/dashboard', TeacherAssignmentController.getDashboardSummary);
router.get('/analytics', TeacherAssignmentController.getClassroomAnalytics);
router.get('/notifications', TeacherAssignmentController.getTeacherNotifications);
router.get('/reports/export', validate(reportQuerySchema, 'query'), TeacherAssignmentController.exportClassroomReport);

// Mission Assignments (Individual & Bulk)
router.post('/missions/assign', validate(assignMissionSchema), TeacherAssignmentController.assignMission);
router.post('/missions/assign-bulk', validate(bulkAssignMissionSchema), TeacherAssignmentController.assignMissionBulk);
router.get('/missions/assignments', TeacherAssignmentController.getTeacherAssignments);

// Individual Student Supervised Inspection
router.get('/students/:studentId/progress', validate(studentProgressParamsSchema, 'params'), TeacherAssignmentController.getStudentProgress);
router.get('/students/:studentId/detail', validate(studentProgressParamsSchema, 'params'), TeacherAssignmentController.getStudentDetailedProfile);

export default router;
