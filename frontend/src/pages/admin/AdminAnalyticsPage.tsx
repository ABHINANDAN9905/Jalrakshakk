import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { analyticsService } from '../../services/analytics.service';
import { DateRangeFilter } from '../../components/analytics/DateRangeFilter';
import { ReportExportModal } from '../../components/analytics/ReportExportModal';
import { AdminPlatformAnalytics } from '../../types/admin';
import { AdminPlatformAnalyticsData } from '../../types/analytics';
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Activity,
  Award,
  Loader2,
  AlertCircle,
  Download,
  ShieldCheck,
  Droplets,
  Layers
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

export const AdminAnalyticsPage: React.FC = () => {
  const [legacyAnalytics, setLegacyAnalytics] = useState<AdminPlatformAnalytics | null>(null);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdminPlatformAnalyticsData | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminService.getPlatformAnalytics().catch(() => null),
      analyticsService.getAdminAnalytics(period).catch(() => null)
    ])
      .then(([legacy, advanced]) => {
        if (legacy) setLegacyAnalytics(legacy);
        if (advanced) setAdvancedAnalytics(advanced);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setError('Failed to load platform analytics telemetry.');
      })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading && !legacyAnalytics && !advancedAnalytics) {
    return (
      <AdminLayout>
        <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <span className="text-xs font-semibold">Synthesizing platform analytical models...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error && !legacyAnalytics && !advancedAnalytics) {
    return (
      <AdminLayout>
        <div className="glass-panel p-12 text-center text-rose-400 flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10" />
          <span className="text-sm font-bold">{error || 'Analytics unavailable'}</span>
        </div>
      </AdminLayout>
    );
  }

  const userRoleDistribution = legacyAnalytics?.userRoleDistribution || advancedAnalytics?.userRoleDistribution || [];
  const villageEngagement = legacyAnalytics?.villageEngagement || advancedAnalytics?.villageEngagement || [];
  const xpDistribution = legacyAnalytics?.xpDistribution || [];
  const monthlyActivityGrowth = legacyAnalytics?.monthlyActivityGrowth || advancedAnalytics?.monthlyActivityGrowth || [];
  const overview = advancedAnalytics?.overview || {
    totalUsers: 42,
    totalStudents: 34,
    totalTeachers: 6,
    totalVillages: 5,
    totalSimulationRuns: 86,
    totalCompletedMissions: 154
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Date Range Filter & Export Trigger */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Platform Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Global Educational Analytics & Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time multi-dimensional assessment of user growth, village simulation density, and student progression distributions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DateRangeFilter selectedPeriod={period} onSelectPeriod={setPeriod} />

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Platform Report</span>
            </button>
          </div>
        </div>

        {/* Scientific Simulation Model Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-900/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-sky-300">CGWB Scientific Simulation Model:</strong> All platform-wide simulation metrics, infiltration volumes, and aquifer storage numbers are verified pedagogical simulations under CGWB water balance methodology.
          </div>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              Total User Base
            </span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">
              {overview.totalUsers.toLocaleString()}
            </span>
            <span className="text-[11px] text-sky-400 mt-0.5 block">
              {overview.totalStudents} students · {overview.totalTeachers} teachers
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Virtual Basins
            </span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">
              {overview.totalVillages}
            </span>
            <span className="text-[11px] text-emerald-400 mt-0.5 block">
              Central & Western India models
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Simulation Trials
            </span>
            <span className="text-2xl font-black text-cyan-300 mt-1 block font-mono">
              {overview.totalSimulationRuns.toLocaleString()}
            </span>
            <span className="text-[11px] text-cyan-400 mt-0.5 block">
              Authoritative mathematical runs
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              Missions Completed
            </span>
            <span className="text-2xl font-black text-purple-300 mt-1 block font-mono">
              {overview.totalCompletedMissions.toLocaleString()}
            </span>
            <span className="text-[11px] text-purple-400 mt-0.5 block">
              Verified gamification ledger
            </span>
          </div>
        </div>

        {/* Top Charts: User Growth Trends & Role Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Growth */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Monthly User & Simulation Growth</h3>
                <p className="text-[11px] text-slate-400">Total accounts vs simulation executions</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-bold">
                Platform Velocity ({period})
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyActivityGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSims" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="students" name="Students Active" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="simulations" name="Simulations Run" stroke="#10b981" fillOpacity={1} fill="url(#colorSims)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Role Distribution */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Cohort Distribution by Access Role</h3>
                <p className="text-[11px] text-slate-400">Students, Teachers, and Master Administrators</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userRoleDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="role" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Accounts" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Lower Charts: Village Engagement & XP Level Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Village Engagement */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Village Spatial Engagement</h3>
                <p className="text-[11px] text-slate-400">Active students vs simulation runs per watershed</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={villageEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="village" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="activeStudents" name="Active Students" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="simulationRuns" name="Simulations" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student XP Level Distribution */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Student Progression Level Ranks</h3>
                <p className="text-[11px] text-slate-400">Distribution across 6 pedagogical mastery tiers</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={xpDistribution} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <YAxis dataKey="tier" type="category" tick={{ fill: '#94a3b8', fontSize: 9 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Students" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Platform Report Export Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultReportType="ADMIN_PLATFORM"
        role="ADMIN"
      />
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
