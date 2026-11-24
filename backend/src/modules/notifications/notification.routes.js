import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  notificationQuerySchema,
  teacherAnnouncementSchema,
  adminAnnouncementSchema,
  updateNotificationPreferencesSchema
} from './notification.validation.js';

const router = Router();

// All notification routes require authenticated user identity
router.use(authenticate);

/**
 * Personal Notifications Management
 */
router.get('/', validate(notificationQuerySchema, 'query'), NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

/**
 * User Preferences
 */
router.get('/preferences', NotificationController.getPreferences);
router.put('/preferences', validate(updateNotificationPreferencesSchema, 'body'), NotificationController.updatePreferences);

/**
 * Teacher Communication & Announcements
 */
router.post(
  '/announcements/teacher',
  authorize('TEACHER', 'ADMIN'),
  validate(teacherAnnouncementSchema, 'body'),
  NotificationController.createTeacherAnnouncement
);
router.get(
  '/announcements/teacher',
  authorize('TEACHER', 'ADMIN'),
  NotificationController.getTeacherAnnouncements
);
router.patch(
  '/announcements/teacher/:id/deactivate',
  authorize('TEACHER', 'ADMIN'),
  NotificationController.deactivateTeacherAnnouncement
);

/**
 * Admin Platform Governance Announcements
 */
router.post(
  '/announcements/admin',
  authorize('ADMIN'),
  validate(adminAnnouncementSchema, 'body'),
  NotificationController.createAdminAnnouncement
);
router.get(
  '/announcements/admin',
  authorize('ADMIN'),
  NotificationController.getAdminAnnouncements
);
router.patch(
  '/announcements/admin/:id/deactivate',
  authorize('ADMIN'),
  NotificationController.deactivateAdminAnnouncement
);

export default router;
