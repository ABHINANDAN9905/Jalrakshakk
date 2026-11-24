import { Router } from 'express';
import { AiMentorController } from './aiMentor.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  askQuestionSchema,
  explainSimulationSchema,
  recommendActionsSchema,
  quizQuestionSchema
} from './aiMentor.validation.js';

const router = Router();

// Authentication required for all AI Water Mentor endpoints
router.use(authenticate);

// 1. Interactive Chat & Explanation
router.post('/chat', validate(askQuestionSchema), AiMentorController.chat);
router.get('/explain-simulation', validate(explainSimulationSchema, 'query'), AiMentorController.explainSimulation);

// 2. Recommendations & Learning Quizzes
router.get('/recommendations', validate(recommendActionsSchema, 'query'), AiMentorController.getRecommendations);
router.get('/quiz', validate(quizQuestionSchema, 'query'), AiMentorController.getQuiz);

// 3. Conversation Session History & Management
router.get('/conversations', AiMentorController.getSessions);
router.get('/conversations/:sessionId', AiMentorController.getSessionById);
router.delete('/conversations/:sessionId', AiMentorController.deleteSession);

export default router;
