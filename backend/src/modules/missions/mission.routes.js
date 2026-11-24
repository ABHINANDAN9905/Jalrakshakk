import { Router } from 'express';
import { MissionController } from './mission.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  missionQuerySchema,
  missionParamsSchema,
  completeTaskParamsSchema,
  createMissionSchema,
  updateMissionSchema
} from './mission.validation.js';

const router = Router();

router.use(authenticate);

// Student endpoints
router.get('/', validate(missionQuerySchema, 'query'), MissionController.getMissions);
router.get('/my/progress', MissionController.getMyMissionProgress);
router.get('/:id', validate(missionParamsSchema, 'params'), MissionController.getMissionById);
router.post('/:id/start', validate(missionParamsSchema, 'params'), MissionController.startMission);
router.post('/:id/tasks/:taskId/complete', validate(completeTaskParamsSchema, 'params'), MissionController.completeTask);

// Admin mission governance endpoints (mounted also via /admin/missions in main router)
router.post('/', authorize('ADMIN'), validate(createMissionSchema), MissionController.createMission);
router.patch('/:id', authorize('ADMIN'), validate(missionParamsSchema, 'params'), validate(updateMissionSchema), MissionController.updateMission);
router.delete('/:id', authorize('ADMIN'), validate(missionParamsSchema, 'params'), MissionController.deleteMission);

export default router;
