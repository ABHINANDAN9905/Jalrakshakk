import React from 'react';
import { Mission } from '../../types/gamification';
import { MissionProgress } from './MissionProgress';
import { 
  Target, 
  Award, 
  Clock, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Droplet, 
  CloudRain, 
  Sprout, 
  Gauge, 
  Sparkles, 
  Sun,
  ShieldCheck
} from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
  userLevel: number;
  onSelect: (mission: Mission) => void;
  onStart: (missionId: string) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  userLevel,
  onSelect,
  onStart,
}) => {
  const isLocked = mission.requiredLevel > userLevel;
  const isCompleted = mission.userProgress?.status === 'COMPLETED' || (mission.userProgress?.progress ?? 0) >= 100;
  const isInProgress = mission.userProgress?.status === 'IN_PROGRESS';
  const progressPercent = mission.userProgress?.progress ?? 0;
  const completedTasks = mission.tasks?.filter((t) => t.isCompleted).length ?? 0;
  const totalTasks = mission.tasks?.length ?? 0;

  const getCategoryMeta = (category: string) => {
    switch (category) {
      case 'GROUNDWATER_CONSERVATION':
      case 'GROUNDWATER':
        return { label: 'Groundwater Conservation', icon: Droplet, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' };
      case 'RAINWATER_HARVESTING':
        return { label: 'Rainwater Harvesting', icon: CloudRain, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' };
      case 'SUSTAINABLE_AGRICULTURE':
        return { label: 'Sustainable Agriculture', icon: Sprout, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
      case 'IRRIGATION_EFFICIENCY':
      case 'IRRIGATION':
        return { label: 'Irrigation Efficiency', icon: Gauge, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
      case 'WATER_QUALITY':
      case 'WATER_POLLUTION':
      case 'POLLUTION_PREVENTION':
        return { label: 'Water Quality', icon: Sparkles, color: 'text-teal-400 border-teal-500/30 bg-teal-500/10' };
      case 'DROUGHT_MANAGEMENT':
        return { label: 'Drought Management', icon: Sun, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
      default:
        return { label: 'Community Hydrology', icon: ShieldCheck, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'BEGINNER':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'INTERMEDIATE':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'ADVANCED':
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const catMeta = getCategoryMeta(mission.category);
  const CategoryIcon = catMeta.icon;

  return (
    <div
      onClick={() => onSelect(mission)}
      className={`glass-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
        isCompleted
          ? 'border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-400/60 shadow-lg shadow-emerald-950/20'
          : isLocked
          ? 'opacity-60 border-slate-800 bg-slate-900/40'
          : isInProgress
          ? 'border-sky-500/60 bg-sky-950/20 shadow-xl shadow-sky-950/30 hover:border-sky-400'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:shadow-xl'
      }`}
    >
      {/* Top Metadata */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${catMeta.color}`}>
            <CategoryIcon className="w-3 h-3" />
            <span className="truncate max-w-[140px]">{catMeta.label}</span>
          </span>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadge(mission.difficulty)}`}>
              {mission.difficulty}
            </span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1 font-mono">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              +{mission.xpReward} XP
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-sky-300 transition-colors">
          {mission.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {mission.description}
        </p>

        {/* Level & Time Pill */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {mission.estimatedDurationMinutes} mins
          </span>
          <span>•</span>
          <span className={`flex items-center gap-1 ${isLocked ? 'text-rose-400 font-semibold' : 'text-slate-300'}`}>
            {isLocked && <Lock className="w-3 h-3" />}
            Requires Level {mission.requiredLevel}
          </span>
        </div>
      </div>

      {/* Footer Progress & Action */}
      <div className="pt-3 border-t border-slate-800/80">
        <MissionProgress
          progressPercentage={progressPercent}
          completedTasksCount={completedTasks}
          totalTasksCount={totalTasks}
          compact
        />

        <div className="mt-4 flex items-center justify-between">
          {isCompleted ? (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Mission Completed
            </span>
          ) : isLocked ? (
            <span className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5" />
              Unlock at Level {mission.requiredLevel}
            </span>
          ) : isInProgress ? (
            <span className="text-sky-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <Target className="w-3.5 h-3.5" />
              Active Directive
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStart(mission.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-sky-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Mission
            </button>
          )}

          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
            <span>View Directive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionCard;
