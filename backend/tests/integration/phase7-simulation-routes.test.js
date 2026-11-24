import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';

describe('Phase 7: Simulation & Groundwater Routes Integration Tests', () => {

  const studentToken = generateAccessToken({
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'student@test.local',
    role: 'STUDENT'
  });

  const validVillageId = '123e4567-e89b-12d3-a456-426614174000';

  describe('Educational Scenarios Endpoints', () => {
    it('GET /api/v1/simulations/scenarios should reject unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/v1/simulations/scenarios');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('GET /api/v1/simulations/scenarios should return 6 educational scenarios (200)', async () => {
      const res = await request(app)
        .get('/api/v1/simulations/scenarios')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.length, 6);
      assert.ok(res.body.data.some((s) => s.id === 'NORMAL_MONSOON'));
      assert.ok(res.body.data.some((s) => s.id === 'DROUGHT_YEAR'));
    });

    it('GET /api/v1/simulations/scenarios/:scenarioId should return details for valid scenario (200)', async () => {
      const res = await request(app)
        .get('/api/v1/simulations/scenarios/NORMAL_MONSOON')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, 'NORMAL_MONSOON');
      assert.ok(res.body.data.initialConditions);
    });

    it('GET /api/v1/simulations/scenarios/:scenarioId should return 404 for unknown scenario', async () => {
      const res = await request(app)
        .get('/api/v1/simulations/scenarios/NON_EXISTENT_SCENARIO')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });

  describe('Simulation Execution Endpoints', () => {
    it('POST /api/v1/simulations/run should reject unauthenticated request (401)', async () => {
      const res = await request(app)
        .post('/api/v1/simulations/run')
        .send({ villageId: validVillageId });

      assert.equal(res.status, 401);
    });

    it('POST /api/v1/simulations/run should reject missing villageId (400)', async () => {
      const res = await request(app)
        .post('/api/v1/simulations/run')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ rainfallMm: 600 });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.some((e) => e.field === 'villageId'));
    });

    it('POST /api/v1/simulations/run should execute simulation and return scientific balance (201)', async () => {
      const res = await request(app)
        .post('/api/v1/simulations/run')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          villageId: validVillageId,
          scenarioId: 'SUSTAINABLE_FARMING',
          season: 'Post-Monsoon',
          rainfallMm: 550,
          irrigationMethod: 'DRIP',
          crops: [{ crop: 'MILLETS', hectares: 30 }]
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.waterBalance);
      assert.ok(res.body.data.sustainability);
      assert.ok(res.body.data.waterQuality);
      assert.equal(res.body.data.waterBalance.rainfallMm, 550);
      assert.ok(res.body.data.sustainability.overallScore >= 0);
    });
  });

  describe('Groundwater Monitoring Endpoints', () => {
    it('GET /api/v1/groundwater/villages/:villageId should reject non-UUID params (400)', async () => {
      const res = await request(app)
        .get('/api/v1/groundwater/villages/not-a-uuid')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('GET /api/v1/groundwater/villages/:villageId/history should reject non-UUID params (400)', async () => {
      const res = await request(app)
        .get('/api/v1/groundwater/villages/not-a-uuid/history')
        .set('Authorization', `Bearer ${studentToken}`);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

});
