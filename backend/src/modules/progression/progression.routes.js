import { Router } from 'express';
import { ProgressionController } from './progression.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// Student gamification progression & XP ledger
router.get('/me', ProgressionController.getMyProgression);

export default router;
