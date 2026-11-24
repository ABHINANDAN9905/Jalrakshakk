import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Phase 12: Teacher Dashboard & Classroom Management Integration Tests', () => {
  const teacherId = '123e4567-e89b-12d3-a456-426614174001';
  const authorizedStudentId = '123e4567-e89b-12d3-a456-426614174002';
  const unauthorizedStudentId = '999e4567-e89b-12d3-a456-426614174999';

  const teacherToken = generateAccessToken({
    id: teacherId,
    email: 'teacher@jalrakshak.org',
    role: 'TEACHER'
  });

  const studentToken = generateAccessToken({
    id: authorizedStudentId,
    email: 'student@jalrakshak.org',
    role: 'STUDENT'
  });

  describe('1. Authentication & Role-Based Authorization Enforcement', () => {
    it('GET /api/v1/teacher/dashboard should permit TEACHER role (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/dashboard')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data);
      assert.strictEqual(typeof res.body.data.totalStudents, 'number');
    });

    it('GET /api/v1/teacher/dashboard should forbid STUDENT role (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Forbidden|permission/i);
    });

    it('GET /api/v1/teacher/dashboard should reject unauthenticated requests (401 Unauthorized)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/dashboard');

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('2. Teacher Analytics & Notifications API', () => {
    it('GET /api/v1/teacher/analytics should return classroom distributions and telemetry (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/analytics')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.xpDistribution));
      assert.ok(Array.isArray(res.body.data.categoryPerformance));
      assert.ok(Array.isArray(res.body.data.weeklyActivityTrends));
    });

    it('GET /api/v1/teacher/notifications should return pedagogical alert notifications (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/notifications')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  describe('3. Mission Assignment Routes & Cross-Teacher Authorization Safeguards', () => {
    it('POST /api/v1/teacher/missions/assign should successfully assign mission to authorized student (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/teacher/missions/assign')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: authorizedStudentId,
          missionId: '123e4567-e89b-12d3-a456-426614174001',
          notes: 'Focus on check dam percolation parameters'
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data);
      assert.strictEqual(res.body.data.studentId, authorizedStudentId);
    });

    it('POST /api/v1/teacher/missions/assign should block assignment to unauthorized student (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/teacher/missions/assign')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: unauthorizedStudentId,
          missionId: '123e4567-e89b-12d3-a456-426614174001'
        });

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /not authorized|Access denied/i);
    });

    it('POST /api/v1/teacher/missions/assign-bulk should deploy assignments across class (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/teacher/missions/assign-bulk')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          missionId: '123e4567-e89b-12d3-a456-426614174002',
          allClassroom: true,
          notes: 'Prepare for monsoon season simulation experiment'
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.assignedCount > 0);
      assert.ok(Array.isArray(res.body.data.assignments));
    });

    it('GET /api/v1/teacher/missions/assignments should list assignments created by teacher (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/missions/assignments')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  describe('4. Detailed Student Progression Profile & Cross-Teacher Security', () => {
    it('GET /api/v1/teacher/students/:studentId/detail should return profile for authorized student (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/v1/teacher/students/${authorizedStudentId}/detail`)
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.student);
      assert.strictEqual(res.body.data.student.id, authorizedStudentId);
      assert.ok(Array.isArray(res.body.data.learningStrengths));
      assert.ok(Array.isArray(res.body.data.areasNeedingImprovement));
    });

    it('GET /api/v1/teacher/students/:studentId/detail should return 403 Forbidden for unauthorized student', async () => {
      const res = await request(app)
        .get(`/api/v1/teacher/students/${unauthorizedStudentId}/detail`)
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /not authorized|Access denied/i);
    });
  });

  describe('5. Classroom Report Generation & CSV Export', () => {
    it('GET /api/v1/teacher/reports/export?format=csv should return CSV file with appropriate headers (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/reports/export?format=csv')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/csv/);
      assert.match(res.headers['content-disposition'], /attachment; filename="jalrakshak_classroom_report/);
      assert.match(res.text, /Student Name,Email,Level/);
    });

    it('GET /api/v1/teacher/reports/export?format=json should return JSON report summary (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/reports/export?format=json')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.students);
    });
  });
});
