import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { teacherAssignmentService } from '../../services/teacherAssignment.service';
import { TeacherStudentItem } from '../../types/gamification';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowRight, 
  Zap, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  UserX,
  Loader2,
  BookPlus
} from 'lucide-react';

export const TeacherStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<TeacherStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    teacherAssignmentService
      .getMyStudents()
      .then((data) => setStudents(data))
      .catch((err) => console.error('Failed to load students:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filter students based on search and dropdown filters
  const filteredStudents = students.filter((student) => {
    const level = student.currentLevel || student.userXP?.currentLevel || 1;
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = 
      levelFilter === 'ALL' || 
      (levelFilter === 'LVL1' && level === 1) ||
      (levelFilter === 'LVL2' && level === 2) ||
      (levelFilter === 'LVL3_PLUS' && level >= 3);

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && student.isActive !== false) ||
      (statusFilter === 'INACTIVE' && student.isActive === false);

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getLevelBadgeClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 2:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 3:
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 4:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 5:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <TeacherLayout activeNav="students">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Roster Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Supervised Students
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Directly supervise student performance, XP gains, and individual hydrological progression.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
              Total Supervised: <span className="text-emerald-400 font-extrabold">{students.length}</span>
            </span>
            <Link
              to="/teacher/assignments"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
            >
              <BookPlus className="w-4 h-4" />
              <span>Assign Mission</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Levels</option>
                <option value="LVL1">Level 1 (Explorer)</option>
                <option value="LVL2">Level 2 (Guardian)</option>
                <option value="LVL3_PLUS">Level 3+ (Protector & above)</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Students</option>
              <option value="INACTIVE">Inactive Students</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-semibold">Loading student roster...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center gap-3">
            <UserX className="w-10 h-10 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-300">No Supervised Students Found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchQuery || levelFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'No students matched your search and filter criteria. Try resetting filters.'
                : 'No students have been assigned to your supervision yet.'}
            </p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student Details</th>
                    <th className="py-3.5 px-4">Current Level</th>
                    <th className="py-3.5 px-4">Total XP</th>
                    <th className="py-3.5 px-4">Completed Missions</th>
                    <th className="py-3.5 px-4">Achievements</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase shrink-0">
                            {student.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const lvl = student.currentLevel || student.userXP?.currentLevel || 1;
                          const title = student.levelTitle || student.userXP?.levelTitle || 'Water Explorer';
                          return (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getLevelBadgeClass(lvl)}`}>
                              <ShieldCheck className="w-3 h-3" />
                              <span>Lvl {lvl}</span>
                              <span className="text-[10px] opacity-75 hidden xl:inline">({title})</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Total XP */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{(student.totalXP ?? student.userXP?.totalXP ?? 0).toLocaleString()} XP</span>
                        </div>
                      </td>

                      {/* Completed Missions */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{student.completedMissionsCount ?? 0} Missions</span>
                        </div>
                      </td>

                      {/* Achievements */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-purple-400" />
                          <span>{student.achievementsCount ?? 0} Badges</span>
                        </div>
                      </td>

                      {/* Activity Status */}
                      <td className="py-3.5 px-4">
                        {student.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 text-[10px] font-semibold">
                            <Clock className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/teacher/students/${student.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-bold text-xs transition-colors border border-slate-700/80 group-hover:border-emerald-500/30"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherStudentsPage;
