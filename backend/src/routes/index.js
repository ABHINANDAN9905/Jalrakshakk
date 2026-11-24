import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import villageRoutes from '../modules/villages/village.routes.js';
import teacherRoutes from '../modules/teacher-students/teacherStudent.routes.js';
import simulationRoutes from '../modules/simulation/simulation.routes.js';
import groundwaterRoutes from '../modules/groundwater/groundwater.routes.js';
import missionRoutes from '../modules/missions/mission.routes.js';
import progressionRoutes from '../modules/progression/progression.routes.js';
import xpRoutes from '../modules/progression/xp.routes.js';
import achievementRoutes from '../modules/achievements/achievement.routes.js';
import challengeRoutes from '../modules/challenges/challenge.routes.js';
import teacherAssignmentRoutes from '../modules/teacher-assignments/teacherAssignment.routes.js';
import leaderboardRoutes from '../modules/leaderboards/leaderboard.routes.js';
import activityLogRoutes from '../modules/activity-logs/activityLog.routes.js';
import simulationLogRoutes from '../modules/simulation-logs/simulationLog.routes.js';
import conversationRoutes from '../modules/ai-mentor/conversation.routes.js';
import aiMentorRoutes from '../modules/ai-mentor/aiMentor.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import analyticsRoutes from '../modules/analytics/analytics.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import { MissionController } from '../modules/missions/mission.controller.js';
import { createMissionSchema, updateMissionSchema, missionParamsSchema } from '../modules/missions/mission.validation.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

/**
 * @route   GET /api/v1/status
 * @desc    API v1 health and operational status verification
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'JalRakshak API v1 is operational'
  });
});

// Authentication & Identity Routes
router.use('/auth', authRoutes);

// User Profile & Management Routes
router.use('/users', userRoutes);

// Village Simulation & Community Management Routes
router.use('/villages', villageRoutes);

// Teacher-Student Assignment & Classroom Monitoring Routes
router.use('/teachers', teacherRoutes);

// Groundwater Hydrological Simulation & Analytics Engine (Phase 7)
router.use('/simulations', simulationRoutes);
router.use('/groundwater', groundwaterRoutes);

// Gamification, Missions, Progression, Challenges & Leaderboards (Phase 8)
router.use('/missions', missionRoutes);
router.use('/progression', progressionRoutes);
router.use('/xp', xpRoutes);
router.use('/achievements', achievementRoutes);
router.use('/challenges', challengeRoutes);
router.use('/teacher', teacherAssignmentRoutes);
router.use('/leaderboard', leaderboardRoutes);

// Admin Platform Governance & Cockpit Routes (Phase 13)
router.use('/admin', adminRoutes);

// Advanced Analytics, Insights & Reporting Engine (Phase 14)
router.use('/analytics', analyticsRoutes);

// Central Notification System & Real-Time Alerts (Phase 15)
router.use('/notifications', notificationRoutes);

// MongoDB Document & Telemetry Services
router.use('/activity-logs', activityLogRoutes);
router.use('/simulation-logs', simulationLogRoutes);
router.use('/ai-mentor/conversations', conversationRoutes);
router.use('/ai-mentor', aiMentorRoutes);

// Role-Based Access Control Verification Routes (Educational RBAC endpoints)
router.get('/test/student-only', authenticate, authorize('STUDENT'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to Student Learning Area', user: req.user });
});

router.get('/test/teacher-only', authenticate, authorize('TEACHER'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to Teacher Classroom Dashboard', user: req.user });
});

router.get('/test/admin-only', authenticate, authorize('ADMIN'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to System Administration Panel', user: req.user });
});

export default router;
