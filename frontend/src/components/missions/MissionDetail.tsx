import React, { useState } from 'react';
import { Mission } from '../../types/gamification';
import { MissionTaskList } from './MissionTaskList';
import { MissionProgress } from './MissionProgress';
import { missionService } from '../../services/mission.service';
import { useGameStore } from '../../store/gameStore';
import { Link } from 'react-router-dom';
import {
  X,
  Target,
  Award,
  Clock,
  Lock,
  Play,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Compass,
  AlertCircle
} from 'lucide-react';

interface MissionDetailProps {
  mission: Mission;
  userLevel: number;
  onClose: () => void;
  onMissionUpdated: () => void;
}

export const MissionDetail: React.FC<MissionDetailProps> = ({
  mission,
  userLevel,
  onClose,
  onMissionUpdated,
}) => {
  const isLocked = mission.requiredLevel > userLevel;
  const isCompleted = mission.userProgress?.status === 'COMPLETED' || (mission.userProgress?.progress ?? 0) >= 100;
  const isInProgress = mission.userProgress?.status === 'IN_PROGRESS';
  const progressPercent = mission.userProgress?.progress ?? 0;
  const completedTasks = mission.tasks?.filter((t) => t.isCompleted).length ?? 0;
  const totalTasks = mission.tasks?.length ?? 0;

  const setActiveMissionId = useGameStore((state) => state.setActiveMissionId);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartMission = async () => {
    setStarting(true);
    setErrorMsg('');
    const res = await missionService.startMission(mission.id);
    setStarting(false);
    if (res.success) {
      setActiveMissionId(mission.id);
      onMissionUpdated();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-panel-glow border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col relative shadow-2xl bg-slate-900/95">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 uppercase tracking-wider">
                {mission.category.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">
                {mission.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {mission.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-6">
          {/* Key Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reward XP</span>
              <span className="text-sm font-extrabold text-amber-300 font-mono mt-0.5 flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" />
                +{mission.xpReward} XP
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Required Level</span>
              <span className={`text-sm font-extrabold font-mono mt-0.5 flex items-center gap-1 ${isLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isLocked && <Lock className="w-3.5 h-3.5" />}
                Level {mission.requiredLevel}
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
              <span className="text-sm font-extrabold text-slate-200 font-mono mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {mission.estimatedDurationMinutes} mins
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mission Briefing
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Learning Objectives */}
          {mission.learningObjectives && mission.learningObjectives.length > 0 && (
            <div className="bg-sky-950/30 p-4 rounded-2xl border border-sky-500/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Pedagogical Learning Objectives
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {mission.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Operational Instructions */}
          {mission.instructions && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Field Instructions
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {mission.instructions}
              </p>
            </div>
          )}

          {/* Progress Overview */}
          <MissionProgress
            progressPercentage={progressPercent}
            completedTasksCount={completedTasks}
            totalTasksCount={totalTasks}
          />

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Interactive Tasks Component */}
          <MissionTaskList
            missionId={mission.id}
            tasks={mission.tasks || []}
            onTaskCompleted={onMissionUpdated}
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            onClick={() => setActiveMissionId(mission.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Return to 3D Village</span>
          </Link>

          <div className="flex items-center gap-2">
            {!isInProgress && !isCompleted && !isLocked && (
              <button
                disabled={starting}
                onClick={handleStartMission}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{starting ? 'Starting Directive...' : 'Start Mission'}</span>
              </button>
            )}

            {isInProgress && (
              <span className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Directive In Progress
              </span>
            )}

            {isCompleted && (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionDetail;
