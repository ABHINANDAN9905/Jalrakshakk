import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Phase 8: Gamification, Missions, Progression & Challenge Routes', () => {

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

  describe('1. Mission Discovery & Execution Routes', () => {
    it('GET /api/v1/missions should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/v1/missions');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('GET /api/v1/missions should return missions catalog for student (200)', async () => {
      const res = await request(app)
        .get('/api/v1/missions')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
    });

    it('GET /api/v1/missions/:id should return mission details and tasks (200)', async () => {
      const res = await request(app)
        .get('/api/v1/missions/m-101')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, 'm-101');
      assert.ok(Array.isArray(res.body.data.tasks));
      assert.ok(res.body.data.tasks.length >= 2);
    });

    it('POST /api/v1/missions/:id/start should initialize mission for student (200)', async () => {
      const res = await request(app)
        .post('/api/v1/missions/m-101/start')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.progress);
    });

    it('POST /api/v1/missions/:id/tasks/:taskId/complete should reject non-compliant submission (400)', async () => {
      const res = await request(app)
        .post('/api/v1/missions/m-101/tasks/t-101-2/complete')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          waterBalance: { storagePercentage: 25.0 } // Requires >= 40%
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('below the target'));
    });

    it('POST /api/v1/missions/:id/tasks/:taskId/complete should approve compliant simulation result (200)', async () => {
      const res = await request(app)
        .post('/api/v1/missions/m-101/tasks/t-101-2/complete')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          waterBalance: { storagePercentage: 55.0 }
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.taskPassed, true);
      assert.ok(res.body.data.awardedTaskXP > 0);
    });
  });

  describe('2. Progression & XP Ledger Routes', () => {
    it('GET /api/v1/progression/me should return student level and XP info (200)', async () => {
      const res = await request(app)
        .get('/api/v1/progression/me')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.currentLevel >= 1);
      assert.ok(res.body.data.levelTitle);
    });

    it('GET /api/v1/xp/history should return XP transaction history (200)', async () => {
      const res = await request(app)
        .get('/api/v1/xp/history')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  describe('3. Achievements & Challenges Routes', () => {
    it('GET /api/v1/achievements should return achievements catalog (200)', async () => {
      const res = await request(app)
        .get('/api/v1/achievements')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.length >= 8);
    });

    it('GET /api/v1/challenges should return active challenges (200)', async () => {
      const res = await request(app)
        .get('/api/v1/challenges')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.length > 0);
    });

    it('POST /api/v1/challenges/:id/join should enroll student into challenge (200)', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-daily-1/join')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });

  describe('4. Classroom Mission Assignments (Teacher RBAC)', () => {
    const validStudentId = 'a0000000-0000-0000-0000-000000000001';

    it('POST /api/v1/teacher/missions/assign should forbid STUDENT role (403)', async () => {
      const res = await request(app)
        .post('/api/v1/teacher/missions/assign')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studentId: validStudentId,
          missionId: 'm-101'
        });

      assert.equal(res.status, 403);
    });

    it('GET /api/v1/teacher/missions/assignments should allow TEACHER role (200)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/missions/assignments')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
    });
  });

  describe('5. Admin Mission Governance (Admin RBAC)', () => {
    it('POST /api/v1/admin/missions should forbid STUDENT role (403)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/missions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Mission',
          description: 'Hacked Mission Description',
          category: 'GROUNDWATER_CONSERVATION'
        });

      assert.equal(res.status, 403);
    });

    it('POST /api/v1/admin/missions should forbid TEACHER role (403)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/missions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Unauthorized Mission',
          description: 'Hacked Mission Description',
          category: 'GROUNDWATER_CONSERVATION'
        });

      assert.equal(res.status, 403);
    });

    it('POST /api/v1/admin/missions should reject invalid body for ADMIN (400)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/missions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  describe('6. Leaderboard Ranking & Privacy Protection', () => {
    it('GET /api/v1/leaderboard should return student ranking without exposing private emails (200)', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard?type=TOTAL_XP')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      // Verify no sensitive credentials leaked
      for (const row of res.body.data) {
        assert.equal(row.email, undefined);
        assert.equal(row.passwordHash, undefined);
        assert.ok(row.rank >= 1);
        assert.ok(row.studentName);
      }
    });
  });

});
