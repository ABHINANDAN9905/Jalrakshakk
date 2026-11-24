import api from './api';
import { Challenge } from '../types/gamification';

export interface JoinChallengeResponse {
  success: boolean;
  message: string;
  participation?: any;
}

export const challengeService = {
  /**
   * Fetch all active daily and weekly challenges
   */
  async getChallenges(): Promise<Challenge[]> {
    try {
      const res = await api.get('/challenges');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
      return [];
    }
  },

  /**
   * Fetch challenges the student has enrolled in
   */
  async getMyChallenges(): Promise<any[]> {
    try {
      const res = await api.get('/challenges/my');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch user challenges:', err);
      return [];
    }
  },

  /**
   * Join an active challenge (prevents duplicate submission)
   */
  async joinChallenge(challengeId: string): Promise<JoinChallengeResponse> {
    try {
      const res = await api.post(`/challenges/${challengeId}/join`);
      return {
        success: true,
        message: res.data?.message || 'Successfully joined challenge',
        participation: res.data?.data
      };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to join challenge.';
      return {
        success: false,
        message
      };
    }
  }
};

export default challengeService;
