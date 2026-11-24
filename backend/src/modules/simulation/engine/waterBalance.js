/**
 * Scientific Water Balance Master Simulation Engine
 * 
 * Orchestrates the complete hydrological simulation loop:
 *   1. Precipitation volume & partitioning (rainfallModel)
 *   2. Aquifer recharge & conservation capture (rechargeModel)
 *   3. Agricultural & domestic extraction (extractionModel)
 *   4. Aquifer state transition & boundary preservation (aquiferModel)
 *   5. Non-point source water quality modeling (waterQualityModel)
 *   6. Multi-factor sustainability assessment (sustainabilityModel)
 * 
 * Master Equation:
 *   Change in Groundwater Storage (ΔS) = Recharge - Extraction - Natural Discharge
 *   New Storage = max(0, min(S_max, Previous Storage + Recharge - Extraction - Natural Discharge))
 */

import { calculateRainfallVolume } from './rainfallModel.js';
import { calculateRecharge } from './rechargeModel.js';
import { calculateExtraction } from './extractionModel.js';
import { calculateAquiferState } from './aquiferModel.js';
import { calculateWaterQuality } from './waterQualityModel.js';
import { calculateSustainabilityScore } from './sustainabilityModel.js';

/**
 * Runs a single discrete educational simulation step or seasonal cycle.
 * 
 * @param {Object} inputs
 * @param {string} [inputs.scenarioId] - Optional scenario preset identifier
 * @param {string} [inputs.season='Monsoon'] - 'Monsoon', 'Post-Monsoon', 'Winter', 'Summer'
 * @param {number} inputs.catchmentAreaM2 - Watershed catchment surface area in m2
 * @param {string} [inputs.soilType='HARD_ROCK'] - Soil category
 * @param {string} [inputs.slope='MODERATE'] - Topographic slope
 * @param {number} inputs.rainfallMm - Rainfall depth in mm
 * @param {number} inputs.initialStorageM3 - Starting aquifer storage in m3
 * @param {number} inputs.maxCapacityM3 - Maximum storage capacity in m3
 * @param {number} [inputs.population=4000] - Village population
 * @param {number} [inputs.perCapitaLpcd=55] - Domestic water allowance in LPCD
 * @param {number} [inputs.simulationDays=90] - Duration of simulation step in days
 * @param {Array<{ crop: string, hectares: number }>} [inputs.crops=[]] - Cropping pattern
 * @param {string} [inputs.irrigationMethod='FLOOD'] - 'FLOOD', 'SPRINKLER', 'DRIP'
 * @param {Object} [inputs.interventions={}] - Conservation infrastructure
 * @param {number} [inputs.initialWQI=75] - Starting Water Quality Index
 * @param {string} [inputs.chemicalIntensity='MODERATE'] - Agrochemical intensity
 * @param {string} [inputs.wastewaterManagement='PARTIAL'] - Sewage management
 * @param {boolean} [inputs.organicFarming=false] - Organic farming adoption
 * @param {boolean} [inputs.bioFiltersActive=false] - Bio-filter remediation
 * @param {number} [inputs.industrialExtractionM3=0] - Commercial/industrial draft
 */
