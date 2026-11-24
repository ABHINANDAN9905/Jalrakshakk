import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ActivityLog } from '../../src/modules/activity-logs/activityLog.model.js';
import { SimulationLog } from '../../src/modules/simulation-logs/simulationLog.model.js';
import { Conversation } from '../../src/modules/ai-mentor/conversation.model.js';
import { AuditLog } from '../../src/modules/audit-logs/auditLog.model.js';

describe('Mongoose Models Schema Validation Unit Tests', () => {

  describe('ActivityLog Schema Validation', () => {
    it('should validate a properly structured ActivityLog document', async () => {
      const doc = new ActivityLog({
        userId: 'user-uuid-1',
        villageId: 'village-uuid-1',
        activityType: 'APPLY_INTERVENTION',
        description: 'Constructed check dam along seasonal stream',
        metadata: { structureType: 'CHECK_DAM', capacityM3: 1500 }
      });
      let error = null;
      try {
        await doc.validate();
      } catch (err) {
        error = err;
      }
      assert.equal(error, null);
      assert.equal(doc.activityType, 'APPLY_INTERVENTION');
      assert.ok(doc.timestamp instanceof Date);
    });

    it('should reject invalid activityType and missing required fields', async () => {
      const doc = new ActivityLog({
        activityType: 'INVALID_ACTIVITY_ACTION'
      });
      let error = null;
      try {
        await doc.validate();
      } catch (err) {
        error = err;
      }
      assert.ok(error !== null);
      assert.ok(error.errors.userId, 'userId should be required');
      assert.ok(error.errors.villageId, 'villageId should be required');
      assert.ok(error.errors.description, 'description should be required');
      assert.ok(error.errors.activityType, 'invalid activityType should trigger error');
    });
  });

  describe('SimulationLog Schema Validation', () => {
    it('should validate a correct SimulationLog entry', async () => {
      const doc = new SimulationLog({
        userId: 'user-uuid-1',
        villageId: 'village-uuid-1',
        simulationRunId: 'run-uuid-1',
        eventType: 'TICK',
        rainfall: 25.5,
        recharge: 1200.0,
        extraction: 850.0,
        storageIndex: 0.68,
        metadata: { tickNumber: 12 }
      });
      let error = null;
      try {
        await doc.validate();
      } catch (err) {
        error = err;
      }
      assert.equal(error, null);
      assert.equal(doc.storageIndex, 0.68);
    });

    it('should reject storageIndex outside of 0.0 to 1.0 range', async () => {
      const doc = new SimulationLog({
        userId: 'u-1',
        villageId: 'v-1',
        simulationRunId: 'r-1',
        eventType: 'TICK',
        storageIndex: 1.5 // Invalid, exceeds 1.0
      });
      let error = null;
      try {
        await doc.validate();
      } catch (err) {
        error = err;
      }
      assert.ok(error !== null);
      assert.ok(error.errors.storageIndex, 'storageIndex above 1.0 must fail validation');
    });
  });

  describe('Conversation Schema Validation', () => {
    it('should validate an AI Mentor conversation thread with messages', async () => {
      const doc = new Conversation({
        userId: 'user-uuid-1',
        sessionId: 'session-xyz-101',
        villageId: 'village-uuid-1',
        topic: 'Basaltic Aquifer Recharge Strategies',
        messages: [
          { role: 'user', content: 'Why did my aquifer level drop after harvest?' },
          { role: 'assistant', content: 'Post-monsoon sugarcane extraction exceeded natural recharge.' }
        ]
      });
      let error = null;
      try {
        await doc.validate();
      } catch (err) {
        error = err;
      }
      assert.equal(error, null);
      assert.equal(doc.messages.length, 2);
      assert.equal(doc.messages[0].role, 'user');
    });

    it('should reject invalid message role', async () => {
      const doc = new Conversation({
        userId: 'u-1',
        sessionId: 's-1',
        messages: [
          { role: 'unauthorized_bot', content: 'Hello' }
        ]
      });
      let error = null;
      try {
        await doc.validate();
      } catch (err) {
        error = err;
      }
      assert.ok(error !== null);
    });
  });

  describe('AuditLog Schema Validation', () => {
    it('should validate a security/administrative AuditLog document', async () => {
      const doc = new AuditLog({
        actorId: 'admin-uuid-1',
        action: 'UPDATE_SYSTEM_SETTINGS',
        resource: 'SimulationConfig',
        resourceId: 'config-1',
        metadata: { previousRate: 2000, newRate: 1500 }
      });
      let error = null;
      try {
        await doc.validate();
      } catch (err) {
        error = err;
      }
      assert.equal(error, null);
      assert.equal(doc.action, 'UPDATE_SYSTEM_SETTINGS');
    });

    it('should reject AuditLog missing actorId, action, or resource', async () => {
      const doc = new AuditLog({});
      let error = null;
      try {
        await doc.validate();
      } catch (err) {
        error = err;
      }
      assert.ok(error !== null);
      assert.ok(error.errors.actorId);
      assert.ok(error.errors.action);
      assert.ok(error.errors.resource);
    });
  });

});
