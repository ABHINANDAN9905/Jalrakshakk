import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Lazy-load game pages for optimized bundle size and fast initial load
const VillagePage = lazy(() => import('./pages/VillagePage').then((m) => ({ default: m.VillagePage })));
const MissionsPage = lazy(() => import('./pages/MissionsPage').then((m) => ({ default: m.MissionsPage })));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage').then((m) => ({ default: m.ChallengesPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then((m) => ({ default: m.AchievementsPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const WaterMentorPage = lazy(() => import('./pages/WaterMentorPage').then((m) => ({ default: m.WaterMentorPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));

// Lazy-load Teacher Dashboard pages
const TeacherDashboardPage = lazy(() => import('./pages/teacher/TeacherDashboardPage').then((m) => ({ default: m.TeacherDashboardPage })));
const TeacherStudentsPage = lazy(() => import('./pages/teacher/TeacherStudentsPage').then((m) => ({ default: m.TeacherStudentsPage })));
const TeacherStudentDetailPage = lazy(() => import('./pages/teacher/TeacherStudentDetailPage').then((m) => ({ default: m.TeacherStudentDetailPage })));
const TeacherAssignmentsPage = lazy(() => import('./pages/teacher/TeacherAssignmentsPage').then((m) => ({ default: m.TeacherAssignmentsPage })));
const TeacherAnalyticsPage = lazy(() => import('./pages/teacher/TeacherAnalyticsPage').then((m) => ({ default: m.TeacherAnalyticsPage })));
const TeacherReportsPage = lazy(() => import('./pages/teacher/TeacherReportsPage').then((m) => ({ default: m.TeacherReportsPage })));

// Lazy-load Admin Governance pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminTeachersPage = lazy(() => import('./pages/admin/AdminTeachersPage').then((m) => ({ default: m.AdminTeachersPage })));
const AdminVillagesPage = lazy(() => import('./pages/admin/AdminVillagesPage').then((m) => ({ default: m.AdminVillagesPage })));
const AdminMissionsPage = lazy(() => import('./pages/admin/AdminMissionsPage').then((m) => ({ default: m.AdminMissionsPage })));
const AdminChallengesPage = lazy(() => import('./pages/admin/AdminChallengesPage').then((m) => ({ default: m.AdminChallengesPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminSystemHealthPage = lazy(() => import('./pages/admin/AdminSystemHealthPage').then((m) => ({ default: m.AdminSystemHealthPage })));

const PageFallback: React.FC = () => (
  <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
    <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
      Loading JalRakshak Module...
    </span>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<VillagePage />} />
          <Route path="/village" element={<VillagePage />} />
          <Route path="/mentor" element={<WaterMentorPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/student" element={<AnalyticsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Teacher Dashboard Routes */}
          <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
          <Route path="/teacher/students" element={<TeacherStudentsPage />} />
          <Route path="/teacher/students/:studentId" element={<TeacherStudentDetailPage />} />
          <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
          <Route path="/teacher/analytics" element={<TeacherAnalyticsPage />} />
          <Route path="/teacher/reports" element={<TeacherReportsPage />} />

          {/* Admin Platform Governance Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/teachers" element={<AdminTeachersPage />} />
          <Route path="/admin/villages" element={<AdminVillagesPage />} />
          <Route path="/admin/missions" element={<AdminMissionsPage />} />
          <Route path="/admin/challenges" element={<AdminChallengesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="/admin/system-health" element={<AdminSystemHealthPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
