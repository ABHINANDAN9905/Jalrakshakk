import React from 'react';
import { LeaderboardEntry, LeaderboardType } from '../../types/gamification';
import { LevelBadge } from '../progression/LevelBadge';
import { Trophy, Award, Target, Calendar, User, AlertCircle, Loader2 } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
  currentUserId?: string;
  isLoading?: boolean;
  error?: string | null;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentType,
  onTypeChange,
  currentUserId,
  isLoading = false,
  error = null,
}) => {
  const tabs: Array<{ type: LeaderboardType; label: string; icon: any }> = [
    { type: 'TOTAL_XP', label: 'Total XP', icon: Trophy },
    { type: 'WEEKLY_XP', label: 'Weekly XP', icon: Calendar },
    { type: 'MISSIONS_COMPLETED', label: 'Missions Completed', icon: Target },
    { type: 'ACHIEVEMENTS_COUNT', label: 'Honor Badges', icon: Award },
  ];

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black inline-flex items-center justify-center shadow-lg shadow-amber-500/30 text-xs">
            1
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black inline-flex items-center justify-center shadow-md text-xs">
            2
          </span>
        );
      case 3:
        return (
          <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black inline-flex items-center justify-center shadow-md text-xs">
            3
          </span>
        );
      default:
        return <span className="text-slate-400 font-mono text-xs">{rank}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => onTypeChange(tab.type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Table Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            <span className="text-xs font-semibold">Loading student leaderboard rankings...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-bold">Failed to load leaderboard data</span>
            <span className="text-xs text-slate-400">{error}</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No leaderboard records available</p>
            <p className="text-xs text-slate-500 mt-1">
              Be the first student to complete missions and earn XP!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 text-center">Tier</th>
                  <th className="py-3.5 px-4 text-right">Metric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {entries.map((entry) => {
                  const isCurrent = currentUserId && entry.studentId === currentUserId;

                  return (
                    <tr
                      key={`${entry.rank}-${entry.studentId}`}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-sky-500/15 font-bold border-l-4 border-l-sky-400'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {getRankBadge(entry.rank)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">
                            {entry.studentName}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-300 font-bold border border-sky-500/40">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <LevelBadge
                          level={entry.currentLevel || 1}
                          levelTitle={entry.levelTitle || 'Water Explorer'}
                          size="sm"
                          showTitle={false}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-300 text-sm">
                        {entry.score.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {entry.metricLabel || 'XP'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable;
