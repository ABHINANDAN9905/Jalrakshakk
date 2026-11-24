import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  MapPin,
  BookOpenCheck,
  Trophy,
  BarChart3,
  ScrollText,
  Activity,
  Menu,
  X,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Server
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { AdminSystemHealth } from '../../types/admin';
import { NotificationBell } from '../notifications/NotificationBell';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);

  useEffect(() => {
    adminService.getSystemHealth()
      .then(setHealth)
      .catch(() => null);
  }, []);

  const NAV_LINKS = [
    { to: '/admin/dashboard', label: 'Platform Overview', icon: ShieldAlert },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/teachers', label: 'Teacher Oversight', icon: GraduationCap },
    { to: '/admin/villages', label: 'Village Modeling', icon: MapPin },
    { to: '/admin/missions', label: 'Curriculum Missions', icon: BookOpenCheck },
    { to: '/admin/challenges', label: 'Community Challenges', icon: Trophy },
    { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Activity Audit Logs', icon: ScrollText },
    { to: '/admin/system-health', label: 'System Health', icon: Activity }
  ];

  const isHealthy = health?.services.backendApi.status === 'CONNECTED';

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-sky-500/20">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                Platform Governance
              </span>
              <h1 className="text-base font-extrabold text-white leading-tight">
                JalRakshak Admin
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold shadow-md shadow-sky-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          {/* System Health Status Indicator */}
          <Link
            to="/admin/system-health"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
              <span className="text-[11px] font-bold text-slate-300">System Telemetry</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {isHealthy ? 'Operational' : 'Diagnostic'}
            </span>
          </Link>

          {/* Shortcut to 3D Village and Teacher Portal */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <Link
              to="/village"
              className="flex items-center justify-center gap-1 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Compass className="w-3 h-3" />
              <span>3D Village</span>
            </Link>
            <Link
              to="/teacher/dashboard"
              className="flex items-center justify-center gap-1 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
            >
              <GraduationCap className="w-3 h-3" />
              <span>Teacher Hub</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
                ADMIN CONSOLE
              </span>
              <span className="text-xs text-slate-400">Governance & Subsystems Architecture</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 text-slate-950 font-black flex items-center justify-center text-xs">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <span className="block font-bold text-white text-[11px] leading-tight">Administrator</span>
                <span className="block text-[9px] text-slate-400 leading-tight">Master Authority</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1 z-50">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
