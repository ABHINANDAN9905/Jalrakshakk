import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('JalRakshak Backend Health & Core Endpoints', () => {

  it('GET / - Should return 200 OK with server metadata', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.name, 'JalRakshak API');
    assert.equal(res.body.status, 'online');
  });

  it('GET /health - Should return 200 OK with healthy status and uptime', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.ok(typeof res.body.uptime === 'number');
    assert.ok(typeof res.body.timestamp === 'string');
  });

  it('GET /api/v1/status - Should return 200 OK operational message', async () => {
    const res = await request(app).get('/api/v1/status');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'JalRakshak API v1 is operational');
  });

  it('GET /unknown-route - Should return 404 JSON error response', async () => {
    const res = await request(app).get('/unknown-route');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.statusCode, 404);
    assert.ok(res.body.message.includes('Route not found'));
  });

});
