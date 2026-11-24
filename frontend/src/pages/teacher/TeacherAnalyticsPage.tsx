import React, { useEffect, useState } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { teacherAssignmentService } from '../../services/teacherAssignment.service';
import { analyticsService } from '../../services/analytics.service';
import { DateRangeFilter } from '../../components/analytics/DateRangeFilter';
import { ReportExportModal } from '../../components/analytics/ReportExportModal';
import { ClassroomAnalyticsData as LegacyClassroomData } from '../../types/teacher';
import { ClassroomAnalyticsData as AdvancedClassroomData } from '../../types/analytics';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  Layers,
  Download,
  AlertCircle,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export const TeacherAnalyticsPage: React.FC = () => {
  const [legacyAnalytics, setLegacyAnalytics] = useState<LegacyClassroomData | null>(null);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdvancedClassroomData | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      teacherAssignmentService.getClassroomAnalytics().catch(() => null),
      analyticsService.getTeacherAnalytics(period).catch(() => null)
    ])
      .then(([legacy, advanced]) => {
        if (legacy) setLegacyAnalytics(legacy);
        if (advanced) setAdvancedAnalytics(advanced);
      })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading && !legacyAnalytics && !advancedAnalytics) {
    return (
      <TeacherLayout activeNav="analytics">
        <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-semibold">Synthesizing classroom telemetry & learning analytics...</span>
        </div>
      </TeacherLayout>
    );
  }

  const xpDistribution = legacyAnalytics?.xpDistribution || [];
  const categoryPerformance = legacyAnalytics?.categoryPerformance || [];
  const difficultyBreakdown = legacyAnalytics?.difficultyBreakdown || [];
  const weeklyActivityTrends = legacyAnalytics?.weeklyActivityTrends || [];
  const incompleteAssignments = legacyAnalytics?.incompleteAssignments || [];
  const studentsRequiringSupport = advancedAnalytics?.studentsRequiringSupport || [];
  const frequentlyFailedTasks = advancedAnalytics?.frequentlyFailedTasks || [];

  return (
    <TeacherLayout activeNav="analytics">
      <div className="space-y-8">
        {/* Header with Range Filter and Report Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Classroom Learning Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Classroom Hydrological Analytics & Intervention Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Supervised student mastery distributions, early struggle detection, and curriculum completion trends.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DateRangeFilter selectedPeriod={period} onSelectPeriod={setPeriod} />

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Classroom Report</span>
            </button>
          </div>
        </div>

        {/* Educational Simulation Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-900/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-emerald-300">CGWB Model Boundary Notice:</strong> All student simulation results reflect computational water balance simulations under CGWB equations for educational training. Access is strictly scoped to your authorized supervised student cohort.
          </div>
        </div>

        {/* Top 2 Primary Charts: Level Distribution & Weekly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Level Distribution */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Student Level Distribution</h3>
                <p className="text-[11px] text-slate-400">Class count across progression ranks</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                {legacyAnalytics?.totalStudents || advancedAnalytics?.classroomOverview?.totalStudents || 4} Supervised Students
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={xpDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis 
                    dataKey="title" 
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="studentsCount" name="Students" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Activity Trends */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Weekly Hydrological Activity</h3>
                <p className="text-[11px] text-slate-400">Simulations executed & tasks finished</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                Active Period ({period})
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSims" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="simulations" name="Village Simulations" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorSims)" />
                  <Area type="monotone" dataKey="tasksCompleted" name="Tasks Completed" stroke="#10b981" fillOpacity={1} fill="url(#colorTasks)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Phase 14 Advanced: Students Requiring Support & Frequently Failed Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students Requiring Pedagogical Support */}
          <div className="glass-panel p-5 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Students Requiring Learning Support</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-400">
                {studentsRequiringSupport.length} Flagged
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Automated detection based on low task completion velocity or repeated simulation over-drafts.
            </p>

            <div className="space-y-2.5 pt-1">
              {studentsRequiringSupport.map((st) => (
                <div key={st.id} className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{st.name}</span>
                    <span className="text-amber-300 font-mono text-[11px] font-bold">
                      {st.totalXP} XP · Level {st.currentLevel}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {st.supportReason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Failed / Challenging Tasks */}
          <div className="glass-panel p-5 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Curriculum Bottlenecks & High Failure Tasks</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-500/10 text-rose-400">
                Action Required
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tasks exhibiting above-average student fail rates; candidates for classroom review.
            </p>

            <div className="space-y-2.5 pt-1">
              {frequentlyFailedTasks.map((t) => (
                <div key={t.taskId} className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Domain: {t.category.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold text-[11px]">
                      {t.failureRate} Fail Rate
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">{t.failCount} attempts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section: Curriculum Category Performance */}
        <div className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Curriculum Category Performance (%)</h3>
              <p className="text-[11px] text-slate-400">Completion rate across groundwater learning domains</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={categoryPerformance} 
                margin={{ top: 10, right: 20, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={120} />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Completion Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lower Grid: Difficulty Breakdown & Incomplete Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty Breakdown Cards */}
          <div className="glass-panel p-5 border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">Difficulty Mastery Breakdown</h3>
            <p className="text-[11px] text-slate-400 mb-4">Class success rate categorized by mission complexity</p>

            <div className="space-y-4">
              {difficultyBreakdown.map((diff) => (
                <div key={diff.difficulty} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1.5 font-bold">
                    <span className="text-white">{diff.difficulty}</span>
                    <span className="text-emerald-400">{diff.completionRate}% Avg Success</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        diff.difficulty === 'BEGINNER' ? 'bg-blue-400' :
                        diff.difficulty === 'INTERMEDIATE' ? 'bg-emerald-400' : 'bg-purple-400'
                      }`}
                      style={{ width: `${diff.completionRate}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {diff.totalMissions} missions in this category
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Incomplete & Overdue List */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center gap-2 mb-1 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Pending & Overdue Attention List</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">Students requiring teacher reminder or follow-up</p>

            <div className="space-y-2.5">
              {incompleteAssignments && incompleteAssignments.length > 0 ? (
                incompleteAssignments.map((item) => (
                  <div 
                    key={item.assignmentId} 
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{item.studentName}</div>
                      <div className="text-[11px] text-slate-400">{item.missionTitle}</div>
                      {item.dueDate && (
                        <div className="text-[10px] text-rose-400 mt-0.5">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-6 text-center">
                  No overdue assignments currently detected in the classroom.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Report Export Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultReportType="TEACHER_CLASSROOM"
        role="TEACHER"
      />
    </TeacherLayout>
  );
};

export default TeacherAnalyticsPage;
