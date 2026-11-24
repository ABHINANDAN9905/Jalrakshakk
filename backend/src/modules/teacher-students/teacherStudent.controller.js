import { TeacherStudentService } from './teacherStudent.service.js';

export class TeacherStudentController {
  /**
   * POST /api/v1/teachers/:teacherId/students/:studentId
   * Admin assigns a student to a teacher
   */
  static async assignStudent(req, res, next) {
    try {
      const { teacherId, studentId } = req.params;
      const assignment = await TeacherStudentService.assignStudent(teacherId, studentId);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Student assigned to teacher successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/teachers/:teacherId/students/:studentId
   * Admin removes assignment of a student from a teacher
   */
  static async removeAssignment(req, res, next) {
    try {
      const { teacherId, studentId } = req.params;
      const result = await TeacherStudentService.removeAssignment(teacherId, studentId);

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
   * GET /api/v1/teachers/:teacherId/students
   * Teacher (self) or Admin lists assigned students
   */
  static async getAssignedStudents(req, res, next) {
    try {
      const { teacherId } = req.params;
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));

      const result = await TeacherStudentService.getAssignedStudents(teacherId, req.user, page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Assigned students retrieved successfully',
        data: result.students,
        meta: {
          teacher: result.teacher,
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
   * GET /api/v1/teachers/my-students
   * Convenience endpoint for authenticated Teacher to view own assigned students
   */
  static async getMyStudents(req, res, next) {
    try {
      const teacherId = req.user.id;
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));

      const result = await TeacherStudentService.getAssignedStudents(teacherId, req.user, page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Assigned students retrieved successfully',
        data: result.students,
        meta: {
          teacher: result.teacher,
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
}

export default TeacherStudentController;
