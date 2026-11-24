import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { LevelBadge } from '../progression/LevelBadge';
import { XPRewardToast } from '../progression/XPRewardToast';
import { LevelUpModal } from '../progression/LevelUpModal';
import { Droplet, Award, Zap, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationBell } from '../notifications/NotificationBell';

export const TopHUD: React.FC = () => {
  const groundwaterData = useGameStore((state) => state.groundwaterData);
  const userProgression = useGameStore((state) => state.userProgression);
  const isUndergroundView = useGameStore((state) => state.isUndergroundView);
  const isSocketConnected = useGameStore((state) => state.isSocketConnected);
  const refreshProgression = useGameStore((state) => state.refreshProgression);

  useEffect(() => {
    refreshProgression();
  }, [refreshProgression]);

  const metrics = groundwaterData.metrics;

  const getConditionStyle = (cond: string) => {
    switch (cond) {
      case 'OPTIMAL':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'SAFE':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'SEMI_CRITICAL':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'CRITICAL':
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  // Progression calculation from authoritative backend
  const currentXP = userProgression.totalXP;
  const xpToNext = userProgression.xpToNextLevel || 500;
  const xpProgress = Math.min(100, Math.max(0, Math.round((currentXP / (xpToNext || 1)) * 100)));

  return (
    <>
      <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Village & Aquifer Quick Metrics */}
        <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-4 pointer-events-auto shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {groundwaterData.villageName}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getConditionStyle(
                    metrics.conditionCategory
                  )}`}
                >
                  {metrics.conditionCategory.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {groundwaterData.district}, {groundwaterData.state}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700/60 hidden sm:block" />

          {/* Aquifer Storage & Depth Status */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Water Table Depth
              </span>
              <span className="text-sky-300 font-bold font-mono">
                {metrics.depthToWaterTableMeters} m
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Aquifer Storage
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, metrics.storagePercentage)}%` }}
                  />
                </div>
                <span className="text-cyan-400 font-bold font-mono">
                  {metrics.storagePercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Active View Badge (When Underground) & Socket Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isUndergroundView && (
            <div className="glass-panel px-4 py-1.5 rounded-full border-sky-400/30 text-sky-300 text-xs font-semibold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Subterranean Aquifer Cross-Section View
            </div>
          )}

          <div className="glass-panel px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 border border-slate-700/60">
            <span
              className={`w-2 h-2 rounded-full ${
                isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              {isSocketConnected ? 'Real-Time Sync' : 'REST Mode'}
            </span>
          </div>
        </div>

        {/* Right: Notifications, Student Profile & Authoritative XP Progression */}
        <div className="flex items-center gap-2.5">
          <NotificationBell className="pointer-events-auto" />

          <Link
            to="/achievements"
            className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3.5 pointer-events-auto shadow-xl hover:border-amber-400/50 transition-colors group"
          >
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                {userProgression.displayName}
              </span>
              <LevelBadge
                level={userProgression.currentLevel}
                levelTitle={userProgression.levelTitle}
                size="sm"
                showTitle={false}
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-medium">
                {userProgression.levelTitle}
              </span>
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-amber-300 font-mono flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-current" />
                {currentXP.toLocaleString()} XP
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-sm shadow">
            {userProgression.displayName ? userProgression.displayName.charAt(0) : 'S'}
          </div>
        </Link>
      </div>
    </header>

      {/* Global XP Reward Toast and Level-Up Modal */}
      <XPRewardToast />
      <LevelUpModal />
    </>
  );
};

export default TopHUD;
