import api from './api';
import { VillageGroundwaterSummary } from '../types/groundwater';

// Educational default mock data for offline/standalone interactive experience
export const DEFAULT_VILLAGE_GROUNDWATER: VillageGroundwaterSummary = {
  villageId: 'v-sangamner-01',
  villageName: 'Kalyanpur Gram',
  state: 'Maharashtra',
  district: 'Ahmednagar',
  metrics: {
    storagePercentage: 68.5,
    depthToWaterTableMeters: 14.2,
    conditionCategory: 'SAFE',
    annualRechargeM3: 420000,
    annualExtractionM3: 310000,
    netDraftPercentage: 73.8,
    waterQualityIndex: 82,
    rainfallMm: 680,
    soilMoistureIndex: 64,
    lastSimulatedDate: '2026-11-22',
  },
  historicalTrend: [
    { month: 'Jun', waterTableDepth: 19.5, rechargeM3: 85000, extractionM3: 32000 },
    { month: 'Jul', waterTableDepth: 16.2, rechargeM3: 130000, extractionM3: 25000 },
    { month: 'Aug', waterTableDepth: 13.8, rechargeM3: 110000, extractionM3: 28000 },
    { month: 'Sep', waterTableDepth: 12.5, rechargeM3: 75000, extractionM3: 35000 },
    { month: 'Oct', waterTableDepth: 13.1, rechargeM3: 20000, extractionM3: 45000 },
    { month: 'Nov', waterTableDepth: 14.2, rechargeM3: 10000, extractionM3: 48000 },
  ],
};

export const groundwaterService = {
  async getVillageGroundwater(villageId?: string): Promise<VillageGroundwaterSummary> {
    try {
      const id = villageId || 'default-village';
      const response = await api.get(`/groundwater/villages/${id}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return DEFAULT_VILLAGE_GROUNDWATER;
    } catch (err) {
      // Graceful offline fallback
      return DEFAULT_VILLAGE_GROUNDWATER;
    }
  },
};
