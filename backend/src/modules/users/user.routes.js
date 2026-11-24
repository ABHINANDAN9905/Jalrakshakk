import { Router } from 'express';
import { UserController } from './user.controller.js';
import { MembershipController } from '../memberships/membership.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema } from '../auth/auth.validation.js';
import { userQuerySchema, updateUserStatusSchema, updateUserRoleSchema } from './user.validation.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile endpoints (Any authenticated role)
router.get('/profile', UserController.getProfile);
router.patch('/profile', validate(updateProfileSchema), UserController.updateProfile);

// Admin-only user directory & governance
router.get('/', authorize('ADMIN'), validate(userQuerySchema, 'query'), UserController.getUsers);
router.patch('/:id/status', authorize('ADMIN'), validate(updateUserStatusSchema), UserController.updateStatus);
router.patch('/:id/role', authorize('ADMIN'), validate(updateUserRoleSchema), UserController.updateRole);

// Individual user inspection (Access controlled internally: Admin, Assigned Teacher, or Self)
router.get('/:id', UserController.getUserById);

// View enrolled villages for a user (Self, Assigned Teacher, or Admin)
router.get('/:id/villages', MembershipController.getUserVillages);

export default router;
