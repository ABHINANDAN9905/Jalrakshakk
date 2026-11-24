import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpenCheck, 
  BarChart3, 
  FileSpreadsheet, 
  Bell, 
  Compass, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  X,
  Menu
} from 'lucide-react';
import { teacherAssignmentService } from '../../services/teacherAssignment.service';
import { TeacherNotification } from '../../types/teacher';
import { useGameStore } from '../../store/gameStore';
import { NotificationBell } from '../notifications/NotificationBell';

interface TeacherLayoutProps {
  children: React.ReactNode;
  activeNav?: 'dashboard' | 'students' | 'assignments' | 'analytics' | 'reports';
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children, activeNav = 'dashboard' }) => {
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userProgression = useGameStore((state) => state.userProgression);

  useEffect(() => {
    teacherAssignmentService.getTeacherNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const NAV_LINKS = [
    { to: '/teacher/dashboard', label: 'Classroom Overview', icon: LayoutDashboard },
    { to: '/teacher/students', label: 'Supervised Students', icon: Users },
    { to: '/teacher/assignments', label: 'Mission Assignments', icon: BookOpenCheck },
    { to: '/teacher/analytics', label: 'Classroom Analytics', icon: BarChart3 },
    { to: '/teacher/reports', label: 'Reports & Export', icon: FileSpreadsheet },
  ];

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'MISSION_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'ASSIGNMENT_OVERDUE':
        return <Clock className="w-4 h-4 text-rose-400" />;
      case 'ACHIEVEMENT_UNLOCKED':
        return <GraduationCap className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Educator Portal
              </span>
              <h1 className="text-base font-extrabold text-white leading-tight">
                JalRakshak Class
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shadow-md shadow-emerald-500/10'
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
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Open 3D Village World</span>
          </Link>
          <div className="text-[11px] text-slate-500 text-center font-mono">
            Teacher ID: {userProgression.userId ? userProgression.userId.slice(0, 8) : 'usr-tch'}...
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300">
                Active Classroom: Maharashtra Rural Groundwater Cluster
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-Time Central Notification Bell */}
            <NotificationBell />

            {/* Educator Avatar Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                T
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-white block leading-tight">
                  {userProgression.displayName || 'Authorized Educator'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight">
                  Supervisory Role
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Slide-Out Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden flex">
            <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <span className="text-xs font-bold text-white">Teacher Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {NAV_LINKS.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center rounded-xl bg-slate-800 text-xs font-bold text-sky-400"
              >
                Return to 3D Village
              </Link>
            </div>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
