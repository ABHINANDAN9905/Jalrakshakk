import React, { useState } from 'react';
import { notificationService } from '../../services/notification.service';
import { 
  Megaphone, 
  Send, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

interface AnnouncementComposerProps {
  role?: 'TEACHER' | 'ADMIN';
  supervisedStudents?: Array<{ id: string; name: string }>;
  onCreated?: () => void;
}

export const AnnouncementComposer: React.FC<AnnouncementComposerProps> = ({
  role = 'TEACHER',
  supervisedStudents = [],
  onCreated
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'STUDENT' | 'TEACHER' | 'ALL'>('ALL');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectAllStudents, setSelectAllStudents] = useState(true);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStudentToggle = (studentId: string) => {
    setSelectAllStudents(false);
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (title.trim().length < 3) {
      setErrorMsg('Title must be at least 3 characters.');
      return;
    }

    if (message.trim().length < 5) {
      setErrorMsg('Message must be at least 5 characters.');
      return;
    }

    setLoading(true);

    try {
      if (role === 'TEACHER') {
        const targetIds = selectAllStudents ? [] : selectedStudentIds;
        await notificationService.createTeacherAnnouncement({
          title,
          message,
          targetStudentIds: targetIds
        });
        setSuccessMsg('Announcement successfully published and dispatched to student notifications.');
      } else {
        await notificationService.createAdminAnnouncement({
          title,
          message,
          targetRole
        });
        setSuccessMsg('Platform-wide announcement broadcasted successfully.');
      }

      setTitle('');
      setMessage('');
      setSelectedStudentIds([]);
      setSelectAllStudents(true);
      if (onCreated) onCreated();
    } catch (err: any) {
      console.error('Failed to create announcement:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
      <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
        <Megaphone className="w-4 h-4" />
        <span>{role === 'TEACHER' ? 'Classroom Announcement Broadcaster' : 'Platform Announcement Publisher'}</span>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            Announcement Headline
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Mandatory Watershed Field Simulation Workshop"
            maxLength={120}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            Message Details
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write instructions, assignment deadlines, or conservation insights..."
            rows={4}
            maxLength={1500}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
          />
          <div className="text-right text-[10px] text-slate-500 font-mono">
            {message.length} / 1500 characters
          </div>
        </div>

        {/* Target Audience: Teacher selects students */}
        {role === 'TEACHER' && supervisedStudents.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Target Supervised Students
              </label>
              <button
                type="button"
                onClick={() => {
                  setSelectAllStudents(!selectAllStudents);
                  if (!selectAllStudents) setSelectedStudentIds([]);
                }}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300"
              >
                {selectAllStudents ? 'Choose Specific Students' : 'Select All Students'}
              </button>
            </div>

            {selectAllStudents ? (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                Announcing to all <strong>{supervisedStudents.length}</strong> supervised students in your classroom roster.
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                {supervisedStudents.map((st) => (
                  <label
                    key={st.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(st.id)}
                      onChange={() => handleStudentToggle(st.id)}
                      className="rounded border-slate-700 text-sky-500 focus:ring-0"
                    />
                    <span className="text-slate-200">{st.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Target Audience: Admin selects role */}
        {role === 'ADMIN' && (
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Recipient Cohort
            </label>
            <div className="flex gap-2">
              {(['ALL', 'STUDENT', 'TEACHER'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTargetRole(r)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                    targetRole === r
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'ALL' ? 'Everyone' : r === 'STUDENT' ? 'Students Only' : 'Teachers Only'}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Broadcast...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Dispatch Announcement</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
