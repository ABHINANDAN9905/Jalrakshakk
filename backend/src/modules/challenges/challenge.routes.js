import { Router } from 'express';
import { ChallengeController } from './challenge.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// Student daily & weekly challenges
router.get('/', ChallengeController.getChallenges);
router.get('/my', ChallengeController.getMyChallenges);
router.post('/:id/join', ChallengeController.joinChallenge);

export default router;
