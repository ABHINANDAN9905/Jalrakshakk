import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  updateUserRoleSchema,
  updateUserStatusSchema,
  createVillageSchema,
  updateVillageSchema,
  createAdminMissionSchema,
  updateAdminMissionSchema,
  createAdminChallengeSchema,
  updateAdminChallengeSchema
} from './admin.validation.js';

const router = Router();

// Mandatory authentication and ADMIN role check on every administrative route
router.use(authenticate, authorize('ADMIN'));

// 1. Admin Dashboard
router.get('/dashboard', AdminController.getDashboard);

// 2. User Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', validate(updateUserStatusSchema), AdminController.updateUserStatus);
router.patch('/users/:id/role', validate(updateUserRoleSchema), AdminController.updateUserRole);

// 3. Teacher Management
router.get('/teachers', AdminController.getTeachers);

// 4. Village Management
router.get('/villages', AdminController.getVillages);
router.post('/villages', validate(createVillageSchema), AdminController.createVillage);
router.patch('/villages/:id', validate(updateVillageSchema), AdminController.updateVillage);

// 5. Mission Management
router.get('/missions', AdminController.getMissions);
router.post('/missions', validate(createAdminMissionSchema), AdminController.createMission);
router.patch('/missions/:id', validate(updateAdminMissionSchema), AdminController.updateMission);
router.patch('/missions/:id/status', validate(updateUserStatusSchema), AdminController.toggleMissionStatus);

// 6. Challenge Management
router.get('/challenges', AdminController.getChallenges);
router.post('/challenges', validate(createAdminChallengeSchema), AdminController.createChallenge);
router.patch('/challenges/:id', validate(updateAdminChallengeSchema), AdminController.updateChallenge);

// 7. Platform Analytics
router.get('/analytics', AdminController.getAnalytics);

// 8. Activity Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

// 9. System Health Diagnostics
router.get('/system-health', AdminController.getSystemHealth);

export default router;
