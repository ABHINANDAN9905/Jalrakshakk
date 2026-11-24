import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Phase 6: User, Village, Membership & Teacher-Student Management Tests', () => {

  const studentToken = generateAccessToken({
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'student@test.local',
    role: 'STUDENT'
  });

  const teacherToken = generateAccessToken({
    id: 'b0000000-0000-0000-0000-000000000002',
    email: 'teacher@test.local',
    role: 'TEACHER'
  });

  const adminToken = generateAccessToken({
    id: 'c0000000-0000-0000-0000-000000000003',
    email: 'admin@test.local',
    role: 'ADMIN'
  });

  describe('Village Management RBAC & Validation', () => {
    it('POST /api/v1/villages should reject unauthenticated request (401)', async () => {
      const res = await request(app).post('/api/v1/villages').send({ name: 'Sundarapur' });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('POST /api/v1/villages should forbid STUDENT role (403)', async () => {
      const res = await request(app)
        .post('/api/v1/villages')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Sundarapur',
          region: 'Deccan Plateau',
          state: 'Karnataka'
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Forbidden'));
    });

    it('POST /api/v1/villages should forbid TEACHER role (403)', async () => {
      const res = await request(app)
        .post('/api/v1/villages')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Sundarapur',
          region: 'Deccan Plateau',
          state: 'Karnataka'
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Forbidden'));
    });

    it('POST /api/v1/villages should validate payload when called by ADMIN (400 on empty)', async () => {
      const res = await request(app)
        .post('/api/v1/villages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Validation failed');
    });

    it('PATCH /api/v1/villages/:id should forbid STUDENT (403)', async () => {
      const res = await request(app)
        .patch('/api/v1/villages/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ population: 5000 });

      assert.equal(res.status, 403);
    });

    it('DELETE /api/v1/villages/:id should forbid STUDENT (403)', async () => {
      const res = await request(app)
        .delete('/api/v1/villages/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
    });
  });

  describe('User Governance & Admin Directory RBAC', () => {
    it('GET /api/v1/users should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/v1/users');
      assert.equal(res.status, 401);
    });

    it('GET /api/v1/users should forbid STUDENT role (403)', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
    });

    it('GET /api/v1/users should forbid TEACHER role (403)', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.equal(res.status, 403);
    });

    it('PATCH /api/v1/users/:id/status should forbid STUDENT role (403)', async () => {
      const res = await request(app)
        .patch('/api/v1/users/a0000000-0000-0000-0000-000000000001/status')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ isActive: false });

      assert.equal(res.status, 403);
    });

    it('PATCH /api/v1/users/:id/status should validate body for ADMIN (400 on missing isActive)', async () => {
      const res = await request(app)
        .patch('/api/v1/users/a0000000-0000-0000-0000-000000000001/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('PATCH /api/v1/users/:id/role should forbid STUDENT role (403)', async () => {
      const res = await request(app)
        .patch('/api/v1/users/a0000000-0000-0000-0000-000000000001/role')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ role: 'ADMIN' });

      assert.equal(res.status, 403);
    });

    it('PATCH /api/v1/users/:id/role should reject invalid role string for ADMIN (400)', async () => {
      const res = await request(app)
        .patch('/api/v1/users/a0000000-0000-0000-0000-000000000001/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'SUPERUSER' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  describe('Teacher-Student Assignment RBAC & Validation', () => {
    const validUuid1 = '123e4567-e89b-12d3-a456-426614174000';
    const validUuid2 = '987fcdeb-51a2-43f7-9876-ba0987654321';

    it('POST /api/v1/teachers/:teacherId/students/:studentId should forbid STUDENT (403)', async () => {
      const res = await request(app)
        .post(`/api/v1/teachers/${validUuid1}/students/${validUuid2}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
    });

    it('POST /api/v1/teachers/:teacherId/students/:studentId should forbid TEACHER (403)', async () => {
      const res = await request(app)
        .post(`/api/v1/teachers/${validUuid1}/students/${validUuid2}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.equal(res.status, 403);
    });

    it('POST /api/v1/teachers/:teacherId/students/:studentId should reject non-UUID params (400)', async () => {
      const res = await request(app)
        .post('/api/v1/teachers/not-a-uuid/students/also-not-a-uuid')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.some((e) => e.message.includes('must be a valid UUID')));
    });

    it('DELETE /api/v1/teachers/:teacherId/students/:studentId should forbid STUDENT (403)', async () => {
      const res = await request(app)
        .delete(`/api/v1/teachers/${validUuid1}/students/${validUuid2}`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
    });

    it('GET /api/v1/teachers/my-students should forbid STUDENT (403)', async () => {
      const res = await request(app)
        .get('/api/v1/teachers/my-students')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
    });

    it('GET /api/v1/teachers/:teacherId/students should forbid STUDENT (403)', async () => {
      const res = await request(app)
        .get(`/api/v1/teachers/${validUuid1}/students`)
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
    });
  });

  describe('Village Membership & Enrollment RBAC', () => {
    it('POST /api/v1/villages/:id/join should reject unauthenticated request (401)', async () => {
      const res = await request(app).post('/api/v1/villages/11111111-1111-1111-1111-111111111111/join');
      assert.equal(res.status, 401);
    });

    it('DELETE /api/v1/villages/:id/leave should reject unauthenticated request (401)', async () => {
      const res = await request(app).delete('/api/v1/villages/11111111-1111-1111-1111-111111111111/leave');
      assert.equal(res.status, 401);
    });

    it('GET /api/v1/villages/:id/members should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/v1/villages/11111111-1111-1111-1111-111111111111/members');
      assert.equal(res.status, 401);
    });

    it('GET /api/v1/users/:id/villages should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/v1/users/a0000000-0000-0000-0000-000000000001/villages');
      assert.equal(res.status, 401);
    });
  });

});
