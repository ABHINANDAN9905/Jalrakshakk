import React, { useEffect, useState } from 'react';
import { TopHUD } from '../components/game-hud/TopHUD';
import { LeftNav } from '../components/game-hud/LeftNav';
import { LeaderboardTable } from '../components/leaderboards/LeaderboardTable';
import { MissionAssignmentPanel } from '../components/teacher/MissionAssignmentPanel';
import { leaderboardService } from '../services/leaderboard.service';
import { LeaderboardEntry, LeaderboardType } from '../types/gamification';
import { useGameStore } from '../store/gameStore';
import { Users, Trophy, Award, ArrowRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentType, setCurrentType] = useState<LeaderboardType>('TOTAL_XP');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab between Public Leaderboard and Teacher Supervisory Desk
  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'TEACHER'>('LEADERBOARD');

  const userProgression = useGameStore((state) => state.userProgression);
  const isTeacherOrAdmin = userProgression.role === 'TEACHER' || userProgression.role === 'ADMIN';

  const loadLeaderboard = async (type: LeaderboardType) => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaderboardService.getLeaderboard(type);
      setEntries(data);
    } catch (err: any) {
      setError('Failed to load leaderboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'LEADERBOARD') {
      loadLeaderboard(currentType);
    }
  }, [currentType, activeTab]);

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      <TopHUD />
      <LeftNav />

      <main className="flex-1 overflow-y-auto pl-24 pr-8 pt-24 pb-16 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Statewide Watershed Roster</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Water Champions Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Official student rankings based on verified groundwater simulation math, watershed artificial recharge, and completed missions.
            </p>
          </div>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors border border-slate-700"
          >
            <span>Return to 3D Village</span>
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </Link>
        </div>

        {/* View Switcher: Leaderboard vs Teacher Panel */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('LEADERBOARD')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'LEADERBOARD'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Student Rankings</span>
          </button>

          {isTeacherOrAdmin && (
            <button
              onClick={() => setActiveTab('TEACHER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'TEACHER'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Teacher Assignment Desk</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        {activeTab === 'LEADERBOARD' ? (
          <LeaderboardTable
            entries={entries}
            currentType={currentType}
            onTypeChange={(newType) => setCurrentType(newType)}
            currentUserId={userProgression.userId}
            isLoading={loading}
            error={error}
          />
        ) : (
          <MissionAssignmentPanel />
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;
