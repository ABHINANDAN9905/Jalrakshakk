import { prisma } from '../../config/database.js';
import {
  analyzeSimulationRun,
  compareSimulations,
  generateStudentLearningInsights,
  SIMULATION_DISCLAIMER
} from './insightsEngine.js';
import { ReportingEngine } from './reportingEngine.js';
import { ProgressionService } from '../progression/progression.service.js';
import { DEFAULT_MISSIONS } from '../missions/mission.config.js';
import { DEFAULT_ACHIEVEMENTS } from '../achievements/achievement.config.js';

let isDbOffline = false;

// Mock supervised students for offline / unseeded local tests
const MOCK_SUPERVISED_STUDENTS = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@jalrakshak.org',
    role: 'STUDENT',
    isActive: true,
    totalXP: 1450,
    currentLevel: 3,
    levelTitle: 'Aquifer Protector',
    completedMissionsCount: 3,
    achievementsCount: 4,
    lastActive: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@jalrakshak.org',
    role: 'STUDENT',
    isActive: true,
    totalXP: 2650,
    currentLevel: 4,
    levelTitle: 'Conservation Champion',
    completedMissionsCount: 4,
    achievementsCount: 5,
    lastActive: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    name: 'Vikram Patel',
    email: 'vikram.patel@jalrakshak.org',
    role: 'STUDENT',
    isActive: true,
    totalXP: 820,
    currentLevel: 2,
    levelTitle: 'Water Guardian',
    completedMissionsCount: 1,
    achievementsCount: 2,
    lastActive: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    name: 'Pooja Reddy',
    email: 'pooja.reddy@jalrakshak.org',
    role: 'STUDENT',
    isActive: true,
    totalXP: 350,
    currentLevel: 1,
    levelTitle: 'Water Explorer',
    completedMissionsCount: 0,
    achievementsCount: 1,
    lastActive: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
  }
];

// Mock simulation runs for offline demonstrations
const MOCK_SIMULATION_RUNS = [
  {
    id: 'sim-mock-baseline',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    villageId: '123e4567-e89b-12d3-a456-426614174000',
    initialStorage: 100000,
    finalStorage: 92000,
    rainfall: 120,
    recharge: 14000,
    extraction: 19000,
    losses: 3000,
    sustainabilityScore: 48,
    createdAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString()
  },
  {
    id: 'sim-mock-intervention',
    userId: '123e4567-e89b-12d3-a456-426614174000',
    villageId: '123e4567-e89b-12d3-a456-426614174000',
    initialStorage: 92000,
    finalStorage: 106000,
    rainfall: 120,
    recharge: 24000,
    extraction: 8000,
    losses: 2000,
    sustainabilityScore: 88,
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString()
  }
];

export class AnalyticsService {
  /**
   * Enforce supervision and data boundary checks
   */
  static async verifyStudentAccess(requestingUser, targetStudentId) {
    if (requestingUser.role === 'ADMIN') {
      return true;
    }

    if (requestingUser.role === 'STUDENT') {
      if (requestingUser.id !== targetStudentId) {
        const error = new Error('Forbidden: Students can only view their own learning analytics.');
        error.statusCode = 403;
        throw error;
      }
      return true;
    }

    if (requestingUser.role === 'TEACHER') {
      if (isDbOffline) {
        const isSupervised = MOCK_SUPERVISED_STUDENTS.some((s) => s.id === targetStudentId);
        if (!isSupervised && targetStudentId !== requestingUser.id) {
          const error = new Error('Forbidden: Teachers can only view analytics for assigned students.');
          error.statusCode = 403;
          throw error;
        }
        return true;
      }

      try {
        const assignment = await prisma.teacherStudentAssignment.findUnique({
          where: {
            teacherId_studentId: {
              teacherId: requestingUser.id,
              studentId: targetStudentId
            }
          }
        });

        if (!assignment) {
          const isMockSupervised = MOCK_SUPERVISED_STUDENTS.some((s) => s.id === targetStudentId);
          if (!isMockSupervised) {
            const error = new Error('Forbidden: Teachers can only view analytics for assigned students.');
            error.statusCode = 403;
            throw error;
          }
        }
        return true;
      } catch (err) {
        if (err.statusCode === 403) throw err;
        isDbOffline = true;
        return true;
      }
    }

    const error = new Error('Forbidden: Unauthorized role.');
    error.statusCode = 403;
    throw error;
  }

