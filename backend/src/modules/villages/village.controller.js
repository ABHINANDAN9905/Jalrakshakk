import { VillageService } from './village.service.js';

export class VillageController {
  /**
   * POST /api/v1/villages (Admin only)
   */
  static async createVillage(req, res, next) {
    try {
      const village = await VillageService.createVillage(req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Village created successfully',
        data: village
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/villages
   */
  static async getVillages(req, res, next) {
    try {
      const { search, region, state, district, page, limit } = req.query;
      const pageNum = parseInt(page || '1', 10);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));

      const result = await VillageService.getVillages(
        { search, region, state, district },
        pageNum,
        limitNum
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Villages retrieved successfully',
        data: result.villages,
        meta: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: limitNum
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/villages/:id
   */
  static async getVillageById(req, res, next) {
    try {
      const village = await VillageService.getVillageById(req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Village details retrieved successfully',
        data: village
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/villages/:id (Admin only)
   */
  static async updateVillage(req, res, next) {
    try {
      const updated = await VillageService.updateVillage(req.params.id, req.body);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Village updated successfully',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/villages/:id (Admin only)
   */
  static async deleteVillage(req, res, next) {
    try {
      const result = await VillageService.deleteVillage(req.params.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export default VillageController;
