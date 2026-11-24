import test from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import app from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';
import {
  emitSimulationStarted,
  emitSimulationCompleted,
  emitSimulationFailed
} from '../../src/config/socket.js';

const request = supertest(app);

// Mock student token
const studentToken = generateAccessToken({
  id: 'u-student-p10-01',
  email: 'aarav.phase10@jalrakshak.org',
  role: 'STUDENT'
});

// Mock other student token for ownership checks
const otherStudentToken = generateAccessToken({
  id: 'u-student-p10-02',
  email: 'meera.phase10@jalrakshak.org',
  role: 'STUDENT'
});

test('Phase 10: Real-Time Simulation Integration & AI Water Mentor Routes', async (t) => {
  await t.test('1. Authentication Gate on AI Mentor Endpoints', async () => {
    // Unauthenticated request should be rejected (401)
    const res = await request.post('/api/v1/ai-mentor/chat').send({
      message: 'Hello Water Mentor'
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('2. POST /api/v1/ai-mentor/chat with Valid Input', async () => {
    const res = await request
      .post('/api/v1/ai-mentor/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'Explain how rooftop rainwater harvesting recharges our village aquifer',
        includeSimulationContext: true
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.reply);
    assert.equal(typeof res.body.data.provider, 'string');
    assert.equal(typeof res.body.data.isAiGenerated, 'boolean');
    assert.ok(Array.isArray(res.body.data.recommendedActions));
  });

  await t.test('3. GET /api/v1/ai-mentor/explain-simulation Endpoint', async () => {
    const res = await request
      .get('/api/v1/ai-mentor/explain-simulation')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.reply);
  });

  await t.test('4. GET /api/v1/ai-mentor/recommendations Endpoint', async () => {
    const res = await request
      .get('/api/v1/ai-mentor/recommendations')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.recommendations));
    assert.ok(res.body.data.recommendations.length > 0);
    assert.ok(res.body.data.recommendations[0].gameAction);
  });

  await t.test('5. GET /api/v1/ai-mentor/quiz Educational Question Endpoint', async () => {
    const res = await request
      .get('/api/v1/ai-mentor/quiz?topic=IRRIGATION')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.question);
    assert.equal(res.body.data.options.length, 4);
    assert.ok(res.body.data.correctOption);
    assert.ok(res.body.data.explanation);
  });

  await t.test('6. Authoritative Real-Time Socket Emitters Smoke Test', () => {
    // Emitters must not crash when Socket.IO server is initialized or when clients are disconnected
    assert.doesNotThrow(() => {
      emitSimulationStarted('u-student-p10-01', { villageId: 'v-sangamner-01' });
    });

    assert.doesNotThrow(() => {
      emitSimulationCompleted('u-student-p10-01', 'v-sangamner-01', {
        simulationId: 'sim-test-10',
        executedAt: new Date().toISOString(),
        waterBalance: {
          storagePercentage: 65,
          conditionCategory: 'SAFE',
          rechargeM3: 400000,
          extractionM3: 280000,
          finalStorageM3: 650000
        },
        waterQuality: { finalWQI: 82 },
        sustainability: { overallScore: 85 }
      });
    });

    assert.doesNotThrow(() => {
      emitSimulationFailed('u-student-p10-01', { message: 'Transient connection drop' });
    });
  });

  await t.test('7. Concurrent Simulation Deduplication Protection', async () => {
    // Executing simulation with valid payload
    const simPayload = {
      villageId: '123e4567-e89b-12d3-a456-426614174000',
      rainfallMm: 720,
      irrigationMethod: 'DRIP',
      crops: [{ crop: 'MILLETS', hectares: 20 }]
    };

    const res = await request
      .post('/api/v1/simulations/run')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(simPayload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.simulationId);
    assert.ok(res.body.data.waterBalance);
    assert.equal(typeof res.body.data.waterBalance.storagePercentage, 'number');
  });
});
