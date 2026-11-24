import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Phase 13: Admin Dashboard & Platform Governance Integration Tests', () => {
  const adminId = '123e4567-e89b-12d3-a456-426614174099';
  const teacherId = '123e4567-e89b-12d3-a456-426614174001';
  const studentId = '123e4567-e89b-12d3-a456-426614174000';

  const adminToken = generateAccessToken({
    id: adminId,
    email: 'admin@jalrakshak.org',
    role: 'ADMIN'
  });

  const teacherToken = generateAccessToken({
    id: teacherId,
    email: 'teacher@jalrakshak.org',
    role: 'TEACHER'
  });

  const studentToken = generateAccessToken({
    id: studentId,
    email: 'student@jalrakshak.org',
    role: 'STUDENT'
  });

  describe('1. Authentication & Role-Based Access Control (RBAC) Enforcement', () => {
    it('GET /api/v1/admin/dashboard should permit ADMIN role (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data);
      assert.ok(res.body.data.overview);
    });

    it('GET /api/v1/admin/dashboard should forbid TEACHER role (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Forbidden|permission/i);
    });

    it('GET /api/v1/admin/dashboard should forbid STUDENT role (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Forbidden|permission/i);
    });

    it('GET /api/v1/admin/dashboard should reject unauthenticated requests (401 Unauthorized)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard');

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('2. User Management Endpoints', () => {
    it('GET /api/v1/admin/users should return paginated user accounts (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.users));
      assert.strictEqual(typeof res.body.data.total, 'number');
    });

    it('PATCH /api/v1/admin/users/:id/status should update user account status (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.isActive, false);

      // Restore active status
      await request(app)
        .patch(`/api/v1/admin/users/${studentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });
    });

    it('PATCH /api/v1/admin/users/:id/role should update user role (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'TEACHER' });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.role, 'TEACHER');

      // Revert back
      await request(app)
        .patch(`/api/v1/admin/users/${studentId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'STUDENT' });
    });
  });

  describe('3. Teacher Oversight Endpoints', () => {
    it('GET /api/v1/admin/teachers should return teachers with supervision details (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/teachers')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.teachers));
    });
  });

  describe('4. Village Management Endpoints', () => {
    it('GET /api/v1/admin/villages should return modeled villages (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/villages')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.villages));
    });

    it('POST /api/v1/admin/villages should create a new village model (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/villages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Narmada Valley Model',
          description: 'Alluvial and fractured basalt terrain in western Madhya Pradesh.',
          region: 'Narmada Basin',
          state: 'Madhya Pradesh',
          population: 3800
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.strictEqual(res.body.data.name, 'Narmada Valley Model');
    });
  });

  describe('5. Mission & Challenge Governance Endpoints', () => {
    it('GET /api/v1/admin/missions should return missions catalog (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/missions')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.missions));
    });

    it('POST /api/v1/admin/missions should author new mission (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/missions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Artificial Aquifer Recharge Wells',
          description: 'Deploy direct recharge shafts to channel clean runoff into confined aquifers.',
          category: 'RAINWATER_HARVESTING',
          difficulty: 'INTERMEDIATE',
          xpReward: 350
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.title, 'Artificial Aquifer Recharge Wells');
    });

    it('GET /api/v1/admin/challenges should return challenges (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/challenges')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    it('POST /api/v1/admin/challenges should create a new challenge (201 Created)', async () => {
      const now = new Date();
      const end = new Date(Date.now() + 5 * 24 * 3600 * 1000);

      const res = await request(app)
        .post('/api/v1/admin/challenges')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Flash Flood Harvesting Sprint',
          description: 'Capture peak storm runoff using community check dams within 5 days.',
          type: 'LIMITED_TIME',
          startDate: now.toISOString(),
          endDate: end.toISOString(),
          xpReward: 250
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.title, 'Flash Flood Harvesting Sprint');
    });
  });

  describe('6. Platform Analytics & Audit Logs Endpoints', () => {
    it('GET /api/v1/admin/analytics should return platform analytical metrics (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.userRoleDistribution);
    });

    it('GET /api/v1/admin/audit-logs should return audit ledger response (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.data);
      assert.ok(Array.isArray(res.body.data.logs));
    });
  });

  describe('7. System Health Diagnostics Endpoint', () => {
    it('GET /api/v1/admin/system-health should return health statuses without exposing secrets (200 OK)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/system-health')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.services);
      assert.strictEqual(res.body.data.services.backendApi.status, 'CONNECTED');

      // Zero credential exposure guarantee
      const bodyStr = JSON.stringify(res.body);
      assert.doesNotMatch(bodyStr, /postgres:\/\//i);
      assert.doesNotMatch(bodyStr, /mongodb:\/\//i);
      assert.doesNotMatch(bodyStr, /password|secret|jwt/i);
    });
  });
});
