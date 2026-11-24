import React, { useState } from 'react';
import { analyticsService } from '../../services/analytics.service';
import { ReportExportParams } from '../../types/analytics';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReportType?: 'STUDENT_PROGRESS' | 'TEACHER_CLASSROOM' | 'MISSION_PERFORMANCE' | 'GROUNDWATER_SIMULATION' | 'ADMIN_PLATFORM';
  studentId?: string;
  role?: string;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  defaultReportType = 'STUDENT_PROGRESS',
  studentId,
  role = 'STUDENT'
}) => {
  const [reportType, setReportType] = useState<ReportExportParams['reportType']>(defaultReportType);
  const [format, setFormat] = useState<'csv' | 'html'>('csv');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await analyticsService.exportReport({
        reportType,
        format,
        period,
        studentId
      });
      onClose();
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(err?.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Generate Analytical Report</h2>
              <p className="text-xs text-slate-400">
                Certified educational groundwater intelligence export
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Report Type Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Report Category
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setReportType('STUDENT_PROGRESS')}
                className={`p-3 rounded-xl text-left border font-semibold transition-all flex items-center justify-between ${
                  reportType === 'STUDENT_PROGRESS'
                    ? 'bg-sky-950/40 border-sky-500 text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold">Student Progression & Learning Report</div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    XP growth, mission completions, category mastery, simulation trials
                  </div>
                </div>
                {reportType === 'STUDENT_PROGRESS' && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setReportType('GROUNDWATER_SIMULATION')}
                className={`p-3 rounded-xl text-left border font-semibold transition-all flex items-center justify-between ${
                  reportType === 'GROUNDWATER_SIMULATION'
                    ? 'bg-sky-950/40 border-sky-500 text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold">Groundwater Water Balance Simulation Log</div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    Recharge rates, extraction drafts, storage changes, sustainability scores
                  </div>
                </div>
                {reportType === 'GROUNDWATER_SIMULATION' && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
              </button>

              {(role === 'TEACHER' || role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => setReportType('TEACHER_CLASSROOM')}
                  className={`p-3 rounded-xl text-left border font-semibold transition-all flex items-center justify-between ${
                    reportType === 'TEACHER_CLASSROOM'
                      ? 'bg-sky-950/40 border-sky-500 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold">Supervised Classroom Roster Report</div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      Classwide completion rates, student rankings, learning support alerts
                    </div>
                  </div>
                  {reportType === 'TEACHER_CLASSROOM' && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                </button>
              )}

              {role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => setReportType('ADMIN_PLATFORM')}
                  className={`p-3 rounded-xl text-left border font-semibold transition-all flex items-center justify-between ${
                    reportType === 'ADMIN_PLATFORM'
                      ? 'bg-sky-950/40 border-sky-500 text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold">Global Platform Administration Report</div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      Platform growth, active users, village engagement telemetry
                    </div>
                  </div>
                  {reportType === 'ADMIN_PLATFORM' && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                </button>
              )}
            </div>
          </div>

          {/* Export Format Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  format === 'csv'
                    ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div className="font-bold">CSV Spreadsheet</div>
                  <div className="text-[10px] text-slate-400">Excel & Analytics ready</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('html')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  format === 'html'
                    ? 'bg-cyan-950/30 border-cyan-500 text-cyan-200'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold">Printable PDF View</div>
                  <div className="text-[10px] text-slate-400">Formatted A4 document</div>
                </div>
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Evaluation Period
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`py-2 rounded-lg font-bold border text-center transition-all ${
                    period === p
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Disclaimer Callout */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Notice:</strong> All exported hydrological metrics are simulated educational values calculated using Central Ground Water Board (CGWB) water balance equations. They do not constitute actual field sensor observations.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
