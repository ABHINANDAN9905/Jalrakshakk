import { Router } from 'express';
import { ConversationController } from './conversation.controller.js';

const router = Router();

router.post('/', ConversationController.addMessage);
router.get('/:sessionId', ConversationController.getSession);
router.get('/user/:userId', ConversationController.getUserSessions);

export default router;
