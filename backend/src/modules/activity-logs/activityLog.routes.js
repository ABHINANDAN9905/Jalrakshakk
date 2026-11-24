import { Router } from 'express';
import { ActivityLogController } from './activityLog.controller.js';

const router = Router();

router.post('/', ActivityLogController.createLog);
router.get('/', ActivityLogController.getLogs);

export default router;
