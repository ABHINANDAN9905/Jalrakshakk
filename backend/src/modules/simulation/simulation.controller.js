import { SimulationService } from './simulation.service.js';

export class SimulationController {
  /**
   * POST /api/v1/simulations/run
   * Execute a groundwater simulation step
   */
  static async runSimulation(req, res, next) {
    try {
      const result = await SimulationService.runSimulation(req.user.id, req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Groundwater simulation executed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/simulations/history
   * Retrieve paginated history of simulation runs
   */
  static async getSimulationHistory(req, res, next) {
    try {
      const { villageId, page, limit } = req.query;
      const pageNum = parseInt(page || '1', 10);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));

      const result = await SimulationService.getSimulationHistory(req.user, {
        villageId,
        page: pageNum,
        limit: limitNum
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Simulation run history retrieved successfully',
        data: result.runs,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: result.limit
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/simulations/scenarios
   * List all pre-configured educational scenarios
   */
  static getScenarios(req, res, next) {
    try {
      const scenarios = SimulationService.getScenarios();
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Educational scenarios retrieved successfully',
        data: scenarios
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/simulations/scenarios/:scenarioId
   * Retrieve specific educational scenario details and initial parameters
   */
  static getScenarioById(req, res, next) {
    try {
      const scenario = SimulationService.getScenarioById(req.params.scenarioId);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Scenario details retrieved successfully',
        data: scenario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/simulations/:id
   * Inspect a specific simulation run result
   */
  static async getSimulationById(req, res, next) {
    try {
      const run = await SimulationService.getSimulationById(req.params.id, req.user);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Simulation run details retrieved successfully',
        data: run
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SimulationController;
