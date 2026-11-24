import api from './api';
import { UserProgression } from '../types/progression';
import { UserProgressionData, XPTransaction } from '../types/gamification';

export const DEFAULT_USER_PROGRESSION: UserProgression = {
  userId: 'usr-student-001',
  displayName: 'Aarav Sharma',
  role: 'STUDENT',
  totalXP: 450,
  currentLevel: 2,
  levelTitle: 'Water Guardian',
  xpToNextLevel: 1200,
  xpCurrentLevelProgress: 150,
  sustainabilityScore: 84,
  completedMissionsCount: 3,
  earnedAchievementsCount: 4,
  badges: [
    {
      id: 'ach-1',
      code: 'FIRST_MISSION',
      title: 'Water Pioneer',
      description: 'Complete your first groundwater conservation mission.',
      icon: '🏆',
      category: 'CONSERVATION',
      xpReward: 100,
      isUnlocked: true,
      unlockedAt: '2026-11-20',
    },
    {
      id: 'ach-2',
      code: 'WATER_SAVER',
      title: 'Efficiency Champion',
      description: 'Save 20,000 m³ or more through water conservation practices.',
      icon: '💧',
      category: 'EFFICIENCY',
      xpReward: 150,
      isUnlocked: true,
      unlockedAt: '2026-11-21',
    },
    {
      id: 'ach-3',
      code: 'RAIN_HARVESTER',
      title: 'Monsoon Collector',
      description: 'Deploy rainwater harvesting or check dam structures to capture runoff.',
      icon: '🌧️',
      category: 'WATERSHED',
      xpReward: 150,
      isUnlocked: true,
      unlockedAt: '2026-11-21',
    },
    {
      id: 'ach-4',
      code: 'DRIP_CHAMPION',
      title: 'Precision Irrigator',
      description: 'Complete an agricultural challenge using drip micro-irrigation.',
      icon: '🌱',
      category: 'AGRICULTURE',
      xpReward: 200,
      isUnlocked: false,
    },
  ],
};

export const progressionService = {
  /**
   * Fetch authenticated user's authoritative progression from backend
   */
  async getMyProgression(): Promise<UserProgressionData> {
    try {
      const response = await api.get('/progression/me');
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return {
        userId: 'student-offline',
        currentLevel: 1,
        levelTitle: 'Water Explorer',
        currentXP: 0,
        minXPForCurrentLevel: 0,
        nextLevel: 2,
        nextLevelTitle: 'Water Guardian',
        minXPForNextLevel: 500,
        xpToNextLevel: 500,
        progressPercentage: 0,
        perks: 'Access to beginner village simulations.',
        achievementsCount: 0,
        completedMissionsCount: 0
      };
    } catch {
      return {
        userId: 'student-offline',
        currentLevel: 1,
        levelTitle: 'Water Explorer',
        currentXP: 0,
        minXPForCurrentLevel: 0,
        nextLevel: 2,
        nextLevelTitle: 'Water Guardian',
        minXPForNextLevel: 500,
        xpToNextLevel: 500,
        progressPercentage: 0,
        perks: 'Access to beginner village simulations.',
        achievementsCount: 0,
        completedMissionsCount: 0
      };
    }
  },

  /**
   * Fetch XP earning transaction history
   */
  async getXPHistory(): Promise<XPTransaction[]> {
    try {
      const response = await api.get('/xp/history');
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch {
      return [];
    }
  }
};

export default progressionService;
