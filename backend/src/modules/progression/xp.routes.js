import { Router } from 'express';
import { ProgressionController } from './progression.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// Student XP earning transaction ledger
router.get('/history', ProgressionController.getXPHistory);

export default router;
