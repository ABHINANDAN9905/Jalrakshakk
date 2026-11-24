import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { teacherAssignmentService } from '../../services/teacherAssignment.service';
import { StudentDetailedProfile } from '../../types/teacher';
import { 
  ArrowLeft, 
  Printer, 
  BookPlus, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Calendar, 
  Clock, 
  Sparkles,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const TeacherStudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [profile, setProfile] = useState<StudentDetailedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    teacherAssignmentService
      .getStudentDetailedProfile(studentId)
      .then((data) => {
        if (data) {
          setProfile(data);
        } else {
          setError('Student record not found or access unauthorized.');
        }
      })
      .catch((err) => {
        console.error('Failed to load student detail:', err);
        setError('Failed to fetch student profile.');
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <TeacherLayout activeNav="students">
        <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-semibold">Compiling student hydrological portfolio...</span>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !profile) {
    return (
      <TeacherLayout activeNav="students">
        <div className="space-y-4">
          <Link
            to="/teacher/students"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Supervised Roster</span>
          </Link>

          <div className="glass-panel p-12 text-center text-rose-400 flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10" />
            <span className="text-sm font-bold">{error || 'Student information unavailable.'}</span>
            <p className="text-xs text-slate-500">
              Only students explicitly assigned to your supervision can be viewed.
            </p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const { student, progression, xpHistory, missions, achievements, learningStrengths, areasNeedingImprovement } = profile;

  return (
    <TeacherLayout activeNav="students">
      <div className="space-y-6 print:m-0 print:p-0">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <Link
            to="/teacher/students"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Supervised Roster</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Student Report</span>
            </button>
            <Link
              to={`/teacher/assignments?studentId=${student.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>Assign Mission</span>
            </Link>
          </div>
        </div>

        {/* Student Profile Overview Header */}
        <div className="glass-panel p-6 border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-emerald-950/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 uppercase">
                {student.name.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">{student.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    Supervised Student
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{student.email}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                  <span className="flex items-center gap-1 text-teal-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Level {student.currentLevel} — {student.levelTitle}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{student.totalXP.toLocaleString()} Total XP</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Level Progress Gauge */}
            <div className="w-full md:w-64 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-slate-400">Level Progression</span>
                <span className="text-emerald-400">{progression?.progressPercentage || 50}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progression?.progressPercentage || 50}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Lvl {student.currentLevel}</span>
                <span>Lvl {student.currentLevel + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pedagogical Learning Diagnosis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="glass-panel p-5 border-emerald-500/20 bg-emerald-950/10">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Pedagogical Strengths</span>
            </div>
            <ul className="space-y-2.5">
              {learningStrengths && learningStrengths.length > 0 ? (
                learningStrengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{strength}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">No specific strengths documented yet.</li>
              )}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="glass-panel p-5 border-amber-500/20 bg-amber-950/10">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span>Targeted Improvement Areas</span>
            </div>
            <ul className="space-y-2.5">
              {areasNeedingImprovement && areasNeedingImprovement.length > 0 ? (
                areasNeedingImprovement.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">No critical improvement needs flagged.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Missions & Quests Breakdown */}
        <div className="glass-panel p-5 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Assigned & Completed Missions</h3>
              <p className="text-xs text-slate-400">Detailed track of hydrological learning missions</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold">
              {missions.filter((m) => m.status === 'COMPLETED').length} / {missions.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {missions.map((mission) => (
              <div 
                key={mission.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  {mission.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-200">{mission.title}</span>
                    {mission.completedAt && (
                      <span className="text-[10px] text-slate-500 block">
                        Completed on {new Date(mission.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {mission.score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                      Score: {mission.score}%
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    mission.status === 'COMPLETED' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {mission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Unlocked */}
        <div className="glass-panel p-5 border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Achievements & Badges Collection</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((ach) => (
              <div 
                key={ach.code}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  ach.isUnlocked
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    ach.isUnlocked ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-600'
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{ach.name}</div>
                    <div className="text-[10px] text-amber-400 font-semibold">+{ach.xpReward} XP</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{ach.description}</p>
                {ach.isUnlocked && ach.unlockedAt && (
                  <div className="text-[9px] text-slate-500 mt-1.5">
                    Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* XP Transaction History */}
        <div className="glass-panel p-5 border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white">Recent Hydrological Activity & XP History</h3>
          </div>

          <div className="space-y-2">
            {xpHistory && xpHistory.length > 0 ? (
              xpHistory.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
                      {item.sourceType}
                    </span>
                    <span className="text-slate-300">{item.reason}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">+{item.amount} XP</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic p-3 text-center">
                No recent XP transactions recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherStudentDetailPage;
