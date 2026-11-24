import { socketService } from './socket.service';
import { NotificationItem, AdminAnnouncement, TeacherAnnouncement } from '../types/notification';

export type NotificationReceivedListener = (notification: NotificationItem) => void;
export type UnreadCountListener = (count: number) => void;
export type AnnouncementReceivedListener = (announcement: AdminAnnouncement | TeacherAnnouncement) => void;

class NotificationSocketService {
  private notificationListeners: Set<NotificationReceivedListener> = new Set();
  private unreadCountListeners: Set<UnreadCountListener> = new Set();
  private announcementListeners: Set<AnnouncementReceivedListener> = new Set();
  private initialized = false;

  init() {
    if (this.initialized) return;

    const socket = socketService.connect();

    socket.on('notification:new', (notification: NotificationItem) => {
      this.notificationListeners.forEach((listener) => listener(notification));
    });

    socket.on('notification:unread_count', (payload: { unreadCount: number }) => {
      this.unreadCountListeners.forEach((listener) => listener(payload.unreadCount));
    });

    socket.on('announcement:new', (announcement: AdminAnnouncement | TeacherAnnouncement) => {
      this.announcementListeners.forEach((listener) => listener(announcement));
    });

    socket.on('connect', () => {
      socket.emit('notifications:subscribe');
    });

    if (socket.connected) {
      socket.emit('notifications:subscribe');
    }

    this.initialized = true;
  }

  onNotificationReceived(listener: NotificationReceivedListener): () => void {
    this.init();
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }

  onUnreadCountChanged(listener: UnreadCountListener): () => void {
    this.init();
    this.unreadCountListeners.add(listener);
    return () => this.unreadCountListeners.delete(listener);
  }

  onAnnouncementReceived(listener: AnnouncementReceivedListener): () => void {
    this.init();
    this.announcementListeners.add(listener);
    return () => this.announcementListeners.delete(listener);
  }
}

export const notificationSocket = new NotificationSocketService();
