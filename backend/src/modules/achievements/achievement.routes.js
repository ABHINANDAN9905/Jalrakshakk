import { Router } from 'express';
import { AchievementController } from './achievement.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// Student achievements catalog & unlocked badges
router.get('/', AchievementController.getAchievements);
router.get('/my', AchievementController.getMyAchievements);

export default router;
