import React, { useState, useEffect } from 'react';
import { 
  TeacherStudentItem, 
  TeacherMissionAssignment, 
  StudentProgressReport,
  Mission
} from '../../types/gamification';
import { teacherAssignmentService } from '../../services/teacherAssignment.service';
import { missionService } from '../../services/mission.service';
import { 
  Users, 
  BookPlus, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  Award, 
  AlertCircle,
  Eye,
  Loader2
} from 'lucide-react';

export const MissionAssignmentPanel: React.FC = () => {
  const [students, setStudents] = useState<TeacherStudentItem[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [assignments, setAssignments] = useState<TeacherMissionAssignment[]>([]);
  const [selectedStudentProgress, setSelectedStudentProgress] = useState<StudentProgressReport | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stuRes, missRes, assignRes] = await Promise.all([
        teacherAssignmentService.getMyStudents(),
        missionService.getMissions(),
        teacherAssignmentService.getTeacherAssignments(),
      ]);
      setStudents(stuRes);
      setMissions(missRes);
      setAssignments(assignRes);
      if (stuRes.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stuRes[0].id);
      }
      if (missRes.length > 0 && !selectedMissionId) {
        setSelectedMissionId(missRes[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedMissionId) return;

    setAssigning(true);
    setFeedback(null);

    const res = await teacherAssignmentService.assignMission({
      studentId: selectedStudentId,
      missionId: selectedMissionId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      notes: notes || undefined,
    });

    setAssigning(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setNotes('');
      loadData();
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleInspectStudent = async (studentId: string) => {
    const report = await teacherAssignmentService.getStudentProgress(studentId);
    setSelectedStudentProgress(report);
  };

  if (loading) {
    return (
      <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        <span className="text-xs font-semibold">Loading Classroom Assignment Roster...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Classroom Supervisory Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Teacher Mission Assignment Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Assign groundwater conservation missions to supervised students and track pedagogical progress.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Assignment Form + Active Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border-slate-800 lg:col-span-1">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BookPlus className="w-4 h-4 text-sky-400" />
            Assign New Mission
          </h3>

          <form onSubmit={handleAssignMission} className="space-y-4 text-xs">
            {/* Student Select */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Select Supervised Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 text-xs"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Mission Select */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Select Educational Mission
              </label>
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 text-xs"
              >
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.difficulty}] {m.title} (+{m.xpReward} XP)
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Target Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>

            {/* Supervisory Notes */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Teacher Instructions / Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Focus on drip irrigation water savings and specific yield..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={assigning || !selectedStudentId || !selectedMissionId}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Assign Mission Directive'}
            </button>
          </form>
        </div>

        {/* Assignments Table */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border-slate-800 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Active Classroom Assignments ({assignments.length})
              </h3>
            </div>

            {assignments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold">No active student assignments yet.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Assign a mission above to track student progress.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Mission</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {assignments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3">
                          <span className="text-white font-semibold block">
                            {a.student?.name || 'Authorized Student'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {a.student?.email}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sky-300 font-medium block">
                            {a.mission?.title || a.missionId}
                          </span>
                          <span className="text-[10px] text-amber-300 font-mono">
                            +{a.mission?.xpReward || 100} XP
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                          {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No Deadline'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleInspectStudent(a.studentId)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3 h-3 text-sky-400" />
                            Progress
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Progress Modal if clicked */}
      {selectedStudentProgress && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-glow border border-slate-700 rounded-3xl p-6 max-w-lg w-full bg-slate-900 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                Supervised Student Progress Report
              </h3>
              <button
                onClick={() => setSelectedStudentProgress(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total XP</span>
                <span className="text-base font-extrabold text-amber-300 font-mono">
                  {selectedStudentProgress.progression?.currentXP ?? 0} XP
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Level</span>
                <span className="text-base font-extrabold text-sky-300 font-mono">
                  Level {selectedStudentProgress.progression?.currentLevel ?? 1}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-bold mb-2 uppercase text-[10px]">
                Completed & Active Missions
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedStudentProgress.missions?.length === 0 ? (
                  <p className="text-slate-500">No mission records recorded yet.</p>
                ) : (
                  selectedStudentProgress.missions?.map((m: any) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-white block">
                          {m.mission?.title || m.missionId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Status: {m.status} ({m.progress}%)
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">
                        {m.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionAssignmentPanel;
