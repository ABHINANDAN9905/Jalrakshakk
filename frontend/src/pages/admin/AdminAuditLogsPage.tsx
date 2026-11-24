import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { AdminAuditLog } from '../../types/admin';
import {
  ScrollText,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw
} from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');

  const fetchAuditLogs = () => {
    setLoading(true);
    adminService.getAuditLogs({
      page,
      limit: 20,
      action: actionFilter,
      resource: resourceFilter
    })
      .then((data) => {
        if (data.isUnavailable) {
          setIsUnavailable(true);
          setLogs([]);
        } else {
          setIsUnavailable(false);
          setLogs(data.logs || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch((err) => {
        console.error('Failed to load audit logs:', err);
        setIsUnavailable(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter, resourceFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes('DEACTIVATED') || action.includes('DELETED')) {
      return <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold text-[10px]">{action}</span>;
    }
    if (action.includes('ACTIVATED') || action.includes('CREATED')) {
      return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">{action}</span>;
    }
    if (action.includes('ROLE')) {
      return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">{action}</span>;
    }
    return <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold text-[10px]">{action}</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <ScrollText className="w-4 h-4" />
              <span>Immutable Security Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Activity Audit Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              MongoDB-backed append-only audit trail capturing security operations, privilege updates, and entity modifications.
            </p>
          </div>

          <button
            onClick={fetchAuditLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* MongoDB Unavailable Alert */}
        {isUnavailable && (
          <div className="glass-panel p-6 border-amber-500/30 bg-amber-950/20 text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">MongoDB Audit Storage Disconnected</h3>
              <p className="text-xs text-amber-300/80 mt-1">
                The platform&apos;s MongoDB cluster is currently offline or unreachable. Administrative actions are securely processed, but historical audit trails cannot be loaded from the secondary document store until connectivity is restored.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Actions</option>
              <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
              <option value="USER_ACTIVATED">USER_ACTIVATED</option>
              <option value="USER_DEACTIVATED">USER_DEACTIVATED</option>
              <option value="VILLAGE_CREATED">VILLAGE_CREATED</option>
              <option value="VILLAGE_UPDATED">VILLAGE_UPDATED</option>
              <option value="MISSION_CREATED">MISSION_CREATED</option>
              <option value="CHALLENGE_CREATED">CHALLENGE_CREATED</option>
            </select>

            <select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Resource Types</option>
              <option value="USER">USER</option>
              <option value="VILLAGE">VILLAGE</option>
              <option value="MISSION">MISSION</option>
              <option value="CHALLENGE">CHALLENGE</option>
            </select>
          </div>

          <span className="text-slate-400 font-bold">
            Total Captured Events: <span className="text-purple-400 font-extrabold">{total}</span>
          </span>
        </div>

        {/* Audit Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-xs font-semibold">Querying MongoDB security audit collection...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs">
            {isUnavailable
              ? 'Audit log storage is currently unavailable.'
              : 'No audit records found matching the query.'}
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource Target</th>
                    <th className="py-3 px-4">Actor ID</th>
                    <th className="py-3 px-4">Context Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {logs.map((log, idx) => (
                    <tr key={log.id || log._id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        {getActionBadge(log.action)}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="font-bold text-white">{log.resource}</span>
                        {log.resourceId && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                            {log.resourceId}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                        {log.actorId ? log.actorId.slice(0, 13) + '...' : 'System'}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-md truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : '-'}
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
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogsPage;
