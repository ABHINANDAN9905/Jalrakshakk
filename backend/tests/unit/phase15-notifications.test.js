import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NotificationService } from '../../src/modules/notifications/notification.service.js';
import { NOTIFICATION_CATEGORIES } from '../../src/modules/notifications/notification.model.js';

describe('Phase 15: Central Notifications & Communication Unit Tests', () => {
  const student1Id = '123e4567-e89b-12d3-a456-426614174000';
  const student2Id = '123e4567-e89b-12d3-a456-426614174002';
  const unassignedStudentId = '123e4567-e89b-12d3-a456-426614174999';

  const teacherUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Priya Sharma (Teacher)',
    email: 'teacher@jalrakshak.org',
    role: 'TEACHER'
  };

  const adminUser = {
    id: '123e4567-e89b-12d3-a456-426614174099',
    name: 'Platform Admin',
    email: 'admin@jalrakshak.org',
    role: 'ADMIN'
  };

  beforeEach(() => {
    NotificationService._clearInMemoryState();
  });

  describe('1. Notification Creation, Categories & Deduplication', () => {
    it('should create notification with valid category, title, message, and unread status', async () => {
      const notif = await NotificationService.createNotification({
        userId: student1Id,
        title: 'Mission Assigned',
        message: 'You have been assigned: Alluvial Aquifer Survey',
        category: 'MISSION_ASSIGNED',
        actionUrl: '/missions'
      });

      assert.ok(notif);
      assert.ok(notif.id);
      assert.strictEqual(notif.userId, student1Id);
      assert.strictEqual(notif.isRead, false);
      assert.strictEqual(notif.readAt, null);
      assert.strictEqual(notif.category, 'MISSION_ASSIGNED');
    });

    it('should prevent duplicate notifications with same dedupKey', async () => {
      const dedupKey = 'MISSION_ASSIGNED:assignment-xyz';

      const first = await NotificationService.createNotification({
        userId: student1Id,
        title: 'Mission Assigned',
        message: 'First attempt',
        category: 'MISSION_ASSIGNED',
        dedupKey
      });

      const second = await NotificationService.createNotification({
        userId: student1Id,
        title: 'Mission Assigned',
        message: 'Duplicate attempt',
        category: 'MISSION_ASSIGNED',
        dedupKey
      });

      assert.strictEqual(first.id, second.id);
      assert.strictEqual(second.message, 'First attempt');

      const { total } = await NotificationService.getNotifications(student1Id);
      assert.strictEqual(total, 1);
    });

    it('should respect user notification preferences when category is disabled', async () => {
      // Disable CHALLENGE_STARTED in preferences
      await NotificationService.updatePreferences(student1Id, {
        inAppCategories: { CHALLENGE_STARTED: false }
      });

      const notif = await NotificationService.createNotification({
        userId: student1Id,
        title: 'Daily Challenge Started',
        message: 'New challenge is live!',
        category: 'CHALLENGE_STARTED'
      });

      assert.strictEqual(notif, null);

      const { total } = await NotificationService.getNotifications(student1Id);
      assert.strictEqual(total, 0);
    });
  });

  describe('2. Read Status & Lifecycle Management', () => {
    it('should mark single notification as read and record timestamp', async () => {
      const created = await NotificationService.createNotification({
        userId: student1Id,
        title: 'XP Earned',
        message: '+150 XP credited',
        category: 'XP_EARNED'
      });

      const updated = await NotificationService.markAsRead(student1Id, created.id);
      assert.strictEqual(updated.isRead, true);
      assert.ok(updated.readAt);

      const count = await NotificationService.getUnreadCount(student1Id);
      assert.strictEqual(count.unreadCount, 0);
    });

    it('should mark all unread notifications as read', async () => {
      await NotificationService.createNotification({
        userId: student1Id,
        title: 'Notif 1',
        message: 'Message 1',
        category: 'XP_EARNED'
      });
      await NotificationService.createNotification({
        userId: student1Id,
        title: 'Notif 2',
        message: 'Message 2',
        category: 'LEVEL_UNLOCKED'
      });

      const initialCount = await NotificationService.getUnreadCount(student1Id);
      assert.strictEqual(initialCount.unreadCount, 2);

      const markResult = await NotificationService.markAllAsRead(student1Id);
      assert.strictEqual(markResult.modifiedCount, 2);

      const finalCount = await NotificationService.getUnreadCount(student1Id);
      assert.strictEqual(finalCount.unreadCount, 0);
    });

    it('should delete notification successfully', async () => {
      const created = await NotificationService.createNotification({
        userId: student1Id,
        title: 'To Delete',
        message: 'Will be deleted',
        category: 'PLATFORM_ANNOUNCEMENT'
      });

      const res = await NotificationService.deleteNotification(student1Id, created.id);
      assert.strictEqual(res.success, true);

      const { total } = await NotificationService.getNotifications(student1Id);
      assert.strictEqual(total, 0);
    });
  });

  describe('3. Security & Ownership Authorization', () => {
    it('should forbid student 1 from marking student 2 notification as read', async () => {
      const created = await NotificationService.createNotification({
        userId: student2Id,
        title: 'Student 2 Private Alert',
        message: 'Private message',
        category: 'XP_EARNED'
      });

      await assert.rejects(
        async () => {
          await NotificationService.markAsRead(student1Id, created.id);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          assert.match(err.message, /Forbidden/i);
          return true;
        }
      );
    });

    it('should forbid student 1 from deleting student 2 notification', async () => {
      const created = await NotificationService.createNotification({
        userId: student2Id,
        title: 'Student 2 Alert',
        message: 'Private message',
        category: 'XP_EARNED'
      });

      await assert.rejects(
        async () => {
          await NotificationService.deleteNotification(student1Id, created.id);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );
    });
  });

  describe('4. Teacher & Admin Announcements Authorization', () => {
    it('should allow teacher to announce to supervised students and create individual notifications', async () => {
      const announcement = await NotificationService.createTeacherAnnouncement(teacherUser, {
        title: 'Exam Preparation Workshop',
        message: 'Please complete the Drip Irrigation module by Friday.',
        targetStudentIds: [student1Id, student2Id]
      });

      assert.ok(announcement);
      assert.strictEqual(announcement.authorId, teacherUser.id);
      assert.strictEqual(announcement.authorRole, 'TEACHER');
      assert.strictEqual(announcement.deliveryCount, 2);

      // Verify recipient received notification
      const { notifications } = await NotificationService.getNotifications(student1Id);
      assert.strictEqual(notifications.length, 1);
      assert.strictEqual(notifications[0].category, 'TEACHER_ANNOUNCEMENT');
      assert.match(notifications[0].title, /Teacher Announcement/);
    });

    it('should forbid teacher from sending announcements to unsupervised students', async () => {
      await assert.rejects(
        async () => {
          await NotificationService.createTeacherAnnouncement(teacherUser, {
            title: 'Unauthorized Broadcast',
            message: 'Attempting to message unknown student',
            targetStudentIds: [unassignedStudentId]
          });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          assert.match(err.message, /unsupervised/i);
          return true;
        }
      );
    });

    it('should allow admin to create platform announcements with role targeting', async () => {
      const announcement = await NotificationService.createAdminAnnouncement(adminUser, {
        title: 'Scheduled Maintenance Notice',
        message: 'Platform simulation servers will undergo maintenance at 2 AM IST.',
        targetRole: 'ALL'
      });

      assert.ok(announcement);
      assert.strictEqual(announcement.authorRole, 'ADMIN');
      assert.strictEqual(announcement.targetRole, 'ALL');
      assert.strictEqual(announcement.isActive, true);

      const list = await NotificationService.getAdminAnnouncements();
      assert.ok(list.length >= 1);
    });
  });
});
