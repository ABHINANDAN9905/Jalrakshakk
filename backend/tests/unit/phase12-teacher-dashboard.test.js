import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { teacherAssignmentService } from '../../src/modules/teacher-assignments/teacherAssignment.service.js';

describe('Phase 12: Teacher Dashboard & Classroom Management Unit Tests', () => {
  const teacherId = '123e4567-e89b-12d3-a456-426614174001';
  const authorizedStudentId = '123e4567-e89b-12d3-a456-426614174002';
  const unauthorizedStudentId = '999e4567-e89b-12d3-a456-426614174999';

  describe('1. Supervision Verification & Authorization Safeguards', () => {
    it('verifySupervision should permit access for authorized student', async () => {
      const isAuthorized = await teacherAssignmentService.verifySupervision(teacherId, authorizedStudentId);
      assert.strictEqual(isAuthorized, true);
    });

    it('verifySupervision should reject cross-teacher student access (403 Forbidden)', async () => {
      await assert.rejects(
        async () => {
          await teacherAssignmentService.verifySupervision(teacherId, unauthorizedStudentId);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          assert.match(err.message, /Access denied|not authorized/);
          return true;
        }
      );
    });
  });

  describe('2. Teacher Dashboard Summary Calculations', () => {
    it('getDashboardSummary should return authoritative classroom KPI metrics', async () => {
      const summary = await teacherAssignmentService.getDashboardSummary(teacherId);

      assert.ok(summary);
      assert.strictEqual(summary.teacherId, teacherId);
      assert.strictEqual(typeof summary.totalStudents, 'number');
      assert.strictEqual(typeof summary.activeStudents, 'number');
      assert.strictEqual(typeof summary.totalAssignments, 'number');
      assert.strictEqual(typeof summary.completedAssignments, 'number');
      assert.strictEqual(typeof summary.pendingAssignments, 'number');
      assert.strictEqual(typeof summary.overdueAssignments, 'number');
      assert.strictEqual(typeof summary.averageStudentXP, 'number');
      assert.strictEqual(typeof summary.classCompletionRate, 'number');
      assert.ok(Array.isArray(summary.studentsRequiringAttention));
      assert.ok(Array.isArray(summary.recentActivities));
    });

    it('getDashboardSummary should calculate non-negative averages and valid rates', async () => {
      const summary = await teacherAssignmentService.getDashboardSummary(teacherId);
      assert.ok(summary.averageStudentXP >= 0);
      assert.ok(summary.classCompletionRate >= 0 && summary.classCompletionRate <= 100);
    });
  });

  describe('3. Classroom Analytics & Learning Distributions', () => {
    it('getClassroomAnalytics should return multi-dimensional educational metrics', async () => {
      const analytics = await teacherAssignmentService.getClassroomAnalytics(teacherId);

      assert.ok(analytics);
      assert.strictEqual(analytics.teacherId, teacherId);
      assert.ok(Array.isArray(analytics.xpDistribution));
      assert.ok(Array.isArray(analytics.categoryPerformance));
      assert.ok(Array.isArray(analytics.difficultyBreakdown));
      assert.ok(Array.isArray(analytics.weeklyActivityTrends));
      assert.ok(Array.isArray(analytics.achievementDistribution));
      assert.ok(Array.isArray(analytics.incompleteAssignments));
    });

    it('weeklyActivityTrends should contain 7 daily entries with telemetry counters', async () => {
      const analytics = await teacherAssignmentService.getClassroomAnalytics(teacherId);
      assert.strictEqual(analytics.weeklyActivityTrends.length, 7);
      analytics.weeklyActivityTrends.forEach((dayData) => {
        assert.ok(dayData.day);
        assert.strictEqual(typeof dayData.simulations, 'number');
        assert.strictEqual(typeof dayData.tasksCompleted, 'number');
        assert.strictEqual(typeof dayData.xpAwarded, 'number');
      });
    });
  });

  describe('4. Individual Student Profile & Pedagogical Assessment', () => {
    it('getStudentDetailedProfile should return pedagogical strengths and targeted improvements', async () => {
      const profile = await teacherAssignmentService.getStudentDetailedProfile(teacherId, authorizedStudentId);

      assert.ok(profile);
      assert.ok(profile.student);
      assert.strictEqual(profile.student.id, authorizedStudentId);
      assert.ok(Array.isArray(profile.learningStrengths));
      assert.ok(Array.isArray(profile.areasNeedingImprovement));
      assert.ok(profile.learningStrengths.length > 0);
      assert.ok(profile.areasNeedingImprovement.length > 0);
      assert.ok(Array.isArray(profile.xpHistory));
      assert.ok(Array.isArray(profile.missions));
      assert.ok(Array.isArray(profile.achievements));
    });

    it('getStudentDetailedProfile should throw 403 Forbidden for unauthorized student', async () => {
      await assert.rejects(
        async () => {
          await teacherAssignmentService.getStudentDetailedProfile(teacherId, unauthorizedStudentId);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );
    });
  });

  describe('5. Mission Assignments: Single & Bulk Deployment', () => {
    it('assignMission should create assignment with PENDING status for supervised student', async () => {
      const res = await teacherAssignmentService.assignMission(teacherId, {
        studentId: authorizedStudentId,
        missionId: '123e4567-e89b-12d3-a456-426614174001',
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        notes: 'Review aquifer infiltration rate before running simulation.'
      });

      assert.ok(res);
      const assignment = res.assignment || res;
      assert.strictEqual(assignment.teacherId, teacherId);
      assert.strictEqual(assignment.studentId, authorizedStudentId);
      assert.strictEqual(assignment.status, 'PENDING');
    });

    it('assignMissionBulk should assign mission to all supervised students', async () => {
      const result = await teacherAssignmentService.assignMissionBulk(teacherId, {
        missionId: '123e4567-e89b-12d3-a456-426614174002',
        allClassroom: true,
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        notes: 'Classwide challenge: Monsoon Runoff'
      });

      assert.ok(result);
      assert.strictEqual(typeof result.assignedCount, 'number');
      assert.ok(result.assignedCount > 0);
      assert.ok(Array.isArray(result.assignments));
      assert.strictEqual(result.assignments.length, result.assignedCount);
    });
  });

  describe('6. Report Generation & CSV Formatting', () => {
    it('generateClassroomReport should format CSV with appropriate headers and student records', async () => {
      const report = await teacherAssignmentService.generateClassroomReport(teacherId, {
        format: 'csv'
      });

      assert.ok(report);
      assert.strictEqual(report.format, 'csv');
      const csvStr = report.content || report.data;
      assert.ok(typeof csvStr === 'string');
      
      // Verify CSV headers
      assert.match(csvStr, /Student Name,Email,Level/);
      // Verify student rows
      assert.match(csvStr, /Aarav Sharma|Ananya Deshmukh/);
    });

    it('generateClassroomReport should return structured JSON summary when requested', async () => {
      const report = await teacherAssignmentService.generateClassroomReport(teacherId, {
        format: 'json'
      });

      assert.ok(report);
      assert.strictEqual(report.format, 'json');
      assert.strictEqual(report.teacherId, teacherId);
      assert.ok(Array.isArray(report.students));
    });
  });

  describe('7. Teacher Notification Feed', () => {
    it('getTeacherNotifications should return alerts for completed missions and overdue assignments', async () => {
      const notifs = await teacherAssignmentService.getTeacherNotifications(teacherId);

      assert.ok(Array.isArray(notifs));
      assert.ok(notifs.length > 0);
      const types = notifs.map((n) => n.type);
      assert.ok(types.includes('MISSION_COMPLETED') || types.includes('ASSIGNMENT_OVERDUE'));
    });
  });
});
