import React, { useEffect, useState } from 'react';
import { TopHUD } from '../components/game-hud/TopHUD';
import { LeftNav } from '../components/game-hud/LeftNav';
import { useGameStore } from '../store/gameStore';
import { LevelBadge } from '../components/progression/LevelBadge';
import { XPProgressBar } from '../components/progression/XPProgressBar';
import { analyticsService } from '../services/analytics.service';
import { progressionService } from '../services/progression.service';
import { challengeService } from '../services/challenge.service';
import { achievementService } from '../services/achievement.service';
import { missionService } from '../services/mission.service';
import { DateRangeFilter } from '../components/analytics/DateRangeFilter';
import { InsightCard } from '../components/analytics/InsightCard';
import { SimulationComparisonCard } from '../components/analytics/SimulationComparisonCard';
import { ReportExportModal } from '../components/analytics/ReportExportModal';
import { 
  StudentLearningAnalytics, 
  SimulationComparisonData 
} from '../types/analytics';
import { XPTransaction } from '../types/gamification';
import { 
  BarChart3, 
  TrendingUp, 
  Droplets, 
  CloudRain, 
  ArrowRight, 
  Award, 
  Target, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  Clock,
  Sparkles,
  BookOpen,
  Download,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  Compass,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const groundwaterData = useGameStore((state) => state.groundwaterData);
  const userProgression = useGameStore((state) => state.userProgression);
  const metrics = groundwaterData.metrics;

  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [studentAnalytics, setStudentAnalytics] = useState<StudentLearningAnalytics | null>(null);
  const [comparisonData, setComparisonData] = useState<SimulationComparisonData | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [xpHistory, setXpHistory] = useState<XPTransaction[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<any | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<any | null>(null);
  const [myAchievements, setMyAchievements] = useState<any[]>([]);
  const [activeMissionsCount, setActiveMissionsCount] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      analyticsService.getStudentAnalytics(undefined, period).catch(() => null),
      analyticsService.getGroundwaterInsights().catch(() => null),
      progressionService.getXPHistory().catch(() => []),
      achievementService.getMyAchievements().catch(() => []),
      challengeService.getChallenges().catch(() => []),
      missionService.getMyMissionProgress().catch(() => [])
    ])
      .then(([analytics, comp, xp, ach, challenges, records]) => {
        if (analytics) setStudentAnalytics(analytics);
        if (comp) setComparisonData(comp);
        if (xp) setXpHistory(xp);
        if (ach) setMyAchievements(ach);

        if (Array.isArray(challenges)) {
          const daily = challenges.find((c) => c.challengeType === 'DAILY');
          const weekly = challenges.find((c) => c.challengeType === 'WEEKLY');
          setDailyChallenge(daily || null);
          setWeeklyChallenge(weekly || null);
        }

        if (Array.isArray(records)) {
          const inProgress = records.filter((r) => r.status === 'IN_PROGRESS').length;
          setActiveMissionsCount(inProgress);
        }
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative">
      <TopHUD />
      <LeftNav />

      <main className="flex-1 overflow-y-auto pl-24 pr-8 pt-24 pb-16 max-w-6xl mx-auto w-full space-y-8">
        {/* Header with Range Filter & Export Trigger */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Advanced Analytics & Learning Insights</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Aquifer Intelligence & Student Learning Cockpit
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Synthesized hydrological mass balance, rule-based scientific learning insights, and verified progression ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DateRangeFilter selectedPeriod={period} onSelectPeriod={setPeriod} />

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Scientific Simulation Model Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-900/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="text-cyan-300">Educational Simulation Engine Notice:</strong> All displayed water balances, infiltration rates, extraction drafts, and storage indices are computer-generated simulations grounded in Central Ground Water Board (CGWB) hydrological balance equations. They are instructional models designed to build groundwater conservation awareness and do not represent physical sensor telemetry.
          </div>
        </div>

        {/* SECTION 1: STUDENT PROGRESSION OVERVIEW */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
                <Trophy className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Student Progression Roster</h2>
                  <LevelBadge
                    level={studentAnalytics?.progression?.currentLevel || userProgression.currentLevel}
                    levelTitle={studentAnalytics?.progression?.levelTitle || userProgression.levelTitle}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Verified progression ledger: {studentAnalytics?.progression?.totalXP ?? userProgression.totalXP} Total Experience Points.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Level Goal</span>
                <span className="text-sm font-extrabold text-cyan-400 font-mono">
                  {studentAnalytics?.progression?.xpToNextLevel ?? 250} XP needed
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <XPProgressBar
            currentXP={studentAnalytics?.progression?.totalXP ?? userProgression.totalXP}
            minXPForCurrentLevel={studentAnalytics?.progression?.currentLevelMinXP ?? 0}
            minXPForNextLevel={studentAnalytics?.progression?.nextLevelMinXP ?? 500}
            progressPercentage={studentAnalytics?.progression?.progressPercentage ?? 45}
          />

          {/* Gamification Stats 4-Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                Missions Mastered
              </span>
              <span className="text-xl font-extrabold text-white mt-1 block font-mono">
                {studentAnalytics?.missionSummary?.completedCount ?? userProgression.completedMissionsCount}
              </span>
              <span className="text-[10px] text-slate-500">
                {studentAnalytics?.missionSummary?.successRate ?? 80}% success rate
              </span>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                Badges Unlocked
              </span>
              <span className="text-xl font-extrabold text-purple-300 mt-1 block font-mono">
                {studentAnalytics?.achievements?.unlockedCount ?? userProgression.earnedAchievementsCount}
              </span>
              <span className="text-[10px] text-purple-400/80">
                Phase 8 Honors Catalog
              </span>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Daily Challenge
              </span>
              <span className="text-xs font-bold text-amber-300 mt-1 block truncate">
                {dailyChallenge?.title || 'Daily Drip Master'}
              </span>
              <span className="text-[10px] text-slate-400">
                +{dailyChallenge?.xpReward || 150} XP reward
              </span>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Weekly Challenge
              </span>
              <span className="text-xs font-bold text-teal-300 mt-1 block truncate">
                {weeklyChallenge?.title || 'Weekly Watershed Builder'}
              </span>
              <span className="text-[10px] text-slate-400">
                +{weeklyChallenge?.xpReward || 300} XP reward
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: GROUNDWATER BEFORE VS AFTER SIMULATION COMPARISON */}
        {comparisonData && (
          <SimulationComparisonCard comparisonData={comparisonData} />
        )}

        {/* SECTION 3: RULE-BASED SCIENTIFIC LEARNING INSIGHTS */}
        {studentAnalytics?.learningInsights && (
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Rule-Based Learning Intelligence</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Scientific Strengths & Curriculum Recommendations
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demonstrated Strengths</span>
                </h4>
                {studentAnalytics.learningInsights.strengths.map((str, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1">
                    <div className="font-bold text-emerald-200">{str.title}</div>
                    <div className="text-slate-300 leading-relaxed">{str.detail}</div>
                  </div>
                ))}
              </div>

              {/* Areas for Growth / Recommendations */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Targeted Curriculum Recommendations</span>
                </h4>
                {studentAnalytics.learningInsights.areasForGrowth.map((area, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-1">
                    <div className="font-bold text-amber-200">{area.title}</div>
                    <div className="text-slate-300 leading-relaxed">{area.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Learning Milestones */}
            {studentAnalytics.learningInsights.milestones.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase text-sky-400 tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4" />
                  <span>Personal Learning Milestones Achieved</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studentAnalytics.learningInsights.milestones.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{m.title}</div>
                        <div className="text-[11px] text-slate-400">{m.description}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Achieved: {new Date(m.achievedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: CATEGORY MASTERY & XP TRAJECTORY CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Mastery Progress Bar List */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Curriculum Category Mastery</h3>
              <p className="text-xs text-slate-400">
                Completion percentage across key groundwater disciplines
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {(studentAnalytics?.categoryMastery || []).map((cat) => (
                <div key={cat.category} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-200">{cat.category.replace(/_/g, ' ')}</span>
                    <span className="text-cyan-400 font-mono font-bold">{cat.masteryPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${cat.masteryPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* XP Growth Timeline Chart */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Verified XP Growth Trajectory</h3>
              <p className="text-xs text-slate-400">
                Cumulative experience points accrued through simulation & mission mastery
              </p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentAnalytics?.xpGrowthTimeline || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="runningTotalXP"
                    name="Cumulative XP"
                    stroke="#0284c7"
                    fill="#0369a1"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SECTION 5: VILLAGE HYDROLOGICAL MASS BALANCE SNAPSHOTS */}
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Droplets className="w-4 h-4" />
            <span>Village Basin Mass Balance Snapshots</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                Annual Infiltration
              </span>
              <span className="text-xl font-bold text-white mt-1 block font-mono">
                {metrics.annualRechargeM3.toLocaleString()} m³
              </span>
              <span className="text-[11px] text-emerald-400 mt-0.5 block">
                +14% vs historic average
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Annual Draft (Extraction)
              </span>
              <span className="text-xl font-bold text-white mt-1 block font-mono">
                {metrics.annualExtractionM3.toLocaleString()} m³
              </span>
              <span className="text-[11px] text-amber-400 mt-0.5 block">
                Draft ratio: {metrics.netDraftPercentage}%
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                Monsoon Rainfall
              </span>
              <span className="text-xl font-bold text-white mt-1 block font-mono">
                {metrics.rainfallMm} mm
              </span>
              <span className="text-[11px] text-sky-400 mt-0.5 block">
                Semi-arid classification
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Water Quality Index
              </span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block font-mono">
                {metrics.waterQualityIndex} / 100
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Potable & safe for agriculture
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 6: RECHARGE VS EXTRACTION CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">
              Monthly Recharge vs. Extraction (m³)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Monsoon influx peaks in July-August; extraction peaks during post-monsoon Rabi crop cycle.
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groundwaterData.historicalTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="rechargeM3" name="Recharge" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="extractionM3" name="Extraction" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">
              Water Table Depth to Aquifer (Meters below ground)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Lower number indicates higher, healthier groundwater elevation.
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={groundwaterData.historicalTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[10, 22]} reversed />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="waterTableDepth"
                    name="Depth (m)"
                    stroke="#06b6d4"
                    fill="#0891b2"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      {/* Export Report Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultReportType="STUDENT_PROGRESS"
        role="STUDENT"
      />
    </div>
  );
};

export default AnalyticsPage;
