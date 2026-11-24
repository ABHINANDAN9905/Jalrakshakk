import { prisma } from '../../config/database.js';

export class GroundwaterService {
  /**
   * Get current groundwater table snapshot for a village
   * @param {string} villageId 
   */
  static async getVillageGroundwaterState(villageId) {
    const village = await prisma.village.findUnique({
      where: { id: villageId },
      include: {
        groundwaterRecords: {
          take: 1,
          orderBy: { recordedAt: 'desc' }
        },
        simulationRuns: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!village) {
      const error = new Error('Village not found.');
      error.statusCode = 404;
      throw error;
    }

    const latestRecord = village.groundwaterRecords[0] || null;
    const latestRun = village.simulationRuns[0] || null;

    const storageIndex = latestRecord ? latestRecord.storageIndex : 0.50;
    const storagePercentage = +(storageIndex * 100).toFixed(1);

    let conditionCategory = 'SAFE';
    if (storagePercentage < 20) conditionCategory = 'CRITICAL';
    else if (storagePercentage < 40) conditionCategory = 'SEMI_CRITICAL';
    else if (storagePercentage <= 70) conditionCategory = 'SAFE';
    else conditionCategory = 'OPTIMAL';

    return {
      village: {
        id: village.id,
        name: village.name,
        region: village.region,
        state: village.state,
        district: village.district,
        population: village.population
      },
      groundwaterState: {
        storageIndex,
        storagePercentage,
        conditionCategory,
        rechargeRateM3: latestRecord ? latestRecord.recharge : 0,
        extractionRateM3: latestRecord ? latestRecord.extraction : 0,
        waterQualityIndex: latestRecord ? latestRecord.waterQualityIndex : 75.0,
        lastSimulatedAt: latestRecord ? latestRecord.recordedAt : village.createdAt
      },
      latestSimulation: latestRun
        ? {
            id: latestRun.id,
            sustainabilityScore: latestRun.sustainabilityScore,
            rainfallMm: latestRun.rainfall,
            finalStorageM3: latestRun.finalStorage,
            createdAt: latestRun.createdAt
          }
        : null
    };
  }

  /**
   * Get time-series groundwater record history for a village
   * @param {string} villageId 
   * @param {number} page 
   * @param {number} limit 
   */
  static async getVillageGroundwaterHistory(villageId, page = 1, limit = 20) {
    const village = await prisma.village.findUnique({ where: { id: villageId } });
    if (!village) {
      const error = new Error('Village not found.');
      error.statusCode = 404;
      throw error;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.groundwaterRecord.findMany({
        where: { villageId },
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' }
      }),
      prisma.groundwaterRecord.count({ where: { villageId } })
    ]);

    return {
      villageId,
      villageName: village.name,
      records,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    };
  }
}

export default GroundwaterService;
