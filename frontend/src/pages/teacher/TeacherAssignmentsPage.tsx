import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { teacherAssignmentService } from '../../services/teacherAssignment.service';
import { notificationService } from '../../services/notification.service';
import { TeacherMissionAssignment, TeacherStudentItem } from '../../types/gamification';
import { TeacherAnnouncement } from '../../types/notification';
import { AnnouncementComposer } from '../../components/notifications/AnnouncementComposer';
import { AnnouncementList } from '../../components/notifications/AnnouncementList';
import { 
  BookPlus, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileText, 
  Filter, 
  Loader2, 
  Send,
  Sparkles,
  Layers,
  Megaphone
} from 'lucide-react';

const AVAILABLE_MISSIONS = [
  { id: '123e4567-e89b-12d3-a456-426614174001', code: 'GW_BALANCE_01', title: 'Foundations of Groundwater Balance', category: 'Groundwater Conservation', xpReward: 250, difficulty: 'BEGINNER' },
  { id: '123e4567-e89b-12d3-a456-426614174002', code: 'MONSOON_HARVEST_02', title: 'Monsoon Runoff & Rainwater Harvesting', category: 'Rainwater Harvesting', xpReward: 350, difficulty: 'INTERMEDIATE' },
  { id: '123e4567-e89b-12d3-a456-426614174003', code: 'PRECISION_IRRIGATION_03', title: 'Precision Micro-Irrigation & Crop Diversification', category: 'Sustainable Agriculture', xpReward: 400, difficulty: 'INTERMEDIATE' },
  { id: '123e4567-e89b-12d3-a456-426614174004', code: 'CONTAMINATION_DEFENSE_04', title: 'Aquifer Contamination & Industrial Defense', category: 'Water Quality', xpReward: 500, difficulty: 'ADVANCED' },
  { id: '123e4567-e89b-12d3-a456-426614174005', code: 'DROUGHT_RESILIENCE_05', title: 'Drought Resilience & Multi-Year Aquifer Management', category: 'Drought Management', xpReward: 600, difficulty: 'ADVANCED' },
];

