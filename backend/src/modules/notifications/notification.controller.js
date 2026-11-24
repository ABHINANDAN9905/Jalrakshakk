import { NotificationService } from './notification.service.js';

export class NotificationController {
  /**
   * GET /api/v1/notifications
   */
  static async getNotifications(req, res, next) {
    try {
      const result = await NotificationService.getNotifications(req.user.id, req.query);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Notifications retrieved successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/notifications/unread-count
   */
  static async getUnreadCount(req, res, next) {
    try {
      const result = await NotificationService.getUnreadCount(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Unread count retrieved successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  static async markAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAsRead(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Notification marked as read',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/notifications/read-all
   */
  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'All notifications marked as read',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/notifications/:id
   */
  static async deleteNotification(req, res, next) {
    try {
      const result = await NotificationService.deleteNotification(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Notification deleted successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/notifications/preferences
   */
  static async getPreferences(req, res, next) {
    try {
      const prefs = await NotificationService.getPreferences(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Notification preferences retrieved successfully',
        data: prefs
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/notifications/preferences
   */
  static async updatePreferences(req, res, next) {
    try {
      const prefs = await NotificationService.updatePreferences(req.user.id, req.body);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Notification preferences updated successfully',
        data: prefs
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/notifications/announcements/teacher
   */
  static async createTeacherAnnouncement(req, res, next) {
    try {
      const announcement = await NotificationService.createTeacherAnnouncement(req.user, req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Teacher announcement published and delivered to supervised students',
        data: announcement
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/notifications/announcements/teacher
   */
  static async getTeacherAnnouncements(req, res, next) {
    try {
      const announcements = await NotificationService.getTeacherAnnouncements(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Teacher announcements retrieved successfully',
        data: announcements
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/notifications/announcements/teacher/:id/deactivate
   */
  static async deactivateTeacherAnnouncement(req, res, next) {
    try {
      const announcement = await NotificationService.deactivateTeacherAnnouncement(req.user.id, req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Teacher announcement deactivated successfully',
        data: announcement
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/notifications/announcements/admin
   */
  static async createAdminAnnouncement(req, res, next) {
    try {
      const announcement = await NotificationService.createAdminAnnouncement(req.user, req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Admin platform announcement broadcasted successfully',
        data: announcement
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/notifications/announcements/admin
   */
  static async getAdminAnnouncements(req, res, next) {
    try {
      const announcements = await NotificationService.getAdminAnnouncements();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Admin platform announcements retrieved successfully',
        data: announcements
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/notifications/announcements/admin/:id/deactivate
   */
  static async deactivateAdminAnnouncement(req, res, next) {
    try {
      const announcement = await NotificationService.deactivateAdminAnnouncement(req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Admin platform announcement deactivated successfully',
        data: announcement
      });
    } catch (err) {
      next(err);
    }
  }
}
