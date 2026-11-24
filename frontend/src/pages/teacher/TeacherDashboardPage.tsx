import React, { useEffect, useState } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { teacherAssignmentService } from '../../services/teacherAssignment.service';
import { TeacherDashboardSummary } from '../../types/teacher';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  BookPlus, 
  BarChart3, 
  FileSpreadsheet, 
  ArrowRight,
  Activity,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const TeacherDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<TeacherDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    teacherAssignmentService
      .getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError('Failed to load dashboard summary.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <TeacherLayout activeNav="dashboard">
        <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-semibold">Compiling classroom intelligence summary...</span>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !summary) {
    return (
      <TeacherLayout activeNav="dashboard">
        <div className="glass-panel p-12 text-center text-rose-400 flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm font-bold">{error || 'Dashboard unavailable'}</span>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout activeNav="dashboard">
      <div className="space-y-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Supervisory Cockpit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Classroom Hydrology Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time monitoring of supervised students, simulation engagement, and mission completion rates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/teacher/assignments"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              <BookPlus className="w-4 h-4" />
              <span>Assign Mission</span>
            </Link>
            <Link
              to="/teacher/analytics"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700"
            >
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Class Analytics</span>
            </Link>
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Students */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase text-[10px]">Supervised Students</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {summary.totalStudents}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                {summary.activeStudents} active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enrolled in Maharashtra rural cluster
            </p>
          </div>

          {/* Card 2: Assignments Completion */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase text-[10px]">Mission Directives</span>
              <Target className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {summary.totalAssignments}
              </span>
              <span className="text-xs text-sky-400 font-semibold font-mono">
                {summary.classCompletionRate}% pass rate
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary.completedAssignments} completed · {summary.pendingAssignments} in progress
            </p>
          </div>

          {/* Card 3: Average Student XP */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase text-[10px]">Average Student XP</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {summary.averageStudentXP.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-semibold">XP</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Class level average: Tier 2 (Water Guardian)
            </p>
          </div>

          {/* Card 4: Overdue & Attention */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase text-[10px]">Requires Attention</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                {summary.studentsRequiringAttention.length}
              </span>
              <span className="text-xs text-slate-400">students</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary.overdueAssignments} overdue assignments flagged
            </p>
          </div>
        </div>

        {/* 2-Column Split: Students Requiring Attention vs Recent Classroom Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Students Requiring Attention */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Students Requiring Attention ({summary.studentsRequiringAttention.length})
              </h3>
              <Link
                to="/teacher/students"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Full Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {summary.studentsRequiringAttention.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">All students on track!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  No overdue missions or engagement drop-offs detected.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary.studentsRequiringAttention.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-white block">{student.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{student.email}</span>
                      <span className="text-[10px] text-rose-400 font-semibold mt-0.5 block">
                        Flag: {student.reason}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-300 font-mono block">
                        {student.totalXP} XP
                      </span>
                      <Link
                        to={`/teacher/students/${student.id}`}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold underline mt-1 block"
                      >
                        Inspect Progress
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Recent Classroom Activities */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Recent Classroom Actions
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5">
              {summary.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs"
                >
                  <span className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/20">
                    <Activity className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{act.studentName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      {act.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboardPage;
