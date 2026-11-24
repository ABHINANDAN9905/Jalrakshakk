export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

export interface StudentProgressionMetrics {
  totalXP: number;
  currentLevel: number;
  levelTitle: string;
  currentLevelMinXP: number;
  nextLevelMinXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
}

export interface MissionSummaryMetrics {
  totalAttempted: number;
  completedCount: number;
  inProgressCount: number;
  failedCount: number;
  successRate: number;
}

export interface CategoryMasteryItem {
  category: string;
  attempted: number;
  completed: number;
  masteryPercentage: number;
}

export interface XPGrowthPoint {
  date: string;
  amount: number;
  runningTotalXP: number;
  reason: string;
}

export interface LearningObservation {
  type: string;
  title: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'CRITICAL';
  rule: string;
}

export interface LearningRecommendation {
  action: string;
  priority: 'HIGH' | 'CRITICAL' | 'MODERATE' | 'LOW';
  suggestion: string;
}

export interface LearningStrength {
  category: string;
  title: string;
  detail: string;
}

export interface LearningGrowthArea {
  category: string;
  title: string;
  detail: string;
}

export interface LearningMilestone {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
}

export interface StudentLearningInsights {
  isSimulated: boolean;
  modelDisclaimer: string;
  strengths: LearningStrength[];
  areasForGrowth: LearningGrowthArea[];
  milestones: LearningMilestone[];
  metrics: {
    totalMissionsAttempted: number;
    totalMissionsCompleted: number;
    missionSuccessRate: number;
    totalSimulationRuns: number;
  };
}

export interface HydrologicalBalanceSnapshot {
  initialStorageM3: number;
  finalStorageM3: number;
  deltaStorageM3: number;
  rainfallMm: number;
  rechargeM3: number;
  extractionM3: number;
  lossesM3: number;
  netWaterBalanceM3: number;
  rechargeToExtractionRatio: number;
  estimatedStoragePercentage: number;
}

export interface AquiferCondition {
  category: string;
  label: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'MODERATE' | 'POSITIVE';
  color: string;
}

export interface SimulationAnalysis {
  runId: string;
  villageId?: string;
  createdAt: string;
  isSimulated: boolean;
  modelDisclaimer: string;
  hydrologicalBalance: HydrologicalBalanceSnapshot;
  aquiferCondition: AquiferCondition;
  sustainabilityScore: number;
  sustainabilityTier: string;
  observations: LearningObservation[];
  recommendations: LearningRecommendation[];
}

export interface SimulationComparisonData {
  isSimulated: boolean;
  modelDisclaimer: string;
  baseline: SimulationAnalysis;
  intervention: SimulationAnalysis;
  comparison: {
    deltaSustainabilityScore: number;
    deltaRechargeM3: number;
    deltaExtractionM3: number;
    deltaFinalStorageM3: number;
    extractionReductionPercentage: number;
    rechargeIncreasePercentage: number;
    conditionTransition: {
      from: string;
      to: string;
      improved: boolean;
    };
    overallVerdict: string;
    impactKeypoints: string[];
  };
}

export interface StudentLearningAnalytics {
  isSimulated: boolean;
  modelDisclaimer: string;
  student: StudentProfile;
  progression: StudentProgressionMetrics;
  missionSummary: MissionSummaryMetrics;
  categoryMastery: CategoryMasteryItem[];
  xpGrowthTimeline: XPGrowthPoint[];
  achievements: {
    unlockedCount: number;
    list: Array<{
      id: string;
      name: string;
      description: string;
      iconIdentifier: string;
      unlockedAt: string;
    }>;
  };
  recentSimulations: Array<{
    id: string;
    villageId: string;
    rainfall: number;
    recharge: number;
    extraction: number;
    initialStorage: number;
    finalStorage: number;
    sustainabilityScore: number;
    createdAt: string;
  }>;
  learningInsights: StudentLearningInsights;
}

export interface ClassroomOverviewMetrics {
  totalStudents: number;
  totalClassXP: number;
  averageXP: number;
  totalMissionsCompleted: number;
  completionRatePercentage: number;
}

export interface StudentSupportAlert {
  id: string;
  name: string;
  email: string;
  totalXP: number;
  currentLevel: number;
  completedMissionsCount: number;
  supportReason: string;
}

export interface FrequentlyFailedTask {
  taskId: string;
  title: string;
  category: string;
  failCount: number;
  failureRate: string;
}

export interface ClassroomAnalyticsData {
  isSimulated: boolean;
  modelDisclaimer: string;
  classroomOverview: ClassroomOverviewMetrics;
  levelDistribution: Array<{ level: string; count: number }>;
  categoryPerformance: Array<{ category: string; masteryRate: number; activeMissions: number }>;
  studentsRequiringSupport: StudentSupportAlert[];
  frequentlyFailedTasks: FrequentlyFailedTask[];
  students: Array<any>;
}

export interface AdminPlatformAnalyticsData {
  isSimulated: boolean;
  modelDisclaimer: string;
  overview: {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    totalVillages: number;
    totalMissions: number;
    totalSimulationRuns: number;
    totalCompletedMissions: number;
    totalAchievementsUnlocked: number;
  };
  userRoleDistribution: Array<{ role: string; count: number; percentage: number }>;
  monthlyActivityGrowth: Array<{ month: string; students: number; teachers: number; simulations: number }>;
  villageEngagement: Array<{ village: string; activeStudents: number; simulationRuns: number; avgSustainability: number }>;
}

export interface ReportExportParams {
  reportType: 'STUDENT_PROGRESS' | 'TEACHER_CLASSROOM' | 'MISSION_PERFORMANCE' | 'GROUNDWATER_SIMULATION' | 'ADMIN_PLATFORM';
  format: 'csv' | 'html' | 'json';
  studentId?: string;
  villageId?: string;
  period?: '7d' | '30d' | '90d' | '1y' | 'all';
}
