import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { AdminUser } from '../../types/admin';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Edit2
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal Dialog States
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [statusConfirmModalOpen, setStatusConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    adminService.getUsers({
      page,
      limit: 10,
      search: search.trim() || undefined,
      role: roleFilter,
      status: statusFilter
    })
      .then((data) => {
        if (data) {
          setUsers(data.users);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      })
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await adminService.updateUserRole(selectedUser.id, selectedNewRole);
      setFeedback({ type: 'success', message: `Successfully updated ${selectedUser.name}'s role to ${selectedNewRole}.` });
      setRoleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update user role. Action blocked.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setFeedback(null);
    const newStatus = !selectedUser.isActive;
    try {
      await adminService.updateUserStatus(selectedUser.id, newStatus);
      setFeedback({
        type: 'success',
        message: `Account for ${selectedUser.name} has been ${newStatus ? 'activated' : 'deactivated'}.`
      });
      setStatusConfirmModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update account status. Action blocked.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">ADMIN</span>;
      case 'TEACHER':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">TEACHER</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">STUDENT</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Identity & Access Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              User Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit registered accounts, manage user roles, and control active credentials across all tiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
              Total Accounts: <span className="text-sky-400 font-extrabold">{total}</span>
            </span>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch}
              onInput={(e: any) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="TEACHER">Teachers</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Deactivated Accounts</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            <span className="text-xs font-semibold">Loading user accounts...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs">
            No registered users found matching the selected query.
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4">Platform Scope</th>
                    <th className="py-3 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-[11px] uppercase">
                            {u.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="py-3 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {u.role === 'STUDENT' && `${u._count?.missionProgress || 0} Missions • ${u._count?.simulationRuns || 0} Sims`}
                        {u.role === 'TEACHER' && `${u._count?.studentsAssigned || 0} Supervised Students`}
                        {u.role === 'ADMIN' && 'System Governance Master'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {/* Change Role Button */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setSelectedNewRole(u.role as any);
                            setRoleModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                        >
                          Change Role
                        </button>

                        {/* Status Toggle Button */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setStatusConfirmModalOpen(true);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            u.isActive
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
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
                Showing page <span className="font-bold text-white">{page}</span> of <span className="font-bold text-white">{totalPages}</span> ({total} users)
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

        {/* Change Role Modal */}
        {roleModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 max-w-md w-full border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Modify User Access Role</h3>
              <p className="text-xs text-slate-400">
                Updating role for <span className="font-bold text-white">{selectedUser.name}</span> ({selectedUser.email}).
              </p>

              <div>
                <label className="block text-slate-400 text-xs font-bold mb-2">Select Target Role</label>
                <div className="space-y-2">
                  {(['STUDENT', 'TEACHER', 'ADMIN'] as const).map((r) => (
                    <label key={r} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="radio"
                        name="newRole"
                        value={r}
                        checked={selectedNewRole === r}
                        onChange={() => setSelectedNewRole(r)}
                        className="text-sky-500"
                      />
                      <span className="text-xs font-bold text-white">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20"
                >
                  {submitting ? 'Updating...' : 'Confirm Role Change'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Status Confirmation Modal */}
        {statusConfirmModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 max-w-md w-full border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Account Status Modification</span>
              </div>
              <p className="text-xs text-slate-300">
                Are you sure you want to {selectedUser.isActive ? 'deactivate' : 'activate'} the account for <strong className="text-white">{selectedUser.name}</strong>?
              </p>
              {selectedUser.role === 'ADMIN' && selectedUser.isActive && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300">
                  <strong>Notice:</strong> The system enforces protection against deactivating the last active administrator account.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setStatusConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusToggle}
                  disabled={submitting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 ${
                    selectedUser.isActive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {submitting ? 'Processing...' : (selectedUser.isActive ? 'Deactivate Account' : 'Activate Account')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
