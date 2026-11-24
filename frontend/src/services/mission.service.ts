import api from './api';
import { Mission, MissionTask } from '../types/gamification';

export interface TaskCompletionResponse {
  success: boolean;
  taskPassed: boolean;
  message: string;
  taskId: string;
  xpAwarded?: number;
  missionCompleted?: boolean;
  progressPercent?: number;
  unlockedAchievements?: any[];
}

export const missionService = {
  /**
   * Fetch all active missions with optional category, difficulty, or level filters
   */
  async getMissions(filters?: { category?: string; difficulty?: string; level?: number }): Promise<Mission[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.level) params.append('level', filters.level.toString());

      const res = await api.get(`/missions?${params.toString()}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch missions:', err);
      return [];
    }
  },

  /**
   * Fetch student's mission progress records
   */
  async getMyMissionProgress(): Promise<any[]> {
    try {
      const res = await api.get('/missions/my/progress');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch mission progress:', err);
      return [];
    }
  },

  /**
   * Fetch a specific mission by ID along with student task-level completion status
   */
  async getMissionById(missionId: string): Promise<Mission | null> {
    try {
      const res = await api.get(`/missions/${missionId}`);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.error(`Failed to fetch mission ${missionId}:`, err);
      return null;
    }
  },

  /**
   * Start a mission for the authenticated student
   */
  async startMission(missionId: string): Promise<{ success: boolean; message: string; mission?: Mission }> {
    try {
      const res = await api.post(`/missions/${missionId}/start`);
      return {
        success: res.data?.success ?? true,
        message: res.data?.message || 'Mission started successfully',
        mission: res.data?.data?.mission
      };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to start mission. Check required level.';
      return { success: false, message: msg };
    }
  },

  /**
   * Submit simulation outputs or quiz answers for authoritative backend evaluation.
   * NEVER sends client-invented success booleans.
   */
  async completeTask(missionId: string, taskId: string, submission: any): Promise<TaskCompletionResponse> {
    try {
      const res = await api.post(`/missions/${missionId}/tasks/${taskId}/complete`, submission);
      return {
        success: true,
        taskPassed: true,
        message: res.data?.message || 'Task completed successfully',
        taskId,
        xpAwarded: res.data?.data?.xpAwarded,
        missionCompleted: res.data?.data?.missionCompleted,
        progressPercent: res.data?.data?.progressPercent,
        unlockedAchievements: res.data?.data?.unlockedAchievements
      };
    } catch (err: any) {
      const errorData = err.response?.data;
      return {
        success: false,
        taskPassed: false,
        message: errorData?.message || 'Task criteria not satisfied by submitted simulation data.',
        taskId
      };
    }
  }
};

export default missionService;
