import { prisma } from '../../config/database.js';

export class VillageService {
  /**
   * Create a new village simulation environment (Admin only)
   * @param {Object} data 
   */
  static async createVillage(data) {
    return await prisma.village.create({
      data: {
        name: data.name,
        description: data.description,
        region: data.region,
        district: data.district || null,
        state: data.state || null,
        country: data.country || 'India',
        population: data.population || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null
      }
    });
  }

  /**
   * Retrieve list of villages with search, filters, and pagination
   * @param {Object} filter { search, region, state, district }
   * @param {number} page 
   * @param {number} limit 
   */
  static async getVillages(filter = {}, page = 1, limit = 20) {
    const where = {};

    if (filter.region) {
      where.region = { contains: filter.region, mode: 'insensitive' };
    }

    if (filter.state) {
      where.state = { contains: filter.state, mode: 'insensitive' };
    }

    if (filter.district) {
      where.district = { contains: filter.district, mode: 'insensitive' };
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { region: { contains: filter.search, mode: 'insensitive' } }
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [villages, total] = await Promise.all([
      prisma.village.findMany({
        where,
        include: {
          _count: {
            select: {
              memberships: true,
              simulationRuns: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.village.count({ where })
    ]);

    return {
      villages: villages.map((v) => ({
        ...v,
        memberCount: v._count.memberships,
        simulationRunsCount: v._count.simulationRuns
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    };
  }

  /**
   * Get comprehensive village details and statistics
   * @param {string} id 
   */
  static async getVillageById(id) {
    const village = await prisma.village.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: true,
            simulationRuns: true,
            groundwaterRecords: true
          }
        },
        groundwaterRecords: {
          take: 5,
          orderBy: { recordedAt: 'desc' }
        }
      }
    });

    if (!village) {
      const error = new Error('Village not found.');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...village,
      statistics: {
        memberCount: village._count.memberships,
        simulationRunsCount: village._count.simulationRuns,
        groundwaterSnapshotsCount: village._count.groundwaterRecords,
        latestRecord: village.groundwaterRecords[0] || null
      }
    };
  }

  /**
   * Update village simulation parameters (Admin only)
   * @param {string} id 
   * @param {Object} data 
   */
  static async updateVillage(id, data) {
    const village = await prisma.village.findUnique({ where: { id } });
    if (!village) {
      const error = new Error('Village not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.village.update({
      where: { id },
      data
    });
  }

  /**
   * Safely remove a village (Admin only)
   * Cascading will clean up memberships, simulation runs, and records safely.
   * @param {string} id 
   */
  static async deleteVillage(id) {
    const village = await prisma.village.findUnique({ where: { id } });
    if (!village) {
      const error = new Error('Village not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.village.delete({
      where: { id }
    });

    return { success: true, message: `Village "${village.name}" deleted successfully.` };
  }
}

export default VillageService;
