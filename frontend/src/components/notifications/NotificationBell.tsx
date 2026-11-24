import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { notificationSocket } from '../../services/notification.socket';
import { NotificationItem } from '../../types/notification';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial unread count
  useEffect(() => {
    notificationService.getUnreadCount()
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => null);

    // Subscribe to real-time socket events
    const unsubUnread = notificationSocket.onUnreadCountChanged((count) => {
      setUnreadCount(count);
    });

    const unsubNew = notificationSocket.onNotificationReceived((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      unsubUnread();
      unsubNew();
    };
  }, []);

  // When opening dropdown, load latest notifications
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationService.getNotifications({ limit: 10 })
        .then((data) => setNotifications(data.notifications))
        .catch(() => null)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      // Re-fetch unread count
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-500/50 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