export function runSimulationEngine(inputs) {
  const {
    scenarioId = 'CUSTOM_SIMULATION',
    season = 'Monsoon',
    catchmentAreaM2 = 5000000,
    soilType = 'HARD_ROCK',
    slope = 'MODERATE',
    rainfallMm = 700,
    initialStorageM3 = 500000,
    maxCapacityM3 = 1000000,
    population = 4000,
    perCapitaLpcd = 55,
    simulationDays = 90,
    crops = [],
    irrigationMethod = 'FLOOD',
    interventions = {},
    initialWQI = 75,
    chemicalIntensity = 'MODERATE',
    wastewaterManagement = 'PARTIAL',
    organicFarming = false,
    bioFiltersActive = false,
    industrialExtractionM3 = 0
  } = inputs;

  // 1. Precipitation & Surface Partitioning
  const rainfallOutput = calculateRainfallVolume({
    rainfallMm,
    catchmentAreaM2,
    soilType,
    slope
  });

  // 2. Aquifer Recharge
  const rechargeOutput = calculateRecharge({
    infiltrationVolumeM3: rainfallOutput.infiltrationVolumeM3,
    runoffVolumeM3: rainfallOutput.runoffVolumeM3,
    deepPercolationFraction: 0.50,
    interventions
  });

  // 3. Groundwater Draft & Extraction
  const extractionOutput = calculateExtraction({
    crops,
    irrigationMethod,
    population,
    perCapitaLpcd,
    simulationDays,
    industrialExtractionM3
  });

  // 4. Aquifer Storage & Water Table State
  const aquiferOutput = calculateAquiferState({
    initialStorageM3,
    maxCapacityM3,
    rechargeM3: rechargeOutput.totalRechargeM3,
    extractionM3: extractionOutput.totalExtractionM3,
    naturalDischargeCoeff: 0.03
  });

  // 5. Educational Water Quality Index
  const qualityOutput = calculateWaterQuality({
    initialWQI,
    rechargeM3: rechargeOutput.totalRechargeM3,
    finalStorageM3: aquiferOutput.finalStorageM3,
    maxCapacityM3,
    chemicalIntensity,
    wastewaterManagement,
    organicFarming,
    bioFiltersActive
  });

  // 6. Sustainability Scoring
  const sustainabilityOutput = calculateSustainabilityScore({
    storagePercentage: aquiferOutput.storagePercentage,
    rechargeM3: rechargeOutput.totalRechargeM3,
    extractionM3: extractionOutput.totalExtractionM3,
    irrigationMethod,
    waterSavingsM3: extractionOutput.waterSavingsM3,
    artificialRechargeM3: rechargeOutput.artificialRechargeM3,
    waterQualityIndex: qualityOutput.finalWQI
  });

  // Aggregate scientific explanations & calculation details
  const calculationSummary = {
    scenarioId,
    season,
    hydrologicalAssumptions: [
      ...rainfallOutput.assumptions,
      ...rechargeOutput.assumptions,
      ...extractionOutput.assumptions,
      ...aquiferOutput.assumptions
    ],
    waterBalance: {
      initialStorageM3: aquiferOutput.initialStorageM3,
      rainfallMm: rainfallOutput.rainfallMm,
      rainfallVolumeM3: rainfallOutput.totalVolumeM3,
      runoffVolumeM3: rainfallOutput.runoffVolumeM3,
      infiltrationVolumeM3: rainfallOutput.infiltrationVolumeM3,
      rechargeM3: aquiferOutput.rechargeM3,
      extractionM3: aquiferOutput.extractionM3,
      naturalDischargeM3: aquiferOutput.naturalDischargeM3,
      finalStorageM3: aquiferOutput.finalStorageM3,
      storageChangeM3: aquiferOutput.storageChangeM3,
      storagePercentage: aquiferOutput.storagePercentage,
      conditionCategory: aquiferOutput.conditionCategory,
      conditionLabel: aquiferOutput.conditionLabel,
      rejectedRechargeM3: aquiferOutput.rejectedRechargeM3,
      unmetDeficitM3: aquiferOutput.unmetDeficitM3
    },
    sectors: {
      agriculturalExtractionM3: extractionOutput.agriculturalExtractionM3,
      domesticExtractionM3: extractionOutput.domesticExtractionM3,
      industrialExtractionM3: extractionOutput.industrialExtractionM3,
      waterSavingsM3: extractionOutput.waterSavingsM3,
      cropBreakdown: extractionOutput.cropBreakdown
    },
    interventions: {
      artificialRechargeM3: rechargeOutput.artificialRechargeM3,
      runoffCapturedM3: rechargeOutput.runoffCapturedM3,
      uncapturedRunoffM3: rechargeOutput.uncapturedRunoffM3,
      deployed: rechargeOutput.interventionsSummary
    },
    waterQuality: {
      initialWQI: qualityOutput.initialWQI,
      finalWQI: qualityOutput.finalWQI,
      netChange: qualityOutput.netChange,
      category: qualityOutput.category,
      disclaimer: qualityOutput.disclaimer
    },
    sustainability: {
      overallScore: sustainabilityOutput.overallScore,
      factorScores: sustainabilityOutput.factorScores,
      explanations: sustainabilityOutput.explanations,
      recommendations: sustainabilityOutput.recommendations
    }
  };

  return calculationSummary;
}

export default {
  runSimulationEngine
};
