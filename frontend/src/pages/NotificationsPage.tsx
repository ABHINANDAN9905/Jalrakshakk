import React, { useState, useEffect } from 'react';
import { TopHUD } from '../components/game-hud/TopHUD';
import { LeftNav } from '../components/game-hud/LeftNav';
import { notificationService } from '../services/notification.service';
import { notificationSocket } from '../services/notification.socket';
import { NotificationItem, NotificationCategory, NotificationPreferences } from '../types/notification';
import { NotificationItemComponent } from '../components/notifications/NotificationItem';
import { 
  Bell, 
  CheckCheck, 
  Filter, 
  Inbox, 
  Loader2, 
  Settings, 
  Trash2, 
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({
        unreadOnly: activeTab === 'UNREAD',
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        limit: 50
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Socket real-time subscription
    const unsubNew = notificationSocket.onNotificationReceived((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    const unsubCount = notificationSocket.onUnreadCountChanged((count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubNew();
      unsubCount();
    };
  }, [activeTab, selectedCategory]);

  useEffect(() => {
    notificationService.getPreferences().then(setPreferences).catch(() => null);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
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
      const countRes = await notificationService.getUnreadCount();
      setUnreadCount(countRes.unreadCount);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleToggleCategoryPreference = async (cat: string) => {
    if (!preferences) return;
    const currentVal = preferences.inAppCategories[cat] !== false;
    const updated = {
      ...preferences,
      inAppCategories: {
        ...preferences.inAppCategories,
        [cat]: !currentVal
      }
    };
    setPreferences(updated);
    await notificationService.updatePreferences(updated).catch(() => null);
  };

  const CATEGORIES = [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'MISSION_ASSIGNED', label: 'Mission Assignments' },
    { id: 'MISSION_COMPLETED', label: 'Missions Completed' },
    { id: 'XP_EARNED', label: 'XP Rewards' },
    { id: 'LEVEL_UNLOCKED', label: 'Level Promotions' },
    { id: 'ACHIEVEMENT_UNLOCKED', label: 'Badges' },
    { id: 'TEACHER_ANNOUNCEMENT', label: 'Teacher Broadcasts' },
    { id: 'PLATFORM_ANNOUNCEMENT', label: 'Platform Notices' }
  ];

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      <TopHUD />
      <LeftNav />

      <main className="flex-1 overflow-y-auto pl-24 pr-8 pt-24 pb-16 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Bell className="w-4 h-4" />
              <span>Real-Time Communication Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Personal Alerts & Educational Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live updates on missions, XP progression, educator announcements, and platform notices.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-300 text-xs font-bold transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Preferences Panel (collapsible) */}
        {showPreferences && preferences && (
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Settings className="w-4 h-4 text-sky-400" />
                <span>Notification Preferences</span>
              </div>
              <span className="text-[10px] text-slate-400">In-App Notification Categories</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(preferences.inAppCategories || {}).map(([cat, enabled]) => (
                <label
                  key={cat}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 text-xs"
                >
                  <span className="text-slate-300 font-medium">
                    {cat.replace(/_/g, ' ')}
                  </span>
                  <input
                    type="checkbox"
                    checked={enabled !== false}
                    onChange={() => handleToggleCategoryPreference(cat)}
                    className="rounded border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tabs & Category Filter Pill Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          {/* Main All / Unread Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setActiveTab('UNREAD')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'UNREAD'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Category Dropdown / Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 border-sky-500 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
              <span className="text-xs font-semibold">Synchronizing real-time notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="glass-panel p-16 rounded-2xl border-slate-800 text-center space-y-3">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Notifications</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'UNREAD'
                  ? 'You have read all your notifications. Great job staying up to date!'
                  : 'You have no notifications in this category yet. Complete tasks or check back soon.'}
              </p>
              <Link
                to="/missions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 transition-colors mt-2"
              >
                <span>Explore Active Missions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            notifications.map((notif) => (
              <NotificationItemComponent
                key={notif.id}
                notification={notif}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
