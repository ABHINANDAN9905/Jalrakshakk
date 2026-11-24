import React from 'react';
import { Zap } from 'lucide-react';

interface XPProgressBarProps {
  currentXP: number;
  minXPForCurrentLevel?: number;
  minXPForNextLevel?: number | null;
  xpToNextLevel?: number;
  progressPercentage?: number;
  compact?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  minXPForCurrentLevel = 0,
  minXPForNextLevel = 500,
  progressPercentage,
  compact = false,
}) => {
  // If next level exists, compute percent within level
  let pct = progressPercentage;
  if (pct === undefined || pct === null) {
    if (minXPForNextLevel && minXPForNextLevel > minXPForCurrentLevel) {
      const denom = minXPForNextLevel - minXPForCurrentLevel;
      const num = currentXP - minXPForCurrentLevel;
      pct = Math.min(100, Math.max(0, +((num / denom) * 100).toFixed(1)));
    } else {
      pct = 100;
    }
  }

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
          <span className="flex items-center gap-1 font-bold text-amber-400">
            <Zap className="w-3 h-3 fill-current" />
            {currentXP.toLocaleString()} XP
          </span>
          <span>{minXPForNextLevel ? `${minXPForNextLevel.toLocaleString()} XP` : 'MAX'}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-sm shadow-amber-500/50"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-900/60 p-3 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </span>
          <span className="font-bold text-white font-mono">
            {currentXP.toLocaleString()} XP
          </span>
        </div>
        <span className="text-slate-400 text-[11px] font-mono">
          {minXPForNextLevel ? (
            <>
              <span className="text-amber-400 font-bold">{Math.max(0, minXPForNextLevel - currentXP).toLocaleString()} XP</span> to next level
            </>
          ) : (
            <span className="text-emerald-400 font-bold">Max Tier Reached</span>
          )}
        </span>
      </div>

      {/* Bar */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 relative">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 shadow-sm shadow-amber-500/50"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
        <span>Tier base: {minXPForCurrentLevel.toLocaleString()} XP</span>
        <span className="font-semibold text-slate-400">{pct}% Complete</span>
        <span>Goal: {minXPForNextLevel ? `${minXPForNextLevel.toLocaleString()} XP` : 'MAX'}</span>
      </div>
    </div>
  );
};

export default XPProgressBar;
