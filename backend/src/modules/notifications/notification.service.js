import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../config/database.js';
import {
  Notification,
  Announcement,
  NotificationPreference,
  NOTIFICATION_CATEGORIES
} from './notification.model.js';
import {
  emitNotificationToUser,
  emitNotificationReadToUser,
  emitUnreadCountToUser,
  emitAnnouncementToRole
} from '../../config/socket.js';
import { notificationEventBus, NOTIFICATION_BUS_EVENTS } from './notificationEventBus.js';

// In-memory fallbacks when MongoDB is offline or in unseeded test environments
const inMemoryNotifications = new Map(); // id -> notification
const inMemoryAnnouncements = new Map(); // id -> announcement
const inMemoryPreferences = new Map();   // userId -> preferences

let isDbOffline = false;

// Default supervised mock students for offline teacher authorization fallback
const DEFAULT_SUPERVISED_STUDENTS = [
  '123e4567-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174002',
  '123e4567-e89b-12d3-a456-426614174003',
  '123e4567-e89b-12d3-a456-426614174004'
];

/**
 * Check if MongoDB connection is active
 */
function isMongoAvailable() {
  return mongoose.connection.readyState === 1;
}

export class NotificationService {
  /**
   * Helper: Get user's active notification preferences
   */
  static async getPreferences(userId) {
    if (isMongoAvailable()) {
      try {
        let prefs = await NotificationPreference.findOne({ userId });
        if (!prefs) {
          prefs = await NotificationPreference.create({ userId });
        }
        return prefs.toJSON();
      } catch (err) {
        // Fallback to in-memory
      }
    }

    if (!inMemoryPreferences.has(userId)) {
      inMemoryPreferences.set(userId, {
        userId,
        emailEnabled: false,
        smsEnabled: false,
        pushEnabled: false,
        inAppCategories: NOTIFICATION_CATEGORIES.reduce((acc, cat) => {
          acc[cat] = true;
          return acc;
        }, {})
      });
    }

    return inMemoryPreferences.get(userId);
  }

  /**
   * Helper: Update notification preferences
   */
  static async updatePreferences(userId, updateData = {}) {
    if (isMongoAvailable()) {
      try {
        const prefs = await NotificationPreference.findOneAndUpdate(
          { userId },
          { $set: updateData },
          { new: true, upsert: true }
        );
        return prefs.toJSON();
      } catch (err) {}
    }

    const current = await this.getPreferences(userId);
    const updated = {
      ...current,
      ...updateData,
      inAppCategories: {
        ...current.inAppCategories,
        ...(updateData.inAppCategories || {})
      }
    };
    inMemoryPreferences.set(userId, updated);
    return updated;
  }

