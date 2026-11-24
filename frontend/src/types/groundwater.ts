export type AquiferCondition = 'CRITICAL' | 'SEMI_CRITICAL' | 'SAFE' | 'OPTIMAL';

/**
 * Canonical Central Ground Water Board (CGWB) & Phase 7 Model Thresholds
 * Single source of truth across Frontend & Backend:
 * - CRITICAL: below 20%
 * - SEMI_CRITICAL: 20% to below 40%
 * - SAFE: 40% to 70%
 * - OPTIMAL: above 70%
 */
export const AQUIFER_THRESHOLDS = {
  CRITICAL_CEILING: 20.0,
  SEMI_CRITICAL_CEILING: 40.0,
  SAFE_CEILING: 70.0,
} as const;

export function classifyAquiferCondition(storagePercentage: number): AquiferCondition {
  if (storagePercentage < 20.0) return 'CRITICAL';
  if (storagePercentage < 40.0) return 'SEMI_CRITICAL';
  if (storagePercentage <= 70.0) return 'SAFE';
  return 'OPTIMAL';
}

export function getAquiferConditionColor(condition: AquiferCondition): string {
  switch (condition) {
    case 'CRITICAL':
      return '#ef4444'; // Red-600
    case 'SEMI_CRITICAL':
      return '#f97316'; // Orange-500
    case 'SAFE':
      return '#0284c7'; // Sky-600
    case 'OPTIMAL':
      return '#06b6d4'; // Cyan-500
    default:
      return '#0284c7';
  }
}

export interface GroundwaterMetrics {
  storagePercentage: number;
  depthToWaterTableMeters: number;
  conditionCategory: AquiferCondition;
  annualRechargeM3: number;
  annualExtractionM3: number;
  netDraftPercentage: number;
  waterQualityIndex: number; // 0 - 100
  rainfallMm: number;
  soilMoistureIndex: number;
  lastSimulatedDate?: string;
}

export interface VillageGroundwaterSummary {
  villageId: string;
  villageName: string;
  state: string;
  district: string;
  metrics: GroundwaterMetrics;
  historicalTrend: {
    month: string;
    waterTableDepth: number;
    rechargeM3: number;
    extractionM3: number;
  }[];
}
