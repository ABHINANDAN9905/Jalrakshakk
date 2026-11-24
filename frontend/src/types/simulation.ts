import { AquiferCondition } from './groundwater';

export type SimulationLifecycleState = 
  | 'IDLE' 
  | 'CONFIGURING' 
  | 'RUNNING' 
  | 'COMPLETED' 
  | 'FAILED';

export interface BackendSimulationRequest {
  villageId: string;
  scenarioId?: string;
  season?: 'Monsoon' | 'Post-Monsoon' | 'Winter' | 'Summer';
  rainfallMm?: number;
  irrigationMethod?: 'FLOOD' | 'SPRINKLER' | 'DRIP';
  crops?: Array<{ crop: string; hectares: number }>;
  interventions?: {
    checkDamsCount?: number;
    percolationTanksCount?: number;
    farmPondsCount?: number;
    rooftopRWHUnits?: number;
  };
  chemicalIntensity?: 'LOW' | 'MODERATE' | 'HIGH';
  wastewaterManagement?: 'UNTREATED' | 'PARTIAL' | 'SOAK_PITS' | 'TREATMENT';
  organicFarming?: boolean;
  simulationDays?: number;
}

export interface BackendSimulationResponse {
  simulationId: string;
  persistedInPostgres: boolean;
  executedAt: string;
  scenarioId: string;
  season: string;
  waterBalance: {
    initialStorageM3: number;
    rainfallMm: number;
    rainfallVolumeM3: number;
    runoffVolumeM3: number;
    infiltrationVolumeM3: number;
    rechargeM3: number;
    extractionM3: number;
    naturalDischargeM3: number;
    finalStorageM3: number;
    storageChangeM3: number;
    storagePercentage: number;
    conditionCategory: AquiferCondition;
    conditionLabel: string;
    rejectedRechargeM3: number;
    unmetDeficitM3: number;
  };
  waterQuality: {
    initialWQI: number;
    finalWQI: number;
    netChange: number;
    category: string;
    disclaimer: string;
  };
  sustainability: {
    overallScore: number;
    factorScores: Record<string, number>;
    explanations: string[];
    recommendations: string[];
  };
  interventions: {
    artificialRechargeM3: number;
    runoffCapturedM3: number;
    uncapturedRunoffM3: number;
    deployed: Record<string, number>;
  };
  sectors: {
    agriculturalExtractionM3: number;
    domesticExtractionM3: number;
    industrialExtractionM3: number;
    waterSavingsM3: number;
    cropBreakdown: Array<{ crop: string; hectares: number; waterDemandM3: number }>;
  };
  hydrologicalAssumptions: string[];
}
