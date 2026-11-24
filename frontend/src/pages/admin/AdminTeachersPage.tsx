import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { AdminTeacher } from '../../types/admin';
import {
  GraduationCap,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  BookOpenCheck,
  UserX,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const AdminTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(null);

  const fetchTeachers = () => {
    setLoading(true);
    adminService.getTeachers({
      page,
      limit: 10,
      search: search.trim() || undefined,
      status: statusFilter
    })
      .then((data) => {
        if (data) {
          setTeachers(data.teachers);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      })
      .catch((err) => console.error('Failed to load teachers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTeachers();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Educator Roster Oversight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Teacher & Classroom Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit supervising educators, inspect classroom student allocations, and identify unassigned teachers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
              Total Educators: <span className="text-emerald-400 font-extrabold">{total}</span>
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teacher by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </form>

          <div className="flex items-center gap-3">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Teachers</option>
              <option value="INACTIVE">Deactivated Teachers</option>
            </select>
          </div>
        </div>

        {/* Teachers Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-semibold">Loading teachers directory...</span>
          </div>
        ) : teachers.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs">
            No teachers found matching criteria.
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Educator Details</th>
                    <th className="py-3 px-4">Supervision Cohort</th>
                    <th className="py-3 px-4">Classroom Assignments</th>
                    <th className="py-3 px-4">Supervision Status</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-[11px]">
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="text-[10px] text-slate-400">{t.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          <span>{t.assignedStudentsCount} Supervised Students</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5 font-bold">
                          <BookOpenCheck className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t.classroomAssignmentsCount} Dispatched</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {t.isUnassigned ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            No Students Assigned
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            Active Cohort
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {t.isActive ? (
                          <span className="text-emerald-400 text-[11px] font-bold">Active</span>
                        ) : (
                          <span className="text-rose-400 text-[11px] font-bold">Inactive</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTeacher(t)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Cohort</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div>
                Page <span className="font-bold text-white">{page}</span> of <span className="font-bold text-white">{totalPages}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Cohort Inspector Modal */}
        {selectedTeacher && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 max-w-lg w-full border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedTeacher.name}</h3>
                  <p className="text-xs text-slate-400">{selectedTeacher.email}</p>
                </div>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-slate-300 mb-2">
                  Supervised Student Cohort ({selectedTeacher.assignedStudents?.length || 0})
                </h4>
                {selectedTeacher.assignedStudents && selectedTeacher.assignedStudents.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedTeacher.assignedStudents.map((st) => (
                      <div key={st.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{st.name}</div>
                          <div className="text-[10px] text-slate-400">{st.email}</div>
                        </div>
                        <span className={`text-[10px] font-bold ${st.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {st.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic p-4 text-center bg-slate-900/40 rounded-lg">
                    No students currently assigned to this educator.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTeachersPage;