export const TeacherAssignmentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId') || '';

  const [assignments, setAssignments] = useState<TeacherMissionAssignment[]>([]);
  const [students, setStudents] = useState<TeacherStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State
  const [mode, setMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId);
  const [bulkAllClassroom, setBulkAllClassroom] = useState<boolean>(true);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>(AVAILABLE_MISSIONS[0].id);
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Status message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Tab State
  const [pageTab, setPageTab] = useState<'assignments' | 'announcements'>('assignments');
  const [announcements, setAnnouncements] = useState<TeacherAnnouncement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(false);

  const loadAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const res = await notificationService.getTeacherAnnouncements();
      setAnnouncements(res);
    } catch (err) {
      console.error('Failed to load teacher announcements:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    if (pageTab === 'announcements') {
      loadAnnouncements();
    }
  }, [pageTab]);

  const handleDeactivateAnnouncement = async (id: string) => {
    try {
      await notificationService.deactivateTeacherAnnouncement(id);
      loadAnnouncements();
    } catch (err) {
      console.error('Failed to deactivate announcement:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      teacherAssignmentService.getTeacherAssignments(),
      teacherAssignmentService.getMyStudents()
    ])
      .then(([assignData, studentData]) => {
        setAssignments(assignData);
        setStudents(studentData);
        if (preselectedStudentId) {
          setSelectedStudentId(preselectedStudentId);
        } else if (studentData.length > 0) {
          setSelectedStudentId(studentData[0].id);
        }
      })
      .catch((err) => console.error('Failed to load assignments or students:', err))
      .finally(() => setLoading(false));
  }, [preselectedStudentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (mode === 'SINGLE') {
        if (!selectedStudentId) {
          setFeedback({ type: 'error', message: 'Please select a student.' });
          setSubmitting(false);
          return;
        }

        const res = await teacherAssignmentService.assignMission({
          studentId: selectedStudentId,
          missionId: selectedMissionId,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          notes: notes.trim() || undefined
        });

        if (res.success) {
          setFeedback({ type: 'success', message: res.message });
          // Refresh assignments list
          teacherAssignmentService.getTeacherAssignments().then(setAssignments);
          setNotes('');
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      } else {
        // Bulk assignment
        const res = await teacherAssignmentService.assignMissionBulk({
          missionId: selectedMissionId,
          allClassroom: bulkAllClassroom,
          studentIds: bulkAllClassroom ? undefined : selectedStudentIds,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          notes: notes.trim() || undefined
        });

        if (res.success) {
          setFeedback({ 
            type: 'success', 
            message: `Successfully assigned mission to ${res.assignedCount || 'all'} students!` 
          });
          teacherAssignmentService.getTeacherAssignments().then(setAssignments);
          setNotes('');
        } else {
          setFeedback({ type: 'error', message: res.message });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to complete assignment request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return (item.status || 'PENDING') === statusFilter;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/30 text-[10px]">IN PROGRESS</span>;
      case 'OVERDUE':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30 text-[10px]">OVERDUE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 text-[10px]">PENDING</span>;
    }
  };

  return (
    <TeacherLayout activeNav="assignments">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <BookPlus className="w-4 h-4" />
            <span>Classroom Pedagogy Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Mission & Quest Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Assign curriculum-aligned groundwater missions to individual students or the entire classroom with targeted due dates.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setPageTab('assignments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              pageTab === 'assignments'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <BookPlus className="w-4 h-4" />
            <span>Mission Assignments</span>
          </button>

          <button
            type="button"
            onClick={() => setPageTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              pageTab === 'announcements'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Classroom Announcements</span>
          </button>
        </div>

        {pageTab === 'announcements' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <AnnouncementComposer
                role="TEACHER"
                supervisedStudents={students.map((s) => ({ id: s.id, name: s.name }))}
                onCreated={loadAnnouncements}
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-sky-400" />
                  <span>Broadcast History</span>
                </h3>
                {loadingAnnouncements && <Loader2 className="w-4 h-4 animate-spin text-sky-400" />}
              </div>
              <AnnouncementList
                announcements={announcements}
                onDeactivate={handleDeactivateAnnouncement}
                role="TEACHER"
              />
            </div>
          </div>
        ) : (
          <>
            {/* Assignment Creation Form */}
            <div className="glass-panel p-6 border-slate-800">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>New Educational Mission Assignment</span>
          </div>

          {feedback && (
            <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs">
            {/* Mode Selector */}
            <div>
              <label className="block text-slate-400 font-bold mb-2">Assignment Scope</label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setMode('SINGLE')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all border ${
                    mode === 'SINGLE'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Single Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('BULK')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all border ${
                    mode === 'BULK'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Bulk / Entire Class</span>
                </button>
              </div>
            </div>

            {/* Student Picker */}
            {mode === 'SINGLE' ? (
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Target Supervised Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full md:w-96 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email}) — Lvl {student.currentLevel || student.userXP?.currentLevel || 1}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-slate-400 font-bold">Classroom Student Selection</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allClassroom"
                    checked={bulkAllClassroom}
                    onChange={(e) => setBulkAllClassroom(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="allClassroom" className="text-slate-300 font-semibold cursor-pointer">
                    Assign to All Supervised Students ({students.length} students)
                  </label>
                </div>
              </div>
            )}

            {/* Mission Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Educational Mission</label>
                <select
                  value={selectedMissionId}
                  onChange={(e) => setSelectedMissionId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                >
                  {AVAILABLE_MISSIONS.map((mission) => (
                    <option key={mission.id} value={mission.id}>
                      [{mission.difficulty}] {mission.title} (+{mission.xpReward} XP)
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Target Completion Date (Optional)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Teacher Notes */}
            <div>
              <label className="block text-slate-400 font-bold mb-1.5">
                Pedagogical Instructions & Teacher Guidance
              </label>
              <textarea
                rows={3}
                placeholder="E.g., Focus on water recharge rate calculation before submitting simulation. Remember to check aquifer salinity levels!"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Assignment...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Deploy Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Active Assignments List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Active Classroom Assignments</h2>
              <p className="text-xs text-slate-400">Tracking assigned missions, pending submissions, and completion status</p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs">Loading active assignments...</span>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-500 text-xs">
              No assignments found for the selected filter.
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Mission Title</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Teacher Guidance Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAssignments.map((assign) => (
                      <tr key={assign.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          {assign.student?.name || 'Classroom Student'}
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">
                          {assign.mission?.title || 'Groundwater Mission'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'No Deadline'}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(assign.status)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {assign.notes || <span className="text-slate-600 italic">No notes provided</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </>
    )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherAssignmentsPage;
