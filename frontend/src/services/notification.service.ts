import api from './api';
import {
  NotificationItem,
  NotificationListResponse,
  NotificationPreferences,
  TeacherAnnouncement,
  AdminAnnouncement
} from '../types/notification';

export const notificationService = {
  /**
   * Fetch paginated notifications with optional category and unread filters
   */
  async getNotifications(params: {
    page?: number;
    limit?: number;
    category?: string;
    unreadOnly?: boolean;
  } = {}): Promise<NotificationListResponse> {
    const response = await api.get('/notifications', { params });
    return response.data.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ unreadCount: number; isPersisted: boolean }> {
    const response = await api.get('/notifications/unread-count');
    return response.data.data;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; modifiedCount: number; unreadCount: number }> {
    const response = await api.patch('/notifications/read-all');
    return response.data.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<{ success: boolean; deletedId: string }> {
    const response = await api.delete(`/notifications/${id}`);
    return response.data.data;
  },

  /**
   * Get notification category preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/notifications/preferences');
    return response.data.data;
  },

  /**
   * Update notification category preferences
   */
  async updatePreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/notifications/preferences', data);
    return response.data.data;
  },

  /**
   * Publish teacher announcement to supervised students
   */
  async createTeacherAnnouncement(data: {
    title: string;
    message: string;
    targetStudentIds?: string[];
  }): Promise<TeacherAnnouncement> {
    const response = await api.post('/notifications/announcements/teacher', data);
    return response.data.data;
  },

  /**
   * List sent teacher announcements
   */
  async getTeacherAnnouncements(): Promise<TeacherAnnouncement[]> {
    const response = await api.get('/notifications/announcements/teacher');
    return response.data.data;
  },

  /**
   * Deactivate a teacher announcement
   */
  async deactivateTeacherAnnouncement(id: string): Promise<TeacherAnnouncement> {
    const response = await api.patch(`/notifications/announcements/teacher/${id}/deactivate`);
    return response.data.data;
  },

  /**
   * Publish platform-wide admin announcement
   */
  async createAdminAnnouncement(data: {
    title: string;
    message: string;
    targetRole?: 'STUDENT' | 'TEACHER' | 'ALL';
  }): Promise<AdminAnnouncement> {
    const response = await api.post('/notifications/announcements/admin', data);
    return response.data.data;
  },

  /**
   * List platform announcements
   */
  async getAdminAnnouncements(): Promise<AdminAnnouncement[]> {
    const response = await api.get('/notifications/announcements/admin');
    return response.data.data;
  },

  /**
   * Deactivate an admin announcement
   */
  async deactivateAdminAnnouncement(id: string): Promise<AdminAnnouncement> {
    const response = await api.patch(`/notifications/announcements/admin/${id}/deactivate`);
    return response.data.data;
  }
};
