import { Router } from 'express';
import { SimulationController } from './simulation.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  runSimulationSchema,
  simulationQuerySchema,
  scenarioParamsSchema
} from './simulation.validation.js';

const router = Router();

// Authentication required for all simulation interactions
router.use(authenticate);

// Educational Scenario discovery
router.get('/scenarios', SimulationController.getScenarios);
router.get('/scenarios/:scenarioId', validate(scenarioParamsSchema, 'params'), SimulationController.getScenarioById);

// Simulation execution & history
router.post('/run', validate(runSimulationSchema), SimulationController.runSimulation);
router.get('/history', validate(simulationQuerySchema, 'query'), SimulationController.getSimulationHistory);
router.get('/:id', SimulationController.getSimulationById);

export default router;
