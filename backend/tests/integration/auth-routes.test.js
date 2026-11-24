import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Auth & RBAC Route Integration Tests', () => {

  const studentToken = generateAccessToken({
    id: 'test-student-id-1',
    email: 'student@test.local',
    role: 'STUDENT'
  });

  const teacherToken = generateAccessToken({
    id: 'test-teacher-id-1',
    email: 'teacher@test.local',
    role: 'TEACHER'
  });

  const adminToken = generateAccessToken({
    id: 'test-admin-id-1',
    email: 'admin@test.local',
    role: 'ADMIN'
  });

  describe('Registration Route Validation', () => {
    it('POST /api/v1/auth/register should reject missing fields (400)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'incomplete@test.local' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Validation failed');
    });

    it('POST /api/v1/auth/register should reject mismatched confirmPassword (400)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@test.local',
          password: 'Password123!',
          confirmPassword: 'Mismatch999!',
          role: 'STUDENT'
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.some((e) => e.message.includes('Passwords do not match')));
    });

    it('POST /api/v1/auth/register should forbid self-registration as ADMIN (400)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hacker Admin',
          email: 'hacker@test.local',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          role: 'ADMIN'
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.some((e) => e.message.includes('ADMIN is forbidden')));
    });
  });

  describe('Login Route Validation', () => {
    it('POST /api/v1/auth/login should reject empty body (400)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  describe('Protected Routes & Authentication Middleware', () => {
    it('GET /api/v1/users/profile should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/v1/users/profile');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('No access token provided'));
    });

    it('GET /api/v1/users/profile should reject invalid forged token (401)', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid_forged_jwt_token_123');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Invalid access token'));
    });
  });

  describe('Role-Based Access Control (RBAC) Enforcement', () => {
    it('Student should access student-only test endpoint (200)', async () => {
      const res = await request(app)
        .get('/api/v1/test/student-only')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.message.includes('Student Learning Area'));
    });

    it('Student should be forbidden from teacher-only endpoint (403)', async () => {
      const res = await request(app)
        .get('/api/v1/test/teacher-only')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Forbidden'));
    });

    it('Teacher should be forbidden from admin-only endpoint (403)', async () => {
      const res = await request(app)
        .get('/api/v1/test/admin-only')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Forbidden'));
    });

    it('Teacher should access teacher-only endpoint (200)', async () => {
      const res = await request(app)
        .get('/api/v1/test/teacher-only')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });

    it('Admin should access admin-only endpoint (200)', async () => {
      const res = await request(app)
        .get('/api/v1/test/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.message.includes('Administration Panel'));
    });
  });

});
