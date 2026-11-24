import React, { useEffect, useState } from 'react';
import { TopHUD } from '../components/game-hud/TopHUD';
import { LeftNav } from '../components/game-hud/LeftNav';
import { BadgeCollection } from '../components/achievements/BadgeCollection';
import { AchievementUnlockModal } from '../components/achievements/AchievementUnlockModal';
import { achievementService } from '../services/achievement.service';
import { Achievement } from '../types/gamification';
import { Award, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const loadAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allAchievements, myAchievements] = await Promise.all([
        achievementService.getAchievements(),
        achievementService.getMyAchievements(),
      ]);

      const myUnlockedMap = new Map<string, string>();
      myAchievements.forEach((ua: any) => {
        const code = ua.achievement?.code || ua.achievementCode;
        if (code) {
          myUnlockedMap.set(code.toUpperCase(), ua.unlockedAt || new Date().toISOString());
        }
      });

      const enriched = allAchievements.map((ach) => {
        const code = ach.code.toUpperCase();
        const isUnlocked = myUnlockedMap.has(code);
        return {
          ...ach,
          isUnlocked,
          unlockedAt: isUnlocked ? myUnlockedMap.get(code) : undefined,
        };
      });

      setAchievements(enriched);
    } catch (err: any) {
      setError('Failed to load achievement badges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      <TopHUD />
      <LeftNav />

      <main className="flex-1 overflow-y-auto pl-24 pr-8 pt-24 pb-16 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Honor Roll & Hydrological Badges</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Aquifer Stewardship Achievements
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Earn prestigious badges by mastering Indian hydrogeology, cutting agricultural draft, harvesting monsoon runoff, and preventing well depletion.
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

        {/* Badge Collection Grid */}
        {loading ? (
          <div className="glass-panel p-20 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-xs font-semibold">Loading achievement badges...</span>
          </div>
        ) : error ? (
          <div className="glass-panel p-16 rounded-2xl text-center text-rose-400 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-bold">{error}</span>
            <button
              onClick={loadAchievements}
              className="mt-2 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
            >
              Retry
            </button>
          </div>
        ) : (
          <BadgeCollection
            achievements={achievements}
            onSelectAchievement={(ach) => setSelectedAchievement(ach)}
          />
        )}

        {/* Selected Modal */}
        {selectedAchievement && (
          <AchievementUnlockModal
            achievement={selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </main>
    </div>
  );
};

export default AchievementsPage;
