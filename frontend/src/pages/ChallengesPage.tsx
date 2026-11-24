import React, { useEffect, useState } from 'react';
import { TopHUD } from '../components/game-hud/TopHUD';
import { LeftNav } from '../components/game-hud/LeftNav';
import { ChallengeCard } from '../components/challenges/ChallengeCard';
import { challengeService } from '../services/challenge.service';
import { Challenge } from '../types/gamification';
import { Trophy, Clock, Zap, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'JOINED'>('ALL');

  const loadChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allList, myList] = await Promise.all([
        challengeService.getChallenges(),
        challengeService.getMyChallenges(),
      ]);

      const myChallengeIds = new Set(myList.map((m: any) => m.challengeId));
      const myCompletedIds = new Set(
        myList.filter((m: any) => m.isCompleted).map((m: any) => m.challengeId)
      );

      const enriched = allList.map((c) => ({
        ...c,
        isJoined: myChallengeIds.has(c.id),
        isCompleted: myCompletedIds.has(c.id),
      }));

      setChallenges(enriched);
      setMyChallenges(myList);
    } catch (err: any) {
      setError('Unable to load challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    if (tab === 'DAILY') return c.challengeType === 'DAILY';
    if (tab === 'WEEKLY') return c.challengeType === 'WEEKLY';
    if (tab === 'JOINED') return c.isJoined;
    return true;
  });

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      <TopHUD />
      <LeftNav />

      <main className="flex-1 overflow-y-auto pl-24 pr-8 pt-24 pb-16 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Time-Bound Quests</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Conservation Quests & Challenges
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Complete daily and weekly field challenges to earn high XP bounties and accelerate your journey to JalRakshak Master.
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

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-6 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 self-start w-fit">
          <button
            onClick={() => setTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Quests ({challenges.length})
          </button>
          <button
            onClick={() => setTab('DAILY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === 'DAILY'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Quests
          </button>
          <button
            onClick={() => setTab('WEEKLY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === 'WEEKLY'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Challenges
          </button>
          <button
            onClick={() => setTab('JOINED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === 'JOINED'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Enrolled ({myChallenges.length})
          </button>
        </div>

        {/* Challenge Cards List */}
        {loading ? (
          <div className="glass-panel p-20 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-semibold">Synchronizing active quests...</span>
          </div>
        ) : error ? (
          <div className="glass-panel p-16 rounded-2xl text-center text-rose-400 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-bold">{error}</span>
            <button
              onClick={loadChallenges}
              className="mt-2 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
            >
              Retry
            </button>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl text-center text-slate-400">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No quests found</p>
            <p className="text-xs text-slate-500 mt-1">
              Check back soon for new daily groundwater conservation scenarios.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoined={loadChallenges}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChallengesPage;
