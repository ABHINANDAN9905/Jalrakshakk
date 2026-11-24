import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { AdminDashboardStats } from '../../types/admin';
import {
  Users,
  GraduationCap,
  MapPin,
  BookOpenCheck,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  Server,
  PlusCircle,
  Loader2,
  AlertCircle,
  Megaphone,
  X
} from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { AdminAnnouncement } from '../../types/notification';
import { AnnouncementComposer } from '../../components/notifications/AnnouncementComposer';
import { AnnouncementList } from '../../components/notifications/AnnouncementList';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [adminAnnouncements, setAdminAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const loadAdminAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const res = await notificationService.getAdminAnnouncements();
      setAdminAnnouncements(res);
    } catch (err) {
      console.error('Failed to load admin announcements:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleOpenBroadcastModal = () => {
    setShowBroadcastModal(true);
    loadAdminAnnouncements();
  };

  const handleDeactivateAnnouncement = async (id: string) => {
    try {
      await notificationService.deactivateAdminAnnouncement(id);
      loadAdminAnnouncements();
    } catch (err) {
      console.error('Failed to deactivate announcement:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    adminService.getDashboardStats()
      .then(setStats)
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        setError('Failed to load administrative telemetry.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
          <span className="text-xs font-semibold">Compiling platform governance telemetry...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="glass-panel p-12 text-center text-rose-400 flex flex-col items-center gap-3">
          <AlertCircle className="w-10 h-10" />
          <span className="text-sm font-bold">{error || 'Dashboard unavailable'}</span>
        </div>
      </AdminLayout>
    );
  }

  const { overview, registrationTrends, missionTrends, systemStatus } = stats;

  const KPI_CARDS = [
    { label: 'Total Registered Users', value: overview.totalUsers, sub: `${overview.totalActiveUsers} active accounts`, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Enrolled Students', value: overview.totalStudents, sub: 'Active gameplay learners', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Supervising Teachers', value: overview.totalTeachers, sub: 'Classroom managers', icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Simulated Villages', value: overview.totalVillages, sub: 'Alluvial & Deccan models', icon: MapPin, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'Curriculum Missions', value: overview.totalMissions, sub: `${overview.totalCompletedMissions} completions`, icon: BookOpenCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Simulation Runs', value: overview.totalSimulationRuns, sub: 'Authoritative hydrologic loops', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Achievements Unlocked', value: overview.totalAchievementsUnlocked, sub: 'Student earned credentials', icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Master Administrators', value: overview.totalAdmins, sub: 'Governance authority', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Server className="w-4 h-4" />
              <span>Platform Cockpit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              JalRakshak Governance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Global overview of user cohorts, educational engagement, simulation workloads, and platform infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/users"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Users</span>
            </Link>
            <Link
              to="/admin/missions"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-sky-500/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Mission</span>
            </Link>
          </div>
        </div>

        {/* 8 Primary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KPI_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="glass-panel p-4 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {card.value.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {card.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid: Registration Activity & Mission Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Registration Activity */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Weekly User Registration Momentum</h3>
                <p className="text-[11px] text-slate-400">New student and educator signups</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold text-[10px]">
                Past 5 Days
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" name="New Users" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorReg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mission Progress Distribution */}
          <div className="glass-panel p-5 border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Curriculum Mission Completion Status</h3>
                <p className="text-[11px] text-slate-400">Completed vs In-progress quests by domain</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 glass-panel p-5 border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">Administrative Control Actions</h3>
            <p className="text-[11px] text-slate-400 mb-4">Direct shortcuts to high-frequency governance workflows</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <Link
                to="/admin/users"
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/50 transition-all group"
              >
                <Users className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">User Directory</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Change roles, activate accounts</div>
              </Link>

              <Link
                to="/admin/villages"
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-800/50 transition-all group"
              >
                <MapPin className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Create Village</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Model new watershed regions</div>
              </Link>

              <Link
                to="/admin/missions"
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all group"
              >
                <BookOpenCheck className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Curriculum Missions</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Author educational tasks & XP</div>
              </Link>

              <Link
                to="/admin/challenges"
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/50 transition-all group"
              >
                <Award className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Deploy Challenge</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Launch weekly time-bound events</div>
              </Link>

              <Link
                to="/admin/audit-logs"
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group"
              >
                <Activity className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Security Audits</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Inspect administrative events</div>
              </Link>

              <Link
                to="/admin/system-health"
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/50 transition-all group"
              >
                <Server className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">System Diagnostics</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Real-time database connectivity</div>
              </Link>

              <button
                type="button"
                onClick={handleOpenBroadcastModal}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/50 transition-all group text-left"
              >
                <Megaphone className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-white">Platform Broadcast</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Send alerts to students & teachers</div>
              </button>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="glass-panel p-5 border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cluster Health</span>
              </div>
              <h3 className="text-base font-bold text-white">Infrastructure Overview</h3>
              <p className="text-[11px] text-slate-400 mt-1">High-availability service mesh status</p>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-300 font-semibold">Core Express HTTP Gateway</span>
                  <span className="text-emerald-400 font-bold text-[11px]">OPERATIONAL</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-300 font-semibold">PostgreSQL (Prisma Relational)</span>
                  <span className={`font-bold text-[11px] ${systemStatus.database === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {systemStatus.database}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span className="text-slate-300 font-semibold">MongoDB (Telemetry & Audits)</span>
                  <span className={`font-bold text-[11px] ${systemStatus.mongodb === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {systemStatus.mongodb}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/admin/system-health"
              className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              <span>Inspect Detailed Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Broadcast Announcements Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel p-6 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-6 rounded-2xl relative shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-bold text-white">Platform-Wide Announcement Manager</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-5">
                <AnnouncementComposer
                  role="ADMIN"
                  onCreated={loadAdminAnnouncements}
                />
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-sky-400" />
                    <span>Recent Broadcasts</span>
                  </h3>
                  {loadingAnnouncements && <Loader2 className="w-4 h-4 animate-spin text-sky-400" />}
                </div>
                <AnnouncementList
                  announcements={adminAnnouncements}
                  onDeactivate={handleDeactivateAnnouncement}
                  role="ADMIN"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
