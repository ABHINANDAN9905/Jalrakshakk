import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../../src/app.js';
import { generateAccessToken } from '../../src/utils/token.utils.js';
import { NotificationService } from '../../src/modules/notifications/notification.service.js';

describe('Phase 15: Notifications & Real-Time Communication Integration Tests', () => {
  const student1Id = '123e4567-e89b-12d3-a456-426614174000';
  const student2Id = '123e4567-e89b-12d3-a456-426614174002';
  const teacherId = '123e4567-e89b-12d3-a456-426614174001';
  const adminId = '123e4567-e89b-12d3-a456-426614174099';

  const student1Token = generateAccessToken({
    id: student1Id,
    email: 'student1@jalrakshak.org',
    role: 'STUDENT'
  });

  const student2Token = generateAccessToken({
    id: student2Id,
    email: 'student2@jalrakshak.org',
    role: 'STUDENT'
  });

  const teacherToken = generateAccessToken({
    id: teacherId,
    email: 'teacher@jalrakshak.org',
    role: 'TEACHER'
  });

  const adminToken = generateAccessToken({
    id: adminId,
    email: 'admin@jalrakshak.org',
    role: 'ADMIN'
  });

  beforeEach(() => {
    NotificationService._clearInMemoryState();
  });

  describe('1. Authentication Gateways & Authorization', () => {
    it('GET /api/v1/notifications should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/notifications');
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('GET /api/v1/notifications should return 200 OK for authenticated student', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data.notifications));
      assert.strictEqual(typeof res.body.data.unreadCount, 'number');
    });

    it('GET /api/v1/notifications/unread-count should return accurate unread tally', async () => {
      await NotificationService.createNotification({
        userId: student1Id,
        title: 'Unread Alert',
        message: 'You have unread content',
        category: 'MISSION_ASSIGNED'
      });

      const res = await request(app)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.unreadCount, 1);
    });
  });

  describe('2. Notification Actions & Cross-User Security', () => {
    it('PATCH /api/v1/notifications/:id/read should mark notification read for owner', async () => {
      const notif = await NotificationService.createNotification({
        userId: student1Id,
        title: 'Achievement Unlocked',
        message: 'Badge earned',
        category: 'ACHIEVEMENT_UNLOCKED'
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${notif.id}/read`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.isRead, true);
      assert.ok(res.body.data.readAt);
    });

    it('PATCH /api/v1/notifications/:id/read should reject cross-user access with 403 Forbidden', async () => {
      const notif = await NotificationService.createNotification({
        userId: student2Id,
        title: 'Student 2 Only',
        message: 'Private message',
        category: 'XP_EARNED'
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${notif.id}/read`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Forbidden/i);
    });

    it('DELETE /api/v1/notifications/:id should delete for owner and reject cross-user with 403', async () => {
      const notif = await NotificationService.createNotification({
        userId: student2Id,
        title: 'Student 2 Only',
        message: 'Private message',
        category: 'XP_EARNED'
      });

      // Student 1 cannot delete Student 2's notification
      const failRes = await request(app)
        .delete(`/api/v1/notifications/${notif.id}`)
        .set('Authorization', `Bearer ${student1Token}`);

      assert.strictEqual(failRes.statusCode, 403);

      // Student 2 can delete their own
      const successRes = await request(app)
        .delete(`/api/v1/notifications/${notif.id}`)
        .set('Authorization', `Bearer ${student2Token}`);

      assert.strictEqual(successRes.statusCode, 200);
      assert.strictEqual(successRes.body.data.success, true);
    });

    it('PATCH /api/v1/notifications/read-all should mark all notifications read for user', async () => {
      await NotificationService.createNotification({
        userId: student1Id,
        title: 'Alert 1',
        message: 'Msg 1',
        category: 'XP_EARNED'
      });
      await NotificationService.createNotification({
        userId: student1Id,
        title: 'Alert 2',
        message: 'Msg 2',
        category: 'XP_EARNED'
      });

      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.unreadCount, 0);
    });
  });

  describe('3. User Preferences Endpoints', () => {
    it('GET & PUT /api/v1/notifications/preferences should retrieve and update category toggles', async () => {
      const getRes = await request(app)
        .get('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${student1Token}`);

      assert.strictEqual(getRes.statusCode, 200);
      assert.ok(getRes.body.data.inAppCategories);

      const updateRes = await request(app)
        .put('/api/v1/notifications/preferences')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          inAppCategories: {
            CHALLENGE_STARTED: false
          }
        });

      assert.strictEqual(updateRes.statusCode, 200);
      assert.strictEqual(updateRes.body.data.inAppCategories.CHALLENGE_STARTED, false);
    });
  });

  describe('4. Teacher & Admin Announcements Endpoints', () => {
    it('POST /api/v1/notifications/announcements/teacher should permit TEACHER (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/announcements/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Classroom Water Audit Notice',
          message: 'Review chapter 4 and complete the village water budget simulation before next week.',
          targetStudentIds: [student1Id]
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.id);
      assert.strictEqual(res.body.data.deliveryCount, 1);
    });

    it('POST /api/v1/notifications/announcements/teacher should forbid STUDENT (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/announcements/teacher')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          title: 'Forged Student Announcement',
          message: 'Students should not be able to announce.'
        });

      assert.strictEqual(res.statusCode, 403);
    });

    it('POST /api/v1/notifications/announcements/admin should permit ADMIN and broadcast (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/notifications/announcements/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Version 2.0 Deployment',
          message: 'New hydrological models have been deployed to all virtual basins.',
          targetRole: 'ALL'
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.data.targetRole, 'ALL');
    });

    it('POST /api/v1/notifications/announcements/admin should forbid TEACHER and STUDENT (403 Forbidden)', async () => {
      const teacherRes = await request(app)
        .post('/api/v1/notifications/announcements/admin')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ title: 'Illegal Admin Post', message: 'Forbidden' });

      assert.strictEqual(teacherRes.statusCode, 403);

      const studentRes = await request(app)
        .post('/api/v1/notifications/announcements/admin')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ title: 'Illegal Admin Post', message: 'Forbidden' });

      assert.strictEqual(studentRes.statusCode, 403);
    });
  });
});
