export type MissionCategory =
  | 'GROUNDWATER_CONSERVATION'
  | 'RAINWATER_HARVESTING'
  | 'SUSTAINABLE_AGRICULTURE'
  | 'IRRIGATION_EFFICIENCY'
  | 'WATER_QUALITY'
  | 'POLLUTION_PREVENTION'
  | 'COMMUNITY_AWARENESS'
  | 'DROUGHT_MANAGEMENT';

export type MissionDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type TaskType =
  | 'COMPLETE_SIMULATION'
  | 'ACHIEVE_STORAGE_THRESHOLD'
  | 'IMPROVE_SUSTAINABILITY_SCORE'
  | 'USE_DRIP_IRRIGATION'
  | 'BUILD_CONSERVATION_STRUCTURE'
  | 'COMPLETE_WATER_QUALITY_CHALLENGE'
  | 'REDUCE_GROUNDWATER_EXTRACTION'
  | 'COMPLETE_QUIZ';

export interface MissionTask {
  id: string;
  missionId?: string;
  title: string;
  description: string;
  taskType: TaskType;
  orderIndex: number;
  xpReward: number;
  targetCriteria: Record<string, any>;
  isCompleted?: boolean;
  completedAt?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory | string;
  difficulty: MissionDifficulty;
  xpReward: number;
  estimatedDurationMinutes: number;
  requiredLevel: number;
  learningObjectives: string[];
  instructions?: string;
  completionCriteria?: Record<string, any>;
  isActive?: boolean;
  tasks: MissionTask[];
  userProgress?: {
    status: 'NOT_STARTED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'LOCKED';
    progress: number;
    completedTasksCount?: number;
    totalTasksCount?: number;
    isCompleted?: boolean;
    startedAt?: string;
    completedAt?: string;
  };
}

export type ChallengeType = 'DAILY' | 'WEEKLY' | 'SPECIAL';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challengeType: ChallengeType;
  criteria?: Record<string, any>;
  targetCriteria?: Record<string, any>;
  xpReward: number;
  startDate: string;
  endDate: string;
  durationDays?: number;
  isActive: boolean;
  isJoined?: boolean;
  isCompleted?: boolean;
  participationId?: string;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  iconIdentifier: string;
  xpReward: number;
  unlockCondition?: Record<string, any>;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export type LeaderboardType = 'TOTAL_XP' | 'MISSIONS_COMPLETED' | 'ACHIEVEMENTS_COUNT' | 'WEEKLY_XP';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  score: number;
  metricLabel: string;
  currentLevel: number;
  levelTitle: string;
  achievementCount?: number;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  sourceType: string;
  sourceId?: string;
  createdAt: string;
}

export interface UserProgressionData {
  userId: string;
  displayName?: string;
  currentLevel: number;
  levelTitle: string;
  currentXP: number;
  minXPForCurrentLevel: number;
  nextLevel: number | null;
  nextLevelTitle: string | null;
  minXPForNextLevel: number | null;
  xpToNextLevel: number;
  progressPercentage: number;
  perks: string;
  achievementsCount: number;
  completedMissionsCount: number;
}

export interface TeacherStudentItem {
  id: string;
  name: string;
  email: string;
  role: string;
  currentLevel?: number;
  levelTitle?: string;
  totalXP?: number;
  completedMissionsCount?: number;
  achievementsCount?: number;
  isActive?: boolean;
  userXP?: {
    totalXP: number;
    currentLevel: number;
    levelTitle: string;
  };
}

export interface TeacherMissionAssignment {
  id: string;
  teacherId: string;
  studentId: string;
  missionId: string;
  status?: string;
  assignedAt: string;
  dueDate?: string | null;
  notes?: string | null;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  mission?: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    xpReward: number;
  };
}

export interface StudentProgressReport {
  studentId: string;
  progression: UserProgressionData;
  missions: Array<{
    id: string;
    missionId: string;
    status: string;
    progress: number;
    completedAt?: string;
    mission?: {
      id: string;
      title: string;
      category: string;
      difficulty: string;
      xpReward: number;
    };
  }>;
}
