import api from './api';
import {
  AdminDashboardStats,
  AdminUser,
  AdminTeacher,
  AdminVillage,
  AdminMission,
  AdminChallenge,
  AdminPlatformAnalytics,
  AdminAuditLog,
  AdminSystemHealth
} from '../types/admin';

export const adminService = {
  /**
   * 1. Dashboard Overview Stats
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const res = await api.get('/admin/dashboard');
    return res.data?.data;
  },

  /**
   * 2. User Management
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<{
    users: AdminUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'ALL') query.append('role', params.role);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);

    const res = await api.get(`/admin/users?${query.toString()}`);
    return res.data?.data;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<AdminUser> {
    const res = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return res.data?.data;
  },

  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    const res = await api.patch(`/admin/users/${userId}/role`, { role });
    return res.data?.data;
  },

  /**
   * 3. Teacher Management
   */
  async getTeachers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<{
    teachers: AdminTeacher[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);

    const res = await api.get(`/admin/teachers?${query.toString()}`);
    return res.data?.data;
  },

  /**
   * 4. Village Management
   */
  async getVillages(params: {
    page?: number;
    limit?: number;
    search?: string;
    region?: string;
    state?: string;
  } = {}): Promise<{
    villages: AdminVillage[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.region) query.append('region', params.region);
    if (params.state) query.append('state', params.state);

    const res = await api.get(`/admin/villages?${query.toString()}`);
    return res.data?.data;
  },

  async createVillage(data: Partial<AdminVillage>): Promise<AdminVillage> {
    const res = await api.post('/admin/villages', data);
    return res.data?.data;
  },

  async updateVillage(villageId: string, data: Partial<AdminVillage>): Promise<AdminVillage> {
    const res = await api.patch(`/admin/villages/${villageId}`, data);
    return res.data?.data;
  },

  /**
   * 5. Mission Management
   */
  async getMissions(params: {
    page?: number;
    limit?: number;
    category?: string;
    difficulty?: string;
    status?: string;
  } = {}): Promise<{
    missions: AdminMission[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.difficulty && params.difficulty !== 'ALL') query.append('difficulty', params.difficulty);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);

    const res = await api.get(`/admin/missions?${query.toString()}`);
    return res.data?.data;
  },

  async createMission(data: any): Promise<AdminMission> {
    const res = await api.post('/admin/missions', data);
    return res.data?.data;
  },

  async updateMission(missionId: string, data: any): Promise<AdminMission> {
    const res = await api.patch(`/admin/missions/${missionId}`, data);
    return res.data?.data;
  },

  async toggleMissionStatus(missionId: string, isActive: boolean): Promise<AdminMission> {
    const res = await api.patch(`/admin/missions/${missionId}/status`, { isActive });
    return res.data?.data;
  },

  /**
   * 6. Challenge Management
   */
  async getChallenges(): Promise<AdminChallenge[]> {
    const res = await api.get('/admin/challenges');
    return res.data?.data;
  },

  async createChallenge(data: any): Promise<AdminChallenge> {
    const res = await api.post('/admin/challenges', data);
    return res.data?.data;
  },

  async updateChallenge(challengeId: string, data: any): Promise<AdminChallenge> {
    const res = await api.patch(`/admin/challenges/${challengeId}`, data);
    return res.data?.data;
  },

  /**
   * 7. Platform Analytics
   */
  async getPlatformAnalytics(): Promise<AdminPlatformAnalytics> {
    const res = await api.get('/admin/analytics');
    return res.data?.data;
  },

  /**
   * 8. Activity Audit Logs
   */
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    actorId?: string;
    action?: string;
    resource?: string;
  } = {}): Promise<{
    success: boolean;
    isUnavailable?: boolean;
    message?: string;
    logs: AdminAuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.actorId) query.append('actorId', params.actorId);
    if (params.action && params.action !== 'ALL') query.append('action', params.action);
    if (params.resource && params.resource !== 'ALL') query.append('resource', params.resource);

    const res = await api.get(`/admin/audit-logs?${query.toString()}`);
    return res.data?.data;
  },

  /**
   * 9. System Health Diagnostics
   */
  async getSystemHealth(): Promise<AdminSystemHealth> {
    const res = await api.get('/admin/system-health');
    return res.data?.data;
  }
};

export default adminService;
