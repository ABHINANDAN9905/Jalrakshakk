import { Router } from 'express';
import { TeacherStudentController } from './teacherStudent.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  teacherStudentParamsSchema,
  teacherOnlyParamsSchema,
  teacherQuerySchema
} from './teacherStudent.validation.js';

const router = Router();

// Authentication required for all teacher-student assignment endpoints
router.use(authenticate);

// Teacher accesses own assigned students list
router.get(
  '/my-students',
  authorize('TEACHER'),
  validate(teacherQuerySchema, 'query'),
  TeacherStudentController.getMyStudents
);

// Teacher (self) or Admin accesses assigned students for a specific teacher ID
router.get(
  '/:teacherId/students',
  authorize('TEACHER', 'ADMIN'),
  validate(teacherOnlyParamsSchema, 'params'),
  validate(teacherQuerySchema, 'query'),
  TeacherStudentController.getAssignedStudents
);

// Admin-only assignment / unassignment endpoints
router.post(
  '/:teacherId/students/:studentId',
  authorize('ADMIN'),
  validate(teacherStudentParamsSchema, 'params'),
  TeacherStudentController.assignStudent
);

router.delete(
  '/:teacherId/students/:studentId',
  authorize('ADMIN'),
  validate(teacherStudentParamsSchema, 'params'),
  TeacherStudentController.removeAssignment
);

export default router;
