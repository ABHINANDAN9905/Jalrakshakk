import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { AdminSystemHealth } from '../../types/admin';
import {
  Activity,
  Server,
  Database,
  Radio,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  Clock,
  HardDrive
} from 'lucide-react';

export const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    adminService.getSystemHealth()
      .then(setHealth)
      .catch((err) => console.error('Failed to load system health:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            CONNECTED
          </span>
        );
      case 'CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CONFIGURED
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            DEGRADED
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
            NOT CONFIGURED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            DISCONNECTED
          </span>
        );
    }
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Real-Time Subsystems Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              System Health & Diagnostics
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live heartbeat monitoring of backend APIs, relational & document storage, WebSocket gateways, and external AI models.
            </p>
          </div>

          <button
            onClick={fetchHealth}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Health Status</span>
          </button>
        </div>

        {loading || !health ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs font-semibold">Probing cluster connectivity...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Application Uptime</span>
                  <div className="text-lg font-black text-white mt-0.5">{formatUptime(health.uptimeSeconds)}</div>
                </div>
                <Clock className="w-6 h-6 text-sky-400" />
              </div>

              <div className="glass-panel p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Runtime Environment</span>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">{health.environment.toUpperCase()}</div>
                </div>
                <Server className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="glass-panel p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Heap Memory Consumed</span>
                  <div className="text-lg font-black text-amber-400 mt-0.5">
                    {health.services.backendApi.memoryUsageMB} MB
                  </div>
                </div>
                <HardDrive className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            {/* Diagnostic Services Cards */}
            <div className="space-y-4">
              {/* Backend API */}
              <div className="glass-panel p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{health.services.backendApi.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Node.js Runtime {health.services.backendApi.nodeVersion} • Express 4.x Microframework
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(health.services.backendApi.status)}</div>
              </div>

              {/* PostgreSQL */}
              <div className="glass-panel p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{health.services.postgresql.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Relational Primary Store • ACID Source of Truth
                      {health.services.postgresql.latencyMs !== null && health.services.postgresql.latencyMs !== undefined && (
                        <span> • Latency: {health.services.postgresql.latencyMs} ms</span>
                      )}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(health.services.postgresql.status)}</div>
              </div>

              {/* MongoDB */}
              <div className="glass-panel p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{health.services.mongodb.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Telemetry & Security Audit Store • State: {health.services.mongodb.state || 'disconnected'}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(health.services.mongodb.status)}</div>
              </div>

              {/* Socket.IO */}
              <div className="glass-panel p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{health.services.socketIo.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Low-latency bi-directional WebSocket Gateway • Namespaces: {health.services.socketIo.activeNamespaces.join(', ')}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(health.services.socketIo.status)}</div>
              </div>

              {/* AI Water Mentor */}
              <div className="glass-panel p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{health.services.aiWaterMentor.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      GPT-4o-mini Hydrological Mentorship Engine • Real-time Scenario Feedback
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(health.services.aiWaterMentor.status)}</div>
              </div>
            </div>

            {/* Zero Credential Exposure Guarantee */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-500">
              <strong>Security Policy:</strong> Diagnostic endpoints report cluster health without exposing connection strings, database credentials, environment variables, or private API keys.
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSystemHealthPage;
