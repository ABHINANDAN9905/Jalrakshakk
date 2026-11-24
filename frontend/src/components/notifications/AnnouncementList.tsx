import React from 'react';
import { TeacherAnnouncement, AdminAnnouncement } from '../../types/notification';
import { 
  Megaphone, 
  Clock, 
  Users, 
  CheckCircle2, 
  Ban, 
  Trash2 
} from 'lucide-react';

interface AnnouncementListProps {
  announcements: Array<TeacherAnnouncement | AdminAnnouncement>;
  onDeactivate: (id: string) => void;
  role?: 'TEACHER' | 'ADMIN';
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({
  announcements,
  onDeactivate,
  role = 'TEACHER'
}) => {
  if (announcements.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 glass-panel rounded-2xl border-slate-800">
        <Megaphone className="w-8 h-8 mx-auto opacity-40 mb-2" />
        <div className="text-xs font-semibold">No announcements published yet</div>
        <div className="text-[11px] text-slate-600">Use the composer to broadcast messages to your students.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <div
          key={a.id}
          className={`p-4 rounded-xl border transition-all ${
            a.isActive
              ? 'bg-slate-900/60 border-slate-800 text-slate-200'
              : 'bg-slate-900/20 border-slate-800/40 text-slate-500 opacity-70'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    a.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {a.isActive ? 'Active Broadcast' : 'Deactivated'}
                </span>

                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>

                {a.deliveryCount !== undefined && (
                  <span className="text-[10px] text-sky-400 font-mono flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {a.deliveryCount} recipients
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white mt-1">{a.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{a.message}</p>
            </div>

            {a.isActive && (
              <button
                type="button"
                onClick={() => onDeactivate(a.id)}
                title="Deactivate Announcement"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-semibold"
              >
                <Ban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Deactivate</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
