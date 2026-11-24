import React from 'react';

interface MissionProgressProps {
  progressPercentage: number;
  completedTasksCount: number;
  totalTasksCount: number;
  compact?: boolean;
}

export const MissionProgress: React.FC<MissionProgressProps> = ({
  progressPercentage,
  completedTasksCount,
  totalTasksCount,
  compact = false,
}) => {
  const isComplete = progressPercentage >= 100 || (totalTasksCount > 0 && completedTasksCount >= totalTasksCount);

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center text-[11px] mb-1 font-semibold">
          <span className="text-slate-400">
            Tasks: <span className="text-white font-mono">{completedTasksCount}/{totalTasksCount}</span>
          </span>
          <span className={`font-mono ${isComplete ? 'text-emerald-400 font-bold' : 'text-sky-400'}`}>
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-sky-500 to-cyan-400'
            }`}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/50 p-3 rounded-xl border border-slate-800">
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-slate-400 font-medium">Directive Completion</span>
        <span className={`font-mono font-bold ${isComplete ? 'text-emerald-400' : 'text-sky-400'}`}>
          {progressPercentage}%
        </span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
              : 'bg-gradient-to-r from-sky-500 to-cyan-400 shadow-sm shadow-sky-500/50'
          }`}
          style={{ width: `${Math.min(100, progressPercentage)}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
        <span>Verified Tasks</span>
        <span>{completedTasksCount} of {totalTasksCount} completed</span>
      </div>
    </div>
  );
};

export default MissionProgress;