  /**
   * 1. Create a notification with deduplication, preferences check, persistence, and real-time socket emit
   */
  static async createNotification(payload) {
    const {
      userId,
      title,
      message,
      category,
      relatedEntity = null,
      actionUrl = null,
      dedupKey = null,
      metadata = {}
    } = payload;

    if (!userId || !title || !message || !category) {
      throw new Error('userId, title, message, and category are required.');
    }

    // 1. Deduplication check
    if (dedupKey) {
      if (isMongoAvailable()) {
        try {
          const existing = await Notification.findOne({ userId, dedupKey });
          if (existing) {
            return { ...existing.toJSON(), isPersisted: true };
          }
        } catch (err) {}
      }

      // In-memory dedup check
      for (const notif of inMemoryNotifications.values()) {
        if (notif.userId === userId && notif.dedupKey === dedupKey) {
          return { ...notif, isPersisted: false };
        }
      }
    }

    // 2. Preferences check
    const prefs = await this.getPreferences(userId);
    if (prefs.inAppCategories && prefs.inAppCategories[category] === false) {
      return null; // User opted out of this category
    }

    // 3. Persistence
    let result = null;
    let isPersisted = false;

    if (isMongoAvailable()) {
      try {
        const doc = await Notification.create({
          userId,
          title,
          message,
          category,
          relatedEntity,
          actionUrl,
          dedupKey,
          metadata
        });
        result = doc.toJSON();
        isPersisted = true;
      } catch (err) {
        // Fallback if Mongo operation fails
        isPersisted = false;
      }
    }

    if (!result) {
      const id = randomUUID();
      result = {
        id,
        _id: id,
        userId,
        title,
        message,
        category,
        isRead: false,
        readAt: null,
        relatedEntity,
        actionUrl,
        dedupKey,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryNotifications.set(id, result);
    }

    const finalNotif = {
      ...result,
      id: result.id || result._id?.toString(),
      isPersisted
    };

    // 4. Real-time Socket.IO emission to recipient's private room
    emitNotificationToUser(userId, finalNotif);

    // 5. Update unread count over socket
    try {
      const { unreadCount } = await this.getUnreadCount(userId);
      emitUnreadCountToUser(userId, unreadCount);
    } catch (e) {}

    return finalNotif;
  }

  /**
   * 2. List notifications for current user with pagination and filters
   */
  static async getNotifications(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page || 1, 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
    const skip = (page - 1) * limit;
    const category = query.category;
    const unreadOnly = query.unreadOnly === true || query.unreadOnly === 'true';

    if (isMongoAvailable()) {
      try {
        const filter = { userId };
        if (category) filter.category = category;
        if (unreadOnly) filter.isRead = false;

        const [docs, total, unreadCount] = await Promise.all([
          Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          Notification.countDocuments(filter),
          Notification.countDocuments({ userId, isRead: false })
        ]);

        return {
          notifications: docs.map((d) => ({
            ...d.toJSON(),
            id: d._id.toString(),
            isPersisted: true
          })),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
          unreadCount,
          isPersisted: true,
          persistenceStatus: 'PERSISTED'
        };
      } catch (err) {}
    }

    // In-memory fallback
    let list = Array.from(inMemoryNotifications.values()).filter((n) => n.userId === userId);
    if (category) list = list.filter((n) => n.category === category);
    if (unreadOnly) list = list.filter((n) => !n.isRead);

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);
    const unreadCount = Array.from(inMemoryNotifications.values()).filter(
      (n) => n.userId === userId && !n.isRead
    ).length;

    return {
      notifications: paginated.map((n) => ({ ...n, isPersisted: false })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      unreadCount,
      isPersisted: false,
      persistenceStatus: 'IN_MEMORY_OFFLINE'
    };
  }

  /**
   * 3. Get total unread notifications count
   */
  static async getUnreadCount(userId) {
    if (isMongoAvailable()) {
      try {
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });
        return { unreadCount, isPersisted: true };
      } catch (err) {}
    }

    const unreadCount = Array.from(inMemoryNotifications.values()).filter(
      (n) => n.userId === userId && !n.isRead
    ).length;

