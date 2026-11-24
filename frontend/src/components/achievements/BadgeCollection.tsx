import React, { useState } from 'react';
import { Achievement } from '../../types/gamification';
import { AchievementCard } from './AchievementCard';
import { Award, CheckCircle2, Lock } from 'lucide-react';

interface BadgeCollectionProps {
  achievements: Achievement[];
  onSelectAchievement?: (achievement: Achievement) => void;
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  achievements,
  onSelectAchievement,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? +((unlockedCount / totalCount) * 100).toFixed(0) : 0;

  const filtered = achievements.filter((a) => {
    if (filter === 'UNLOCKED') return a.isUnlocked;
    if (filter === 'LOCKED') return !a.isUnlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-medium">Honor Roll Progress</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl font-extrabold text-white font-mono">
              {unlockedCount} / {totalCount} Badges Unlocked
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filter === 'ALL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Badges ({totalCount})
          </button>
          <button
            onClick={() => setFilter('UNLOCKED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              filter === 'UNLOCKED'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('LOCKED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              filter === 'LOCKED'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Locked ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border-slate-800 text-center">
          <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Badges in This Category</h4>
          <p className="text-xs text-slate-400 mt-1">
            Complete more groundwater conservation missions to unlock new achievements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((achievement) => (
            <AchievementCard
              key={achievement.id || achievement.code}
              achievement={achievement}
              onSelect={onSelectAchievement}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;
