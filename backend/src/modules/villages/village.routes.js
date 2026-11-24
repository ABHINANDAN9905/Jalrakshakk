import { Router } from 'express';
import { VillageController } from './village.controller.js';
import { MembershipController } from '../memberships/membership.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createVillageSchema, updateVillageSchema, villageQuerySchema } from './village.validation.js';

const router = Router();

// Authentication required for all village interactions
router.use(authenticate);

// Publicly accessible to all authenticated users
router.get('/', validate(villageQuerySchema, 'query'), VillageController.getVillages);
router.get('/:id', VillageController.getVillageById);

// Admin-only management endpoints
router.post('/', authorize('ADMIN'), validate(createVillageSchema), VillageController.createVillage);
router.patch('/:id', authorize('ADMIN'), validate(updateVillageSchema), VillageController.updateVillage);
router.delete('/:id', authorize('ADMIN'), VillageController.deleteVillage);

// Village Community Membership endpoints
router.post('/:id/join', MembershipController.joinVillage);
router.delete('/:id/leave', MembershipController.leaveVillage);
router.get('/:id/members', MembershipController.getVillageMembers);

export default router;
