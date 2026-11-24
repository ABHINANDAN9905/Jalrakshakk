export interface UserProgression {
  userId: string;
  displayName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  totalXP: number;
  currentLevel: number;
  levelTitle: string;
  xpToNextLevel: number;
  xpCurrentLevelProgress: number;
  sustainabilityScore: number;
  completedMissionsCount: number;
  earnedAchievementsCount: number;
  badges: AchievementBadge[];
}

export interface AchievementBadge {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface MissionItem {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  tasksCount: number;
  completedTasksCount: number;
}
