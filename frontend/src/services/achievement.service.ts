import api from './api';
import { Achievement } from '../types/gamification';

export const achievementService = {
  /**
   * Fetch the full catalog of achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    try {
      const res = await api.get('/achievements');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch achievements catalog:', err);
      return [];
    }
  },

  /**
   * Fetch user's unlocked achievements
   */
  async getMyAchievements(): Promise<any[]> {
    try {
      const res = await api.get('/achievements/my');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch my achievements:', err);
      return [];
    }
  }
};

export default achievementService;
