import { GroundwaterService } from './groundwater.service.js';

export class GroundwaterController {
  /**
   * GET /api/v1/groundwater/villages/:villageId
   * Retrieve current groundwater table state for a village
   */
  static async getVillageGroundwaterState(req, res, next) {
    try {
      const { villageId } = req.params;
      const state = await GroundwaterService.getVillageGroundwaterState(villageId);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Village groundwater state retrieved successfully',
        data: state
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/groundwater/villages/:villageId/history
   * Retrieve historical groundwater records for a village
   */
  static async getVillageGroundwaterHistory(req, res, next) {
    try {
      const { villageId } = req.params;
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));

      const result = await GroundwaterService.getVillageGroundwaterHistory(villageId, page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Village groundwater record history retrieved successfully',
        data: result.records,
        meta: {
          villageId: result.villageId,
          villageName: result.villageName,
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
}

export default GroundwaterController;
