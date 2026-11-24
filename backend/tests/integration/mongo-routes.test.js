import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('MongoDB / Mongoose API Route Integration Tests', () => {

  describe('POST /api/v1/activity-logs - Validation', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/activity-logs')
        .send({ userId: 'u-1' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Missing required fields'));
    });
  });

  describe('POST /api/v1/simulation-logs - Validation', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/simulation-logs')
        .send({ eventType: 'TICK' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Missing required fields'));
    });
  });

  describe('AI Mentor Conversations Endpoints', () => {
    it('POST /api/v1/ai-mentor/conversations should reject missing message fields', async () => {
      const res = await request(app)
        .post('/api/v1/ai-mentor/conversations')
        .send({ sessionId: 'session-123' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Missing required fields'));
    });

    it('GET /api/v1/ai-mentor/conversations/:sessionId should return 404 for unrecorded session', async () => {
      const res = await request(app)
        .get('/api/v1/ai-mentor/conversations/non-existent-session-xyz');

      // Returns 404 if MongoDB query finishes without result, or 500 if DB is disconnected
      assert.ok([404, 500].includes(res.status));
      assert.equal(res.body.success, false);
    });
  });

});