    return { unreadCount, isPersisted: false };
  }

  /**
   * 4. Mark single notification as read (with strict user ownership check)
   */
  static async markAsRead(userId, notificationId) {
    if (isMongoAvailable()) {
      try {
        const notif = await Notification.findById(notificationId);
        if (notif) {
          if (notif.userId !== userId) {
            const err = new Error('Forbidden: You do not have permission to access this notification.');
            err.statusCode = 403;
            throw err;
          }
          notif.isRead = true;
          notif.readAt = new Date();
          await notif.save();

          const result = { ...notif.toJSON(), id: notif._id.toString(), isPersisted: true };
          const { unreadCount } = await this.getUnreadCount(userId);
          emitNotificationReadToUser(userId, { notificationId, unreadCount });
          emitUnreadCountToUser(userId, unreadCount);
          return result;
        }
      } catch (err) {
        if (err.statusCode) throw err;
      }
    }

    // In-memory fallback
    const notif = inMemoryNotifications.get(notificationId);
    if (!notif) {
      const err = new Error('Notification not found.');
      err.statusCode = 404;
      throw err;
    }

    if (notif.userId !== userId) {
      const err = new Error('Forbidden: You do not have permission to access this notification.');
      err.statusCode = 403;
      throw err;
    }

    notif.isRead = true;
    notif.readAt = new Date();
    notif.updatedAt = new Date();
    inMemoryNotifications.set(notificationId, notif);

    const { unreadCount } = await this.getUnreadCount(userId);
    emitNotificationReadToUser(userId, { notificationId, unreadCount });
    emitUnreadCountToUser(userId, unreadCount);

    return { ...notif, isPersisted: false };
  }

  /**
   * 5. Mark all unread notifications as read
   */
  static async markAllAsRead(userId) {
    let modifiedCount = 0;

    if (isMongoAvailable()) {
      try {
        const updateRes = await Notification.updateMany(
          { userId, isRead: false },
          { $set: { isRead: true, readAt: new Date() } }
        );
        modifiedCount = updateRes.modifiedCount || 0;
      } catch (err) {}
    }

    // Update in-memory
    for (const notif of inMemoryNotifications.values()) {
      if (notif.userId === userId && !notif.isRead) {
        notif.isRead = true;
        notif.readAt = new Date();
        modifiedCount++;
      }
    }

    emitUnreadCountToUser(userId, 0);

    return {
      success: true,
      modifiedCount,
      unreadCount: 0
    };
  }

  /**
   * 6. Delete notification (with strict user ownership check)
   */
  static async deleteNotification(userId, notificationId) {
    if (isMongoAvailable()) {
      try {
        const notif = await Notification.findById(notificationId);
        if (notif) {
          if (notif.userId !== userId) {
            const err = new Error('Forbidden: You do not have permission to delete this notification.');
            err.statusCode = 403;
            throw err;
          }
          await Notification.findByIdAndDelete(notificationId);
          const { unreadCount } = await this.getUnreadCount(userId);
          emitUnreadCountToUser(userId, unreadCount);
          return { success: true, deletedId: notificationId };
        }
      } catch (err) {
        if (err.statusCode) throw err;
      }
    }

    const notif = inMemoryNotifications.get(notificationId);
    if (!notif) {
      const err = new Error('Notification not found.');
      err.statusCode = 404;
      throw err;
    }

    if (notif.userId !== userId) {
      const err = new Error('Forbidden: You do not have permission to delete this notification.');
      err.statusCode = 403;
      throw err;
    }

    inMemoryNotifications.delete(notificationId);
    const { unreadCount } = await this.getUnreadCount(userId);
    emitUnreadCountToUser(userId, unreadCount);

    return { success: true, deletedId: notificationId };
  }

  /**
   * 7. Teacher Announcements: Broadcast to authorized supervised students
   */
  static async createTeacherAnnouncement(teacherUser, data) {
    const { title, message, targetStudentIds = [] } = data;

    // Resolve supervised student IDs
    let supervisedStudents = [];

    if (!isDbOffline) {
      try {
        const assignments = await prisma.teacherStudentAssignment.findMany({
          where: { teacherId: teacherUser.id },
          select: { studentId: true }
        });
        supervisedStudents = assignments.map((a) => a.studentId);
      } catch (e) {
        isDbOffline = true;
      }
    }

    if (supervisedStudents.length === 0) {
      supervisedStudents = DEFAULT_SUPERVISED_STUDENTS;
    }

    // Determine target recipient list
    let recipients = [];
    if (targetStudentIds.length > 0) {
      // Validate that EVERY target student is supervised by this teacher
      const unauthorized = targetStudentIds.filter((id) => !supervisedStudents.includes(id));
      if (unauthorized.length > 0) {
        const err = new Error(`Forbidden: You cannot announce to unsupervised students: ${unauthorized.join(', ')}`);
        err.statusCode = 403;
        throw err;
      }
      recipients = targetStudentIds;
    } else {
      recipients = supervisedStudents;
    }

    // Persist announcement
    const announcementId = randomUUID();
    const announcementData = {
      id: announcementId,
      _id: announcementId,
      authorId: teacherUser.id,
      authorRole: 'TEACHER',
      authorName: teacherUser.name || 'Educator',
      title,
      message,
      targetRole: 'STUDENT',
      targetStudentIds: recipients,
      isActive: true,
      deliveryCount: recipients.length,
      createdAt: new Date(),
      deactivatedAt: null
    };

    if (isMongoAvailable()) {
      try {
        const doc = await Announcement.create(announcementData);
        announcementData._id = doc._id.toString();
      } catch (err) {}
    }
    inMemoryAnnouncements.set(announcementId, announcementData);

    // Create notifications for each targeted student
    for (const studentId of recipients) {
      await this.createNotification({
        userId: studentId,
        title: `Teacher Announcement: ${title}`,
        message,
        category: 'TEACHER_ANNOUNCEMENT',
        relatedEntity: { type: 'ANNOUNCEMENT', id: announcementId },
        actionUrl: '/notifications',
        dedupKey: `TEACHER_ANNOUNCE:${announcementId}:${studentId}`,
        metadata: {
          teacherId: teacherUser.id,
          teacherName: teacherUser.name || 'Educator'
        }
      });
    }

    return announcementData;
  }

  /**
   * 8. List sent teacher announcements
   */
  static async getTeacherAnnouncements(teacherId) {
    if (isMongoAvailable()) {
      try {
        const docs = await Announcement.find({ authorId: teacherId }).sort({ createdAt: -1 });
        return docs.map((d) => ({ ...d.toJSON(), id: d._id.toString() }));
      } catch (err) {}
    }

    return Array.from(inMemoryAnnouncements.values())
      .filter((a) => a.authorId === teacherId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * 9. Deactivate teacher announcement
   */
  static async deactivateTeacherAnnouncement(teacherId, announcementId) {
    if (isMongoAvailable()) {
      try {
        const doc = await Announcement.findById(announcementId);
        if (doc) {
          if (doc.authorId !== teacherId) {
            const err = new Error('Forbidden: You can only deactivate your own announcements.');
            err.statusCode = 403;
            throw err;
          }
          doc.isActive = false;
          doc.deactivatedAt = new Date();
          await doc.save();
          return { ...doc.toJSON(), id: doc._id.toString() };
        }
      } catch (err) {
        if (err.statusCode) throw err;
      }
    }

    const a = inMemoryAnnouncements.get(announcementId);
    if (!a) {
      const err = new Error('Announcement not found.');
      err.statusCode = 404;
      throw err;
    }

    if (a.authorId !== teacherId) {
      const err = new Error('Forbidden: You can only deactivate your own announcements.');
      err.statusCode = 403;
      throw err;
    }

    a.isActive = false;
    a.deactivatedAt = new Date();
    inMemoryAnnouncements.set(announcementId, a);
    return a;
  }

  /**
   * 10. Admin Platform Announcements: Platform-wide role-targeted broadcast
   */
  static async createAdminAnnouncement(adminUser, data) {
    const { title, message, targetRole = 'ALL' } = data;

    const announcementId = randomUUID();
    const announcementData = {
      id: announcementId,
      _id: announcementId,
      authorId: adminUser.id,
      authorRole: 'ADMIN',
      authorName: adminUser.name || 'System Administrator',
      title,
      message,
      targetRole,
      targetStudentIds: [],
      isActive: true,
      deliveryCount: 0,
      createdAt: new Date(),
      deactivatedAt: null
    };

    if (isMongoAvailable()) {
      try {
        const doc = await Announcement.create(announcementData);
        announcementData._id = doc._id.toString();
      } catch (err) {}
    }
    inMemoryAnnouncements.set(announcementId, announcementData);

    // Emit real-time announcement to targeted role room or all
    emitAnnouncementToRole(targetRole, announcementData);

    return announcementData;
  }

  /**
   * 11. List platform announcements for admin
   */
  static async getAdminAnnouncements() {
    if (isMongoAvailable()) {
      try {
        const docs = await Announcement.find({ authorRole: 'ADMIN' }).sort({ createdAt: -1 });
        return docs.map((d) => ({ ...d.toJSON(), id: d._id.toString() }));
      } catch (err) {}
    }

    return Array.from(inMemoryAnnouncements.values())
      .filter((a) => a.authorRole === 'ADMIN')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * 12. Deactivate admin announcement
   */
  static async deactivateAdminAnnouncement(announcementId) {
    if (isMongoAvailable()) {
      try {
        const doc = await Announcement.findById(announcementId);
        if (doc) {
          doc.isActive = false;
          doc.deactivatedAt = new Date();
          await doc.save();
          return { ...doc.toJSON(), id: doc._id.toString() };
        }
      } catch (err) {}
    }

    const a = inMemoryAnnouncements.get(announcementId);
    if (!a) {
      const err = new Error('Announcement not found.');
      err.statusCode = 404;
      throw err;
    }

    a.isActive = false;
    a.deactivatedAt = new Date();
    inMemoryAnnouncements.set(announcementId, a);
    return a;
  }

  /**
   * Helper: Clear in-memory state (useful for tests)
   */
  static _clearInMemoryState() {
    inMemoryNotifications.clear();
    inMemoryAnnouncements.clear();
    inMemoryPreferences.clear();
  }
}

// ========================================================
// Wire Event-Driven Notification Handlers to Event Bus
// ========================================================

notificationEventBus.on(NOTIFICATION_BUS_EVENTS.MISSION_ASSIGNED, async (payload) => {
  try {
    const { studentId, teacherId, missionTitle, assignmentId, dueDate } = payload;
    await NotificationService.createNotification({
      userId: studentId,
      title: 'New Mission Assigned',
      message: `Your educator assigned mission "${missionTitle}".${dueDate ? ` Due: ${new Date(dueDate).toLocaleDateString()}` : ''}`,
      category: 'MISSION_ASSIGNED',
      relatedEntity: { type: 'MISSION_ASSIGNMENT', id: assignmentId },
      actionUrl: '/missions',
      dedupKey: `MISSION_ASSIGNED:${studentId}:${assignmentId}`
    });
  } catch (err) {
    console.error('[NotificationBus] Error handling MISSION_ASSIGNED:', err.message);
  }
});

notificationEventBus.on(NOTIFICATION_BUS_EVENTS.MISSION_COMPLETED, async (payload) => {
  try {
    const { studentId, teacherId, missionTitle, missionId, xpEarned } = payload;
    // Notify student
    await NotificationService.createNotification({
      userId: studentId,
      title: 'Mission Mastered!',
      message: `You successfully completed "${missionTitle}" and earned +${xpEarned} XP!`,
      category: 'MISSION_COMPLETED',
      relatedEntity: { type: 'MISSION', id: missionId },
      actionUrl: '/missions',
      dedupKey: `MISSION_COMPLETED:${studentId}:${missionId}`
    });

    // Notify teacher if assigned
    if (teacherId) {
      await NotificationService.createNotification({
        userId: teacherId,
        title: 'Student Mission Completed',
        message: `A student completed mission "${missionTitle}".`,
        category: 'STUDENT_PROGRESS_UPDATE',
        relatedEntity: { type: 'MISSION', id: missionId },
        actionUrl: '/teacher/students',
        dedupKey: `STUDENT_MISSION_COMPLETED:${teacherId}:${studentId}:${missionId}`
      });
    }
  } catch (err) {
    console.error('[NotificationBus] Error handling MISSION_COMPLETED:', err.message);
  }
});

notificationEventBus.on(NOTIFICATION_BUS_EVENTS.XP_EARNED, async (payload) => {
  try {
    const { userId, amount, reason, sourceType, sourceId } = payload;
    await NotificationService.createNotification({
      userId,
      title: `+${amount} XP Earned`,
      message: `${reason}`,
      category: 'XP_EARNED',
      relatedEntity: { type: sourceType, id: sourceId },
      actionUrl: '/achievements',
      dedupKey: `XP:${userId}:${sourceType}:${sourceId}`
    });
  } catch (err) {
    console.error('[NotificationBus] Error handling XP_EARNED:', err.message);
  }
});

notificationEventBus.on(NOTIFICATION_BUS_EVENTS.LEVEL_UNLOCKED, async (payload) => {
  try {
    const { userId, newLevel, levelTitle } = payload;
    await NotificationService.createNotification({
      userId,
      title: 'Level Up Promoted!',
      message: `Congratulations! You ascended to Level ${newLevel}: "${levelTitle}"!`,
      category: 'LEVEL_UNLOCKED',
      relatedEntity: { type: 'LEVEL', id: String(newLevel) },
      actionUrl: '/achievements',
      dedupKey: `LEVEL:${userId}:${newLevel}`
    });
  } catch (err) {
    console.error('[NotificationBus] Error handling LEVEL_UNLOCKED:', err.message);
  }
});

notificationEventBus.on(NOTIFICATION_BUS_EVENTS.ACHIEVEMENT_UNLOCKED, async (payload) => {
  try {
    const { userId, achievementCode, achievementName, xpReward } = payload;
    await NotificationService.createNotification({
      userId,
      title: 'Badge Unlocked!',
      message: `Honor earned: "${achievementName}" (+${xpReward} XP)!`,
      category: 'ACHIEVEMENT_UNLOCKED',
      relatedEntity: { type: 'ACHIEVEMENT', id: achievementCode },
      actionUrl: '/achievements',
      dedupKey: `ACH:${userId}:${achievementCode}`
    });
  } catch (err) {
    console.error('[NotificationBus] Error handling ACHIEVEMENT_UNLOCKED:', err.message);
  }
});
