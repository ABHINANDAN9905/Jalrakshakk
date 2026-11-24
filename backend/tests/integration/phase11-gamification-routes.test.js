import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Phase 11: Gamification Frontend APIs Integration Tests', () => {
  const studentToken = generateAccessToken({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'student@jalrakshak.org',
    role: 'STUDENT'
  });

  const teacherToken = generateAccessToken({
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'teacher@jalrakshak.org',
    role: 'TEACHER'
  });

  describe('1. Mission Catalog & Filtering', () => {
    it('GET /api/v1/missions should return list of available missions', async () => {
      const res = await request(app)
        .get('/api/v1/missions')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
    });

    it('GET /api/v1/missions?category=RAINWATER_HARVESTING should filter missions by category', async () => {
      const res = await request(app)
        .get('/api/v1/missions?category=RAINWATER_HARVESTING')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      res.body.data.forEach((m) => {
        assert.strictEqual(m.category, 'RAINWATER_HARVESTING');
      });
    });

    it('GET /api/v1/missions/:id should retrieve mission details and tasks', async () => {
      const res = await request(app)
        .get('/api/v1/missions/m-101')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.id, 'm-101');
      assert.ok(Array.isArray(res.body.data.tasks));
    });

    it('POST /api/v1/missions/:id/start should start an eligible mission', async () => {
      const res = await request(app)
        .post('/api/v1/missions/m-101/start')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
    });
  });

  describe('2. Authoritative Task Evaluation Workflow', () => {
    it('POST /api/v1/missions/:id/tasks/:taskId/complete should reject submissions failing criteria (400)', async () => {
      const res = await request(app)
        .post('/api/v1/missions/m-101/tasks/t-101-1/complete')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          // Missing valid simulation results
          clientDecidedPassed: true
        });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /simulation/i);
    });

    it('POST /api/v1/missions/:id/tasks/:taskId/complete should pass with verified simulation data', async () => {
      const res = await request(app)
        .post('/api/v1/missions/m-101/tasks/t-101-1/complete')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          simulationId: 'sim-valid-001',
          waterBalance: { storagePercentage: 55 },
          sustainability: { overallScore: 78 }
        });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.taskPassed, true);
    });
  });

  describe('3. Challenges & Time-Bound Quests', () => {
    it('GET /api/v1/challenges should list active daily & weekly challenges', async () => {
      const res = await request(app)
        .get('/api/v1/challenges')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
    });

    it('POST /api/v1/challenges/:id/join should enroll student into challenge', async () => {
      const res = await request(app)
        .post('/api/v1/challenges/ch-daily-1/join')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.ok(res.statusCode === 200 || res.statusCode === 409);
    });

    it('GET /api/v1/challenges/my should list student enrolled challenges', async () => {
      const res = await request(app)
        .get('/api/v1/challenges/my')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  describe('4. XP Progression & Level Hierarchy Endpoints', () => {
    it('GET /api/v1/progression/me should return authoritative level, tier title, and XP', async () => {
      const res = await request(app)
        .get('/api/v1/progression/me')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.data.currentLevel >= 1);
      assert.ok(res.body.data.levelTitle);
      assert.ok(typeof res.body.data.currentXP === 'number');
    });

    it('GET /api/v1/xp/history should return XP transaction history ledger', async () => {
      const res = await request(app)
        .get('/api/v1/xp/history')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  describe('5. Achievements Catalog & Unlocked Badges', () => {
    it('GET /api/v1/achievements should return the 8 Phase 8 achievements catalog', async () => {
      const res = await request(app)
        .get('/api/v1/achievements')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.data.length >= 8);
    });

    it('GET /api/v1/achievements/my should list student unlocked badges', async () => {
      const res = await request(app)
        .get('/api/v1/achievements/my')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  describe('6. Privacy-Preserving Leaderboard', () => {
    it('GET /api/v1/leaderboard should return rankings without exposing emails or credentials', async () => {
      const res = await request(app)
        .get('/api/v1/leaderboard?type=TOTAL_XP')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.data));

      res.body.data.forEach((entry) => {
        assert.ok(entry.rank);
        assert.ok(entry.studentName);
        assert.strictEqual(entry.email, undefined);
        assert.strictEqual(entry.password, undefined);
      });
    });
  });

  describe('7. Teacher Mission Assignment & Supervisory RBAC', () => {
    it('POST /api/v1/teacher/missions/assign should be forbidden for STUDENT (403)', async () => {
      const res = await request(app)
        .post('/api/v1/teacher/missions/assign')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studentId: '123e4567-e89b-12d3-a456-426614174000',
          missionId: 'm-101'
        });

      assert.strictEqual(res.statusCode, 403);
    });

    it('GET /api/v1/teacher/missions/assignments should be accessible to TEACHER (200)', async () => {
      const res = await request(app)
        .get('/api/v1/teacher/missions/assignments')
        .set('Authorization', `Bearer ${teacherToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.data));
    });
  });
});
