export interface TeacherDashboardSummary {
  teacherId: string;
  totalStudents: number;
  activeStudents: number;
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  overdueAssignments: number;
  averageStudentXP: number;
  classCompletionRate: number;
  studentsRequiringAttention: Array<{
    id: string;
    name: string;
    email: string;
    totalXP: number;
    currentLevel: number;
    reason: string;
  }>;
  recentActivities: Array<{
    id: string;
    studentName: string;
    type: string;
    detail: string;
    timestamp: string;
  }>;
}

export interface ClassroomAnalyticsData {
  teacherId: string;
  totalStudents: number;
  xpDistribution: Array<{
    level: number;
    title: string;
    studentsCount: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    attempted: number;
    passed: number;
    completionRate: number;
  }>;
  difficultyBreakdown: Array<{
    difficulty: string;
    totalMissions: number;
    completionRate: number;
  }>;
  weeklyActivityTrends: Array<{
    day: string;
    simulations: number;
    tasksCompleted: number;
    xpAwarded: number;
  }>;
  achievementDistribution: Array<{
    code: string;
    name: string;
    unlockedStudentsCount: number;
  }>;
  incompleteAssignments: Array<{
    assignmentId: string;
    studentName: string;
    missionTitle: string;
    status: string;
    dueDate?: string;
  }>;
}

export interface StudentDetailedProfile {
  student: {
    id: string;
    name: string;
    email: string;
    role: string;
    totalXP: number;
    currentLevel: number;
    levelTitle: string;
    isActive?: boolean;
    lastActive?: string;
  };
  progression: any;
  xpHistory: Array<{
    id: string;
    amount: number;
    reason: string;
    sourceType: string;
    createdAt: string;
  }>;
  missions: Array<{
    id: string;
    title: string;
    status: string;
    score?: number;
    completedAt?: string;
  }>;
  achievements: Array<{
    code: string;
    name: string;
    description: string;
    xpReward: number;
    isUnlocked: boolean;
    unlockedAt?: string;
  }>;
  learningStrengths: string[];
  areasNeedingImprovement: string[];
}

export interface TeacherNotification {
  id: string;
  type: 'MISSION_COMPLETED' | 'ASSIGNMENT_OVERDUE' | 'ACHIEVEMENT_UNLOCKED' | 'STUDENT_INACTIVE';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}
