import React, { useEffect, useState, useMemo } from 'react';
import { TopHUD } from '../components/game-hud/TopHUD';
import { LeftNav } from '../components/game-hud/LeftNav';
import { MissionCard } from '../components/missions/MissionCard';
import { MissionDetail } from '../components/missions/MissionDetail';
import { missionService } from '../services/mission.service';
import { Mission, MissionCategory, MissionDifficulty } from '../types/gamification';
import { useGameStore } from '../store/gameStore';
import { 
  Target, 
  Search, 
  Filter, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Clock, 
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'GROUNDWATER_CONSERVATION', label: 'Groundwater Conservation' },
  { key: 'RAINWATER_HARVESTING', label: 'Rainwater Harvesting' },
  { key: 'SUSTAINABLE_AGRICULTURE', label: 'Sustainable Agriculture' },
  { key: 'IRRIGATION_EFFICIENCY', label: 'Irrigation Efficiency' },
  { key: 'WATER_QUALITY', label: 'Water Quality' },
  { key: 'POLLUTION_PREVENTION', label: 'Pollution Prevention' },
  { key: 'COMMUNITY_AWARENESS', label: 'Community Awareness' },
  { key: 'DROUGHT_MANAGEMENT', label: 'Drought Management' },
];

const DIFFICULTIES: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All Difficulties' },
  { key: 'BEGINNER', label: 'Beginner' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

export const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'level' | 'xp' | 'duration'>('level');

  // Selected mission for detail modal
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const userProgression = useGameStore((state) => state.userProgression);
  const activeMissionId = useGameStore((state) => state.activeMissionId);
  const userLevel = userProgression.currentLevel || 1;

  const fetchMissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await missionService.getMissions();
      setMissions(data);
      // If there's an active mission ID in store, auto-select it if not yet selected
      if (activeMissionId && !selectedMission) {
        const found = data.find((m) => m.id === activeMissionId);
        if (found) setSelectedMission(found);
      }
    } catch (err: any) {
      setError('Unable to load missions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleStartMission = async (missionId: string) => {
    await missionService.startMission(missionId);
    fetchMissions();
  };

  // Filtered & sorted missions
  const filteredMissions = useMemo(() => {
    return missions
      .filter((mission) => {
        // Category filter
        if (selectedCategory !== 'ALL' && mission.category !== selectedCategory) {
          return false;
        }
        // Difficulty filter
        if (selectedDifficulty !== 'ALL' && mission.difficulty !== selectedDifficulty) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = mission.title.toLowerCase().includes(q);
          const matchDesc = mission.description.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'xp') return b.xpReward - a.xpReward;
        if (sortBy === 'duration') return a.estimatedDurationMinutes - b.estimatedDurationMinutes;
        return a.requiredLevel - b.requiredLevel;
      });
  }, [missions, selectedCategory, selectedDifficulty, searchQuery, sortBy]);

  // Status stats
  const completedCount = missions.filter((m) => m.userProgress?.status === 'COMPLETED').length;
  const inProgressCount = missions.filter((m) => m.userProgress?.status === 'IN_PROGRESS').length;
  const availableCount = missions.filter((m) => m.requiredLevel <= userLevel && m.userProgress?.status !== 'COMPLETED').length;
  const lockedCount = missions.filter((m) => m.requiredLevel > userLevel).length;

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      <TopHUD />
      <LeftNav />

      <main className="flex-1 overflow-y-auto pl-24 pr-8 pt-24 pb-16 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Hydrological Field Directives</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Groundwater Conservation Missions
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Explore hands-on missions to master aquifer recharge, micro-irrigation, pollution mitigation, and sustainable community governance.
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

        {/* Quick Stat Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="glass-panel p-3.5 rounded-xl border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available</span>
              <span className="text-sm font-extrabold text-white font-mono">{availableCount} Directives</span>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">In Progress</span>
              <span className="text-sm font-extrabold text-amber-300 font-mono">{inProgressCount} Active</span>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completed</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">{completedCount} Solved</span>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Locked</span>
              <span className="text-sm font-extrabold text-slate-400 font-mono">{lockedCount} Locked</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border-slate-800 mb-6 space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search missions, aquifers, crops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Sorting & Difficulty Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="level">Sort by Required Level</option>
                <option value="xp">Sort by XP Reward</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.key
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Missions Grid State Handling */}
        {loading ? (
          <div className="glass-panel p-20 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            <span className="text-xs font-semibold">Loading hydrological directives...</span>
          </div>
        ) : error ? (
          <div className="glass-panel p-16 rounded-2xl text-center text-rose-400 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-bold">{error}</span>
            <button
              onClick={fetchMissions}
              className="mt-2 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
            >
              Retry
            </button>
          </div>
        ) : filteredMissions.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl text-center text-slate-400">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No missions matched your criteria</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting category or difficulty filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                userLevel={userLevel}
                onSelect={(m) => setSelectedMission(m)}
                onStart={handleStartMission}
              />
            ))}
          </div>
        )}

        {/* Mission Detail Modal */}
        {selectedMission && (
          <MissionDetail
            mission={selectedMission}
            userLevel={userLevel}
            onClose={() => setSelectedMission(null)}
            onMissionUpdated={() => {
              fetchMissions();
              // Update selected mission view
              missionService.getMissionById(selectedMission.id).then((fresh) => {
                if (fresh) setSelectedMission(fresh);
              });
            }}
          />
        )}
      </main>
    </div>
  );
};

export default MissionsPage;
