import React from 'react';
import { NotificationItem } from '../../types/notification';
import { NotificationBadge } from './NotificationBadge';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Trash2, 
  ArrowRight, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

interface NotificationItemProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false
}) => {
  const timeFormatted = new Date(notification.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        notification.isRead
          ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
          : 'bg-slate-900/90 border-sky-500/40 text-white shadow-md shadow-sky-500/5'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <NotificationBadge category={notification.category} size="sm" />
            {!notification.isRead && (
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shrink-0" />
            )}
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeFormatted}
            </span>
          </div>

          <h4 className="text-xs font-bold leading-tight break-words text-white">
            {notification.title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed break-words">
            {notification.message}
          </p>

          {/* Action Link button if actionUrl exists */}
          {notification.actionUrl && (
            <div className="pt-1">
              <Link
                to={notification.actionUrl}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>Navigate to details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              title="Mark as read"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onDelete(notification.id)}
            title="Delete notification"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
