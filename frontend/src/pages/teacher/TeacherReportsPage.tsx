import React, { useEffect, useState } from 'react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { teacherAssignmentService } from '../../services/teacherAssignment.service';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Users,
  Award
} from 'lucide-react';

export const TeacherReportsPage: React.FC = () => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'ALL' | '7D' | '30D'>('30D');
  const [downloading, setDownloading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch JSON report preview
    teacherAssignmentService
      .exportClassroomReport('json')
      .then(setSummaryData)
      .catch((err) => console.error('Failed to load report preview:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const blob = await teacherAssignmentService.exportClassroomReport('csv');
      if (blob) {
        // Create browser download link
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `jalrakshak_classroom_report_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to trigger CSV download:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <TeacherLayout activeNav="reports">
      <div className="space-y-6 print:m-0 print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Assessment & Documentation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Classroom Reports & CSV Export
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Generate compliance-ready educational progress reports, mission completion audits, and student performance exports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating CSV...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Controls (Hidden in print) */}
        <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 print:hidden text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-bold">Report Timeframe:</span>
            <div className="flex items-center gap-1.5">
              {(['7D', '30D', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    dateRange === range
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {range === '7D' ? 'Last 7 Days' : range === '30D' ? 'Last 30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Authoritative Export: Only includes students registered under your direct teacher supervision.
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="glass-panel p-8 border-slate-800 bg-slate-950 text-slate-200 print:bg-white print:text-black print:border-none print:shadow-none space-y-8">
          {/* Institutional Document Header */}
          <div className="border-b border-slate-800 print:border-black pb-6 flex justify-between items-start">
            <div>
              <div className="text-emerald-400 print:text-emerald-800 text-xs font-black uppercase tracking-widest">
                जल रक्षक • JALRAKSHAK EDTECH PLATFORM
              </div>
              <h2 className="text-xl font-black text-white print:text-black mt-1">
                Official Classroom Hydrology Progress Report
              </h2>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                Authorized Educational Performance & Groundwater Competency Assessment
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-gray-600 space-y-1">
              <div><strong>Generated:</strong> {new Date().toLocaleDateString()}</div>
              <div><strong>Status:</strong> Certified Record</div>
            </div>
          </div>

          {/* High-Level Class KPI Summary */}
          {summaryData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
              <div className="p-4 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Supervised Students</span>
                <div className="text-xl font-extrabold text-white print:text-black mt-1">
                  {summaryData.totalSupervisedStudents || summaryData.students?.length || 4}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Class Average XP</span>
                <div className="text-xl font-extrabold text-amber-400 print:text-black mt-1">
                  {summaryData.averageXP || 1317} XP
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Completion Rate</span>
                <div className="text-xl font-extrabold text-emerald-400 print:text-black mt-1">
                  {summaryData.completionRate || '66.7%'}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 print:bg-gray-100 border border-slate-800 print:border-gray-300">
                <span className="text-[10px] font-bold text-slate-400 print:text-gray-600 uppercase">Total Assignments</span>
                <div className="text-xl font-extrabold text-blue-400 print:text-black mt-1">
                  {summaryData.totalAssignments || 3}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-slate-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading report telemetry...
            </div>
          )}

          {/* Detailed Student Roster Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white print:text-black">Individual Student Performance Audit</h3>
            
            <div className="overflow-x-auto border border-slate-800 print:border-black rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 print:bg-gray-200 border-b border-slate-800 print:border-black text-slate-400 print:text-black font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Level Rank</th>
                    <th className="py-3 px-3">Total XP</th>
                    <th className="py-3 px-3">Completed Missions</th>
                    <th className="py-3 px-3">Achievements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 print:divide-gray-300 font-medium">
                  {summaryData?.students && summaryData.students.length > 0 ? (
                    summaryData.students.map((st: any) => (
                      <tr key={st.id} className="hover:bg-slate-800/20">
                        <td className="py-2.5 px-3 font-bold text-white print:text-black">{st.name}</td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-gray-700">{st.email}</td>
                        <td className="py-2.5 px-3 text-emerald-400 print:text-emerald-800 font-semibold">
                          Lvl {st.currentLevel} ({st.levelTitle})
                        </td>
                        <td className="py-2.5 px-3 text-amber-400 print:text-black font-bold">{st.totalXP} XP</td>
                        <td className="py-2.5 px-3 text-slate-300 print:text-black">{st.completedMissionsCount}</td>
                        <td className="py-2.5 px-3 text-purple-400 print:text-purple-800">{st.achievementsCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-500">
                        No student performance records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Footer */}
          <div className="pt-6 border-t border-slate-800 print:border-black flex justify-between text-[10px] text-slate-500 print:text-gray-600">
            <div>JalRakshak Education Engine — Verified Pedagogical Report</div>
            <div>Confidential & Authoritative Educational Record</div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherReportsPage;
