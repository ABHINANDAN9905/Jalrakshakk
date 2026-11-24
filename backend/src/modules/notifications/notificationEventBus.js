import EventEmitter from 'node:events';

/**
 * Central Event-Driven Notification Bus for JalRakshak
 */
class NotificationEventBus extends EventEmitter {}

export const notificationEventBus = new NotificationEventBus();

// Maximum listeners setting to support high concurrent event emission
notificationEventBus.setMaxListeners(50);

export const NOTIFICATION_BUS_EVENTS = {
  MISSION_ASSIGNED: 'notification:mission_assigned',
  MISSION_COMPLETED: 'notification:mission_completed',
  XP_EARNED: 'notification:xp_earned',
  LEVEL_UNLOCKED: 'notification:level_unlocked',
  ACHIEVEMENT_UNLOCKED: 'notification:achievement_unlocked',
  CHALLENGE_STARTED: 'notification:challenge_started',
  CHALLENGE_ENDING_SOON: 'notification:challenge_ending_soon',
  TEACHER_ANNOUNCEMENT: 'notification:teacher_announcement',
  ASSIGNMENT_DEADLINE_APPROACHING: 'notification:assignment_deadline_approaching',
  ASSIGNMENT_OVERDUE: 'notification:assignment_overdue',
  STUDENT_PROGRESS_UPDATE: 'notification:student_progress_update',
  PLATFORM_ANNOUNCEMENT: 'notification:platform_announcement'
};