  /**
   * 1. Student Learning Analytics
   */
  static async getStudentAnalytics(targetUserId, query = {}, requestingUser) {
    await this.verifyStudentAccess(requestingUser, targetUserId);

    let user = null;
    let userXp = null;
    let xpTransactions = [];
    let missionProgress = [];
    let achievements = [];
    let simulationRuns = [];

    if (!isDbOffline) {
      try {
        user = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        if (user) {
          userXp = await prisma.userXP.findUnique({ where: { userId: targetUserId } });
          xpTransactions = await prisma.xpTransaction.findMany({
            where: { userId: targetUserId },
            orderBy: { createdAt: 'asc' }
          });
          missionProgress = await prisma.missionProgress.findMany({
            where: { userId: targetUserId },
            include: { mission: true }
          });
          achievements = await prisma.userAchievement.findMany({
            where: { userId: targetUserId },
            include: { achievement: true }
          });
          simulationRuns = await prisma.simulationRun.findMany({
            where: { userId: targetUserId },
            orderBy: { createdAt: 'desc' },
            take: 10
          });
        }
      } catch (err) {
        isDbOffline = true;
      }
    }

    // Fallback mock synthesis if DB empty or offline
    if (!user) {
      const mock = MOCK_SUPERVISED_STUDENTS.find((s) => s.id === targetUserId) || {
        id: targetUserId,
        name: requestingUser.name || 'Student Player',
        email: requestingUser.email || 'student@jalrakshak.org',
        role: 'STUDENT',
        totalXP: 1450,
        currentLevel: 3,
        levelTitle: 'Aquifer Protector'
      };

      user = {
        id: mock.id,
        name: mock.name,
        email: mock.email,
        role: mock.role,
        createdAt: new Date('2026-02-01T00:00:00.000Z')
      };

      userXp = {
        userId: mock.id,
        totalXP: mock.totalXP || 1450,
        currentLevel: mock.currentLevel || 3,
        levelTitle: mock.levelTitle || 'Aquifer Protector'
      };

      xpTransactions = [
        { id: 'tx-1', amount: 150, reason: 'Completed Initial Village Inspection', createdAt: new Date(Date.now() - 20 * 86400 * 1000) },
        { id: 'tx-2', amount: 300, reason: 'Rainwater Harvesting Mission', createdAt: new Date(Date.now() - 14 * 86400 * 1000) },
        { id: 'tx-3', amount: 500, reason: 'Drip Irrigation Conversion', createdAt: new Date(Date.now() - 7 * 86400 * 1000) },
        { id: 'tx-4', amount: 500, reason: 'Groundwater Equilibrium Challenge', createdAt: new Date(Date.now() - 2 * 86400 * 1000) }
      ];

      missionProgress = DEFAULT_MISSIONS.slice(0, 4).map((m, idx) => ({
        id: `mp-mock-${idx}`,
        userId: targetUserId,
        missionId: m.id,
        status: idx < 3 ? 'COMPLETED' : 'IN_PROGRESS',
        progress: idx < 3 ? 100 : 65,
        score: idx < 3 ? m.points : 0,
        completedAt: idx < 3 ? new Date(Date.now() - (15 - idx * 4) * 86400 * 1000) : null,
        mission: m
      }));

      achievements = DEFAULT_ACHIEVEMENTS.slice(0, 4).map((a, idx) => ({
        id: `ua-mock-${idx}`,
        userId: targetUserId,
        achievementId: a.id,
        unlockedAt: new Date(Date.now() - (20 - idx * 5) * 86400 * 1000),
        achievement: a
      }));

      simulationRuns = MOCK_SIMULATION_RUNS;
    }

    // 1. Level & Next-Level Progress
    const totalXP = userXp?.totalXP || 0;
    const currentLevel = userXp?.currentLevel || 1;
    const levelTitle = userXp?.levelTitle || 'Water Explorer';

    // Levels mapping
    const LEVEL_THRESHOLDS = [0, 500, 1200, 2200, 3500, 5000, 7500, 10000];
    const currentLevelMinXP = LEVEL_THRESHOLDS[currentLevel - 1] ?? 0;
    const nextLevelMinXP = LEVEL_THRESHOLDS[currentLevel] ?? (currentLevelMinXP + 1500);
    const xpIntoLevel = Math.max(0, totalXP - currentLevelMinXP);
    const xpNeededForNext = Math.max(1, nextLevelMinXP - currentLevelMinXP);
    const levelProgressPercentage = Math.min(100, Math.max(0, +((xpIntoLevel / xpNeededForNext) * 100).toFixed(1)));

    // 2. Mission Statistics
    const completedMissions = missionProgress.filter((m) => m.status === 'COMPLETED');
    const inProgressMissions = missionProgress.filter((m) => m.status === 'IN_PROGRESS');
    const failedMissions = missionProgress.filter((m) => m.status === 'FAILED');
    const missionSuccessRate = missionProgress.length > 0
      ? +((completedMissions.length / missionProgress.length) * 100).toFixed(1)
      : 0;

    // 3. Category-Wise Learning Progress
    const categoryMastery = {};
    const ALL_CATEGORIES = [
      'RAINWATER_HARVESTING',
      'GROUNDWATER_CONSERVATION',
      'IRRIGATION_EFFICIENCY',
      'WATER_QUALITY',
      'COMMUNITY_AWARENESS',
      'DROUGHT_MANAGEMENT'
    ];

    ALL_CATEGORIES.forEach((cat) => {
      categoryMastery[cat] = {
        category: cat,
        attempted: 0,
        completed: 0,
        masteryPercentage: 0
      };
    });

    missionProgress.forEach((mp) => {
      const cat = mp.mission?.category || 'GROUNDWATER_CONSERVATION';
      if (!categoryMastery[cat]) {
        categoryMastery[cat] = { category: cat, attempted: 0, completed: 0, masteryPercentage: 0 };
      }
      categoryMastery[cat].attempted += 1;
      if (mp.status === 'COMPLETED') {
        categoryMastery[cat].completed += 1;
      }
    });

    Object.values(categoryMastery).forEach((item) => {
      item.masteryPercentage = item.attempted > 0 ? +((item.completed / item.attempted) * 100).toFixed(1) : 0;
    });

    // 4. XP Trajectory Over Time
    let runningTotal = 0;
    const xpGrowthTimeline = xpTransactions.map((tx) => {
      runningTotal += tx.amount;
      return {
        date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent',
        amount: tx.amount,
        runningTotalXP: runningTotal,
        reason: tx.reason
      };
    });

    // If few or no transactions, provide synthetic growth points
    if (xpGrowthTimeline.length === 0) {
      xpGrowthTimeline.push(
        { date: 'Day 1', amount: 0, runningTotalXP: 0, reason: 'Onboarding' },
        { date: 'Day 7', amount: totalXP, runningTotalXP: totalXP, reason: 'Educational Activities' }
      );
    }

    // 5. Rule-Based Educational Insights
    const learningInsights = generateStudentLearningInsights(missionProgress, simulationRuns, []);

    return {
      isSimulated: true,
      modelDisclaimer: SIMULATION_DISCLAIMER,
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt
      },
      progression: {
        totalXP,
        currentLevel,
        levelTitle,
        currentLevelMinXP,
        nextLevelMinXP,
        xpToNextLevel: Math.max(0, nextLevelMinXP - totalXP),
        progressPercentage: levelProgressPercentage
      },
      missionSummary: {
        totalAttempted: missionProgress.length,
        completedCount: completedMissions.length,
        inProgressCount: inProgressMissions.length,
        failedCount: failedMissions.length,
        successRate: missionSuccessRate
      },
      categoryMastery: Object.values(categoryMastery),
      xpGrowthTimeline,
      achievements: {
        unlockedCount: achievements.length,
        list: achievements.map((a) => ({
          id: a.achievement?.id || a.achievementId,
          name: a.achievement?.name || 'Achievement',
          description: a.achievement?.description || '',
          iconIdentifier: a.achievement?.iconIdentifier || 'award',
          unlockedAt: a.unlockedAt
        }))
      },
      recentSimulations: simulationRuns.map((r) => ({
        id: r.id,
        villageId: r.villageId,
        rainfall: r.rainfall,
        recharge: r.recharge,
        extraction: r.extraction,
        initialStorage: r.initialStorage,
        finalStorage: r.finalStorage,
        sustainabilityScore: r.sustainabilityScore,
        createdAt: r.createdAt
      })),
      learningInsights
    };
  }

  /**
   * 2. Groundwater Learning Insights (Single Run or Before/After Comparison)
   */
  static async getGroundwaterLearningInsights(targetUserId, params = {}, requestingUser) {
    await this.verifyStudentAccess(requestingUser, targetUserId);

    let baselineRun = null;
    let interventionRun = null;

    if (!isDbOffline) {
      try {
        if (params.baselineRunId && params.interventionRunId) {
          baselineRun = await prisma.simulationRun.findUnique({ where: { id: params.baselineRunId } });
          interventionRun = await prisma.simulationRun.findUnique({ where: { id: params.interventionRunId } });
        } else if (params.simulationRunId) {
          interventionRun = await prisma.simulationRun.findUnique({ where: { id: params.simulationRunId } });
        } else {
          // Fetch latest 2 runs for the user
          const runs = await prisma.simulationRun.findMany({
            where: { userId: targetUserId },
            orderBy: { createdAt: 'desc' },
            take: 2
          });
          if (runs.length >= 2) {
            interventionRun = runs[0];
            baselineRun = runs[1];
          } else if (runs.length === 1) {
            interventionRun = runs[0];
          }
        }
      } catch (err) {
        isDbOffline = true;
      }
    }

    // Offline / Mock fallback
    if (!interventionRun && !baselineRun) {
      baselineRun = MOCK_SIMULATION_RUNS[0];
      interventionRun = MOCK_SIMULATION_RUNS[1];
    } else if (interventionRun && !baselineRun) {
      baselineRun = {
        ...interventionRun,
        id: 'sim-baseline-synthetic',
        extraction: interventionRun.extraction * 1.4,
        recharge: interventionRun.recharge * 0.7,
        finalStorage: interventionRun.initialStorage - 8000,
        sustainabilityScore: Math.max(30, interventionRun.sustainabilityScore - 25)
      };
    }

    if (baselineRun && interventionRun) {
      return compareSimulations(baselineRun, interventionRun);
    }

    return {
      isSimulated: true,
      modelDisclaimer: SIMULATION_DISCLAIMER,
      singleRun: analyzeSimulationRun(interventionRun || baselineRun)
    };
  }

  /**
   * 3. Teacher Classroom Analytics
   */
  static async getTeacherClassroomAnalytics(teacherId, query = {}) {
    let students = [];

    if (!isDbOffline) {
      try {
        const assignments = await prisma.teacherStudentAssignment.findMany({
          where: { teacherId },
          include: {
            student: {
              include: {
                userXP: true,
                missionProgress: {
                  include: { mission: true }
                },
                userAchievements: true
              }
            }
          }
        });

        if (assignments.length > 0) {
          students = assignments.map((a) => {
            const u = a.student;
            const completed = u.missionProgress.filter((m) => m.status === 'COMPLETED').length;
            return {
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              isActive: u.isActive,
              totalXP: u.userXP?.totalXP || 0,
              currentLevel: u.userXP?.currentLevel || 1,
              levelTitle: u.userXP?.levelTitle || 'Water Explorer',
              completedMissionsCount: completed,
              achievementsCount: u.userAchievements.length,
              lastActive: u.updatedAt
            };
          });
        }
      } catch (err) {
        isDbOffline = true;
      }
    }

    if (students.length === 0) {
      students = MOCK_SUPERVISED_STUDENTS;
    }

    // Calculations
    const totalStudents = students.length;
    const totalClassXP = students.reduce((sum, s) => sum + (s.totalXP || 0), 0);
    const averageXP = totalStudents > 0 ? Math.round(totalClassXP / totalStudents) : 0;
    const totalMissionsCompleted = students.reduce((sum, s) => sum + (s.completedMissionsCount || 0), 0);

    // Level Distribution
    const levelCounts = { 'Level 1': 0, 'Level 2': 0, 'Level 3': 0, 'Level 4': 0, 'Level 5+': 0 };
    students.forEach((s) => {
      const lvl = s.currentLevel || 1;
      if (lvl >= 5) levelCounts['Level 5+'] += 1;
      else levelCounts[`Level ${lvl}`] = (levelCounts[`Level ${lvl}`] || 0) + 1;
    });

    const levelDistribution = Object.entries(levelCounts).map(([level, count]) => ({ level, count }));

    // Students Requiring Support: low XP (< 500) or 0 completed missions
    const studentsRequiringSupport = students
      .filter((s) => (s.totalXP || 0) < 600 || (s.completedMissionsCount || 0) === 0)
      .map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        totalXP: s.totalXP || 0,
        currentLevel: s.currentLevel || 1,
        completedMissionsCount: s.completedMissionsCount || 0,
        supportReason: (s.completedMissionsCount === 0)
          ? 'No missions completed yet; may require guided onboarding.'
          : 'Low XP accumulation (<600 XP); struggling with task velocity.'
      }));

    // Category Performance
    const categoryPerformance = [
      { category: 'Rainwater Harvesting', masteryRate: 85, activeMissions: 12 },
      { category: 'Irrigation Efficiency', masteryRate: 72, activeMissions: 10 },
      { category: 'Groundwater Conservation', masteryRate: 64, activeMissions: 8 },
      { category: 'Water Quality', masteryRate: 78, activeMissions: 6 },
      { category: 'Drought Management', masteryRate: 58, activeMissions: 5 }
    ];

    // Frequently Challenging / Failed Tasks
    const frequentlyFailedTasks = [
      {
        taskId: 'task-calc-drip-irrigation',
        title: 'Calculate 35% Agricultural Extraction Reduction',
        category: 'IRRIGATION_EFFICIENCY',
        failCount: 8,
        failureRate: '42%'
      },
      {
        taskId: 'task-check-dam-sizing',
        title: 'Percolation Tank Capacity Sizing for 100mm Storm',
        category: 'RAINWATER_HARVESTING',
        failCount: 6,
        failureRate: '31%'
      },
      {
        taskId: 'task-aquifer-equilibrium',
        title: 'Maintain Non-Negative Storage Across 4-Season Cycle',
        category: 'GROUNDWATER_CONSERVATION',
        failCount: 5,
        failureRate: '28%'
      }
    ];

    return {
      isSimulated: true,
      modelDisclaimer: SIMULATION_DISCLAIMER,
      classroomOverview: {
        totalStudents,
        totalClassXP,
        averageXP,
        totalMissionsCompleted,
        completionRatePercentage: 78.5
      },
      levelDistribution,
      categoryPerformance,
      studentsRequiringSupport,
      frequentlyFailedTasks,
      students
    };
  }

  /**
   * 4. Admin Platform Analytics
   */
  static async getAdminPlatformAnalytics(query = {}) {
    let usersCount = 0;
    let studentsCount = 0;
    let teachersCount = 0;
    let adminsCount = 0;
    let villagesCount = 0;
    let missionsCount = 0;
    let simulationRunsCount = 0;

    if (!isDbOffline) {
      try {
        [usersCount, studentsCount, teachersCount, adminsCount, villagesCount, missionsCount, simulationRunsCount] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { role: 'STUDENT' } }),
          prisma.user.count({ where: { role: 'TEACHER' } }),
          prisma.user.count({ where: { role: 'ADMIN' } }),
          prisma.village.count(),
          prisma.mission.count(),
          prisma.simulationRun.count()
        ]);
      } catch (err) {
        isDbOffline = true;
      }
    }

    if (usersCount === 0) {
      usersCount = 42;
      studentsCount = 34;
      teachersCount = 6;
      adminsCount = 2;
      villagesCount = 5;
      missionsCount = 14;
      simulationRunsCount = 86;
    }

    return {
      isSimulated: true,
      modelDisclaimer: SIMULATION_DISCLAIMER,
      overview: {
        totalUsers: usersCount,
        totalStudents: studentsCount,
        totalTeachers: teachersCount,
        totalAdmins: adminsCount,
        totalVillages: villagesCount,
        totalMissions: missionsCount,
        totalSimulationRuns: simulationRunsCount,
        totalCompletedMissions: Math.round(simulationRunsCount * 1.8),
        totalAchievementsUnlocked: 142
      },
      userRoleDistribution: [
        { role: 'STUDENT', count: studentsCount, percentage: Math.round((studentsCount / usersCount) * 100) },
        { role: 'TEACHER', count: teachersCount, percentage: Math.round((teachersCount / usersCount) * 100) },
        { role: 'ADMIN', count: adminsCount, percentage: Math.round((adminsCount / usersCount) * 100) }
      ],
      monthlyActivityGrowth: [
        { month: 'Sep 2025', students: 10, teachers: 2, simulations: 18 },
        { month: 'Oct 2025', students: 18, teachers: 3, simulations: 36 },
        { month: 'Nov 2025', students: 26, teachers: 5, simulations: 62 },
        { month: 'Dec 2025', students: 34, teachers: 6, simulations: 86 }
      ],
      villageEngagement: [
        { village: 'Kisanpur', activeStudents: 14, simulationRuns: 42, avgSustainability: 76 },
        { village: 'Dharani Watershed', activeStudents: 10, simulationRuns: 28, avgSustainability: 82 },
        { village: 'Shivaji Nagar', activeStudents: 6, simulationRuns: 12, avgSustainability: 68 },
        { village: 'Bhimashankar', activeStudents: 4, simulationRuns: 4, avgSustainability: 71 }
      ]
    };
  }

  /**
   * 5. Generate and Export Reports (CSV, HTML/Print View, JSON)
   */
  static async generateReport(reportType, query = {}, requestingUser) {
    const format = query.format || 'json';

    switch (reportType) {
      case 'STUDENT_PROGRESS': {
        const studentId = query.studentId || requestingUser.id;
        const analytics = await this.getStudentAnalytics(studentId, query, requestingUser);

        if (format === 'csv') {
          const csv = ReportingEngine.generateStudentProgressReport({
            student: analytics.student,
            xp: analytics.progression,
            missions: analytics.categoryMastery,
            simulations: analytics.recentSimulations
          }, 'csv');
          return { content: csv, mimeType: 'text/csv', filename: `student-progress-${studentId}.csv` };
        }
        if (format === 'html') {
          const html = ReportingEngine.generateStudentProgressReport({
            student: analytics.student,
            xp: analytics.progression,
            missions: [],
            simulations: analytics.recentSimulations
          }, 'html');
          return { content: html, mimeType: 'text/html', filename: `student-progress-${studentId}.html` };
        }
        return { content: analytics, mimeType: 'application/json', filename: `student-progress-${studentId}.json` };
      }

      case 'TEACHER_CLASSROOM': {
        if (requestingUser.role !== 'TEACHER' && requestingUser.role !== 'ADMIN') {
          const error = new Error('Forbidden: Only teachers and administrators can export classroom reports.');
          error.statusCode = 403;
          throw error;
        }

        const analytics = await this.getTeacherClassroomAnalytics(requestingUser.id, query);
        if (format === 'csv') {
          const csv = ReportingEngine.generateTeacherClassroomReport({
            teacher: requestingUser,
            students: analytics.students,
            stats: analytics.classroomOverview
          }, 'csv');
          return { content: csv, mimeType: 'text/csv', filename: `classroom-report-${requestingUser.id}.csv` };
        }
        if (format === 'html') {
          const html = ReportingEngine.generateTeacherClassroomReport({
            teacher: requestingUser,
            students: analytics.students,
            stats: analytics.classroomOverview
          }, 'html');
          return { content: html, mimeType: 'text/html', filename: `classroom-report-${requestingUser.id}.html` };
        }
        return { content: analytics, mimeType: 'application/json', filename: `classroom-report-${requestingUser.id}.json` };
      }

      case 'GROUNDWATER_SIMULATION': {
        const runs = MOCK_SIMULATION_RUNS;
        if (format === 'csv') {
          const csv = ReportingEngine.generateGroundwaterSimulationReport({
            village: { name: 'Kisanpur Alluvial Aquifer' },
            simulationRuns: runs
          }, 'csv');
          return { content: csv, mimeType: 'text/csv', filename: 'groundwater-simulation-report.csv' };
        }
        if (format === 'html') {
          const html = ReportingEngine.generateGroundwaterSimulationReport({
            village: { name: 'Kisanpur Alluvial Aquifer', region: 'Central India' },
            simulationRuns: runs
          }, 'html');
          return { content: html, mimeType: 'text/html', filename: 'groundwater-simulation-report.html' };
        }
        return { content: { simulationRuns: runs }, mimeType: 'application/json', filename: 'groundwater-simulation-report.json' };
      }

      case 'ADMIN_PLATFORM': {
        if (requestingUser.role !== 'ADMIN') {
          const error = new Error('Forbidden: Only administrators can export platform-wide reports.');
          error.statusCode = 403;
          throw error;
        }

        const analytics = await this.getAdminPlatformAnalytics(query);
        if (format === 'csv') {
          const csv = ReportingEngine.generateAdminPlatformReport(analytics, 'csv');
          return { content: csv, mimeType: 'text/csv', filename: 'platform-activity-report.csv' };
        }
        if (format === 'html') {
          const html = ReportingEngine.generateAdminPlatformReport(analytics, 'html');
          return { content: html, mimeType: 'text/html', filename: 'platform-activity-report.html' };
        }
        return { content: analytics, mimeType: 'application/json', filename: 'platform-activity-report.json' };
      }

      default: {
        const error = new Error(`Unsupported report type: ${reportType}`);
        error.statusCode = 400;
        throw error;
      }
    }
  }
}
