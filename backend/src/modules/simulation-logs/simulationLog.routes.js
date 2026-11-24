import { Router } from 'express';
import { SimulationLogController } from './simulationLog.controller.js';

const router = Router();

router.post('/', SimulationLogController.createLog);
router.get('/', SimulationLogController.getLogs);
router.get('/run/:simulationRunId', SimulationLogController.getByRunId);

export default router;
