import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Phase 14: Analytics, Learning Insights & Reporting Integration Tests', () => {
  const studentId = '123e4567-e89b-12d3-a456-426614174000';
  const otherStudentId = '123e4567-e89b-12d3-a456-426614174099';
  const teacherId = '123e4567-e89b-12d3-a456-426614174001';
  const adminId = '123e4567-e89b-12d3-a456-426614174099';

  const studentToken = generateAccessToken({
    id: studentId,
    email: 'student@jalrakshak.org',
    role: 'STUDENT'
  });

  const otherStudentToken = generateAccessToken({
    id: otherStudentId,
    email: 'other.student@jalrakshak.org',
    role: 'STUDENT'
  });

  const teacherToken = generateAccessToken({
    id: teacherId,
    email: 'teacher@jalrakshak.org',
    role: 'TEACHER'
  });

  const adminToken = generateAccessToken({
    id: adminId,
    email: 'admin@jalrakshak.org',
    role: 'ADMIN'
  });

  describe('1. Authentication & Security Gateways', () => {
    it('GET /api/v1/analytics/student should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/analytics/student');
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('GET /api/v1/analytics/student should permit student to view their own analytics (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/student')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data);
      assert.strictEqual(res.body.data.student.id, studentId);
      assert.strictEqual(res.body.data.isSimulated, true);
    });

    it('GET /api/v1/analytics/student?studentId=:otherId should forbid student querying another student (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/student?studentId=${otherStudentId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Students can only view their own/i);
    });

    it('GET /api/v1/analytics/student/:studentId should permit teacher to view supervised student analytics (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/student/${studentId}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.student.id, studentId);
    });

    it('GET /api/v1/analytics/student/:studentId should permit admin to view student analytics (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/v1/analytics/student/${studentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.student.id, studentId);
    });
  });

  describe('2. Groundwater Hydrological Learning Insights API', () => {
    it('GET /api/v1/analytics/insights/groundwater should return rule-based insights & simulated disclaimer', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/insights/groundwater')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data);
      assert.strictEqual(res.body.data.isSimulated, true);
      assert.strictEqual(typeof res.body.data.modelDisclaimer, 'string');
    });
  });

  describe('3. Teacher Classroom Analytics API', () => {
    it('GET /api/v1/analytics/teacher should permit TEACHER role (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/teacher')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.classroomOverview);
      assert.ok(Array.isArray(res.body.data.levelDistribution));
      assert.ok(Array.isArray(res.body.data.studentsRequiringSupport));
      assert.ok(Array.isArray(res.body.data.frequentlyFailedTasks));
    });

    it('GET /api/v1/analytics/teacher should forbid STUDENT role (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/teacher')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('4. Admin Platform Analytics API', () => {
    it('GET /api/v1/analytics/admin should permit ADMIN role (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.overview);
      assert.strictEqual(typeof res.body.data.overview.totalUsers, 'number');
    });

    it('GET /api/v1/analytics/admin should forbid TEACHER and STUDENT roles (403 Forbidden)', async () => {
      const teacherRes = await request(app)
        .get('/api/v1/analytics/admin')
        .set('Authorization', `Bearer ${teacherToken}`);
      assert.strictEqual(teacherRes.statusCode, 403);

      const studentRes = await request(app)
        .get('/api/v1/analytics/admin')
        .set('Authorization', `Bearer ${studentToken}`);
      assert.strictEqual(studentRes.statusCode, 403);
    });
  });

  describe('5. Reports & Exports Engine API', () => {
    it('GET /api/v1/analytics/reports?reportType=STUDENT_PROGRESS&format=csv should stream CSV with RFC 4180 headers', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/reports?reportType=STUDENT_PROGRESS&format=csv')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/csv/);
      assert.match(res.headers['content-disposition'], /attachment; filename="student-progress-/);
      assert.ok(res.text.includes('# Disclaimer:'));
      assert.ok(res.text.includes('Aarav Sharma'));
    });

    it('GET /api/v1/analytics/reports?reportType=STUDENT_PROGRESS&format=html should return print-ready HTML', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/reports?reportType=STUDENT_PROGRESS&format=html')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/html/);
      assert.ok(res.text.includes('<!DOCTYPE html>'));
      assert.ok(res.text.includes('EDUCATIONAL SIMULATION NOTICE'));
    });

    it('GET /api/v1/analytics/reports?reportType=TEACHER_CLASSROOM&format=csv should stream classroom CSV for teacher', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/reports?reportType=TEACHER_CLASSROOM&format=csv')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/csv/);
      assert.match(res.headers['content-disposition'], /attachment; filename="classroom-report-/);
      assert.ok(res.text.includes('Student ID,Student Name,Email,Level'));
    });

    it('GET /api/v1/analytics/reports?reportType=TEACHER_CLASSROOM should forbid student (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/reports?reportType=TEACHER_CLASSROOM&format=csv')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 403);
    });
  });
});
