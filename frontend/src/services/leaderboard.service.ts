import api from './api';
import { LeaderboardEntry, LeaderboardType } from '../types/gamification';

export const leaderboardService = {
  /**
   * Fetch leaderboard rankings with privacy preservation
   */
  async getLeaderboard(type: LeaderboardType = 'TOTAL_XP', limit: number = 20): Promise<LeaderboardEntry[]> {
    try {
      const res = await api.get(`/leaderboard?type=${type}&limit=${limit}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      return [];
    }
  }
};

export default leaderboardService;
