export interface AdminDashboardStats {
  overview: {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    totalVillages: number;
    totalActiveUsers: number;
    totalMissions: number;
    totalCompletedMissions: number;
    totalSimulationRuns: number;
    totalAchievementsUnlocked: number;
  };
  registrationTrends: Array<{
    period: string;
    count: number;
  }>;
  missionTrends: Array<{
    category: string;
    completed: number;
    inProgress: number;
  }>;
  systemStatus: {
    backendApi: string;
    database: string;
    mongodb: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    memberships?: number;
    missionProgress?: number;
    simulationRuns?: number;
    studentsAssigned?: number;
  };
}

export interface AdminTeacher {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedStudentsCount: number;
  assignedStudents: Array<{
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  }>;
  classroomAssignmentsCount: number;
  isUnassigned: boolean;
}

export interface AdminVillage {
  id: string;
  name: string;
  description: string;
  region: string;
  district?: string | null;
  state?: string | null;
  country: string;
  population?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  memberCount: number;
  simulationRunsCount: number;
  groundwaterSnapshotsCount?: number;
  createdAt: string;
}

export interface AdminMission {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  points: number;
  xpReward: number;
  requiredLevel: number;
  estimatedDurationMinutes: number;
  learningObjectives?: string[];
  instructions?: string;
  isActive: boolean;
  enrolledCount?: number;
  tasks?: Array<{
    id?: string;
    title: string;
    description: string;
    taskType: string;
    xpReward: number;
    orderIndex: number;
  }>;
}

export interface AdminChallenge {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'LIMITED_TIME';
  startDate: string;
  endDate: string;
  targetCriteria?: any;
  xpReward: number;
  isActive: boolean;
  participationCount?: number;
}

export interface AdminPlatformAnalytics {
  userRoleDistribution: Array<{
    role: string;
    count: number;
  }>;
  villageEngagement: Array<{
    name: string;
    members: number;
    simulations: number;
  }>;
  xpDistribution: Array<{
    tier: string;
    count: number;
  }>;
  monthlyActivityGrowth: Array<{
    month: string;
    users: number;
    simulations: number;
  }>;
}

export interface AdminAuditLog {
  id?: string;
  _id?: string;
  actorId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: any;
  timestamp: string;
}

export interface AdminSystemHealth {
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  services: {
    backendApi: {
      name: string;
      status: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED';
      nodeVersion: string;
      memoryUsageMB: number;
    };
    postgresql: {
      name: string;
      status: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED';
      latencyMs?: number | null;
    };
    mongodb: {
      name: string;
      status: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED';
      state?: string;
    };
    socketIo: {
      name: string;
      status: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED';
      activeNamespaces: string[];
    };
    aiWaterMentor: {
      name: string;
      status: 'CONFIGURED' | 'NOT_CONFIGURED';
    };
  };
}
