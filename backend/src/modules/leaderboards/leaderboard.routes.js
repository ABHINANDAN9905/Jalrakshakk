import { Router } from 'express';
import { LeaderboardController } from './leaderboard.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// Student leaderboard ranking
router.get('/', LeaderboardController.getLeaderboard);

export default router;
