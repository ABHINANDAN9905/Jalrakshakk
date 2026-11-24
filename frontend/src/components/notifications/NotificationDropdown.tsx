import React from 'react';
import { NotificationItem } from '../../types/notification';
import { NotificationItemComponent } from './NotificationItem';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  ExternalLink, 
  Inbox, 
  Loader2 
} from 'lucide-react';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose
}) => {
  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 backdrop-blur">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] font-semibold text-slate-400 hover:text-sky-300 transition-colors flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Scrollable Notifications List */}
      <div className="max-h-80 overflow-y-auto p-3 space-y-2.5">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            <span className="text-xs">Checking real-time alerts...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <Inbox className="w-8 h-8 mx-auto opacity-50" />
            <div className="text-xs font-medium">No recent notifications</div>
            <div className="text-[11px] text-slate-600">You are all caught up!</div>
          </div>
        ) : (
          notifications.slice(0, 6).map((notif) => (
            <NotificationItemComponent
              key={notif.id}
              notification={notif}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
              compact
            />
          ))
        )}
      </div>

      {/* Footer: Full Center Link */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1.5"
        >
          <span>Open Full Notification Center</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
