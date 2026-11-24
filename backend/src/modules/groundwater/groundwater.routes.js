import { Router } from 'express';
import { GroundwaterController } from './groundwater.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  villageGroundwaterParamsSchema,
  groundwaterQuerySchema
} from './groundwater.validation.js';

const router = Router();

// Authentication required for all groundwater queries
router.use(authenticate);

// Village groundwater state & historical curves
router.get(
  '/villages/:villageId',
  validate(villageGroundwaterParamsSchema, 'params'),
  GroundwaterController.getVillageGroundwaterState
);

router.get(
  '/villages/:villageId/history',
  validate(villageGroundwaterParamsSchema, 'params'),
  validate(groundwaterQuerySchema, 'query'),
  GroundwaterController.getVillageGroundwaterHistory
);

export default router;
