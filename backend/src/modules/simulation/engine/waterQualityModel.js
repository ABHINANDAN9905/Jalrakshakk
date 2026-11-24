/**
 * Educational Water Quality Index (WQI) Model
 * 
 * Simulates non-point source pollution, agricultural chemical leaching,
 * wastewater contamination, geogenic mineral concentration, and dilution effects.
 * 
 * DISCLAIMER:
 * This is a pedagogical game index (0-100) intended exclusively for educational
 * exploration. It does NOT represent certified chemical or laboratory water quality
 * testing, nor should it be used for real-world drinking water safety determinations.
 */

export const WQI_CATEGORIES = {
  EXCELLENT: {
    label: 'Pristine / Excellent',
    min: 85,
    description: 'Minimal chemical presence; high dissolved oxygen; safe for all village uses.'
  },
  GOOD: {
    label: 'Good / Acceptable',
    min: 70,
    description: 'Minor nitrate/salinity trace; acceptable for domestic and irrigation use.'
  },
  MODERATE: {
    label: 'Moderate / Caution Advised',
    min: 50,
    description: 'Elevated fertilizer/organic load; boiling or basic filtration advised.'
  },
  POOR: {
    label: 'Poor / Contaminated',
    min: 30,
    description: 'Substantial wastewater or agrochemical leaching; unfit for unboiled drinking.'
  },
  CRITICAL: {
    label: 'Critical / Severely Degraded',
    min: 0,
    description: 'Severe contamination, heavy agrochemical toxicity or salinity hazard.'
  }
};

/**
 * Calculates simulated water quality index transition.
 * 
 * @param {Object} params
 * @param {number} [params.initialWQI=75.0] - Starting water quality index (0-100)
 * @param {number} params.rechargeM3 - Fresh recharge volume entering aquifer
 * @param {number} params.finalStorageM3 - Ending storage volume in aquifer
 * @param {number} params.maxCapacityM3 - Aquifer capacity
 * @param {string} [params.chemicalIntensity='MODERATE'] - 'LOW', 'MODERATE', 'HIGH'
 * @param {string} [params.wastewaterManagement='PARTIAL'] - 'UNTREATED', 'PARTIAL', 'SOAK_PITS', 'TREATMENT'
 * @param {boolean} [params.organicFarming=false] - True if organic agriculture practices are active
 * @param {boolean} [params.bioFiltersActive=false] - True if biological filter beds are deployed
 */
export function calculateWaterQuality({
  initialWQI = 75.0,
  rechargeM3 = 0,
  finalStorageM3 = 500000,
  maxCapacityM3 = 1000000,
  chemicalIntensity = 'MODERATE',
  wastewaterManagement = 'PARTIAL',
  organicFarming = false,
  bioFiltersActive = false
}) {
  const current = Math.min(100.0, Math.max(0.0, initialWQI));
  let deltaWQI = 0;

  // 1. Agricultural Chemical Loading
  const chemicalStressors = {
    LOW: -1.5,
    MODERATE: -4.0,
    HIGH: -8.5
  };
  let agStress = chemicalStressors[chemicalIntensity] || chemicalStressors.MODERATE;
  if (organicFarming) {
    agStress = +1.5; // Organic practices prevent agrochemical leaching
  }
  deltaWQI += agStress;

  // 2. Domestic Wastewater Management
  const sewageStressors = {
    UNTREATED: -7.0,
    PARTIAL: -3.5,
    SOAK_PITS: -0.5,
    TREATMENT: +2.0
  };
  const sewageStress = sewageStressors[wastewaterManagement] || sewageStressors.PARTIAL;
  deltaWQI += sewageStress;

  // 3. Recharge Dilution vs. Stagnant Concentration
  // Fresh recharge cleans and flushes out dissolved impurities
  const rechargeRatio = Math.min(1.0, rechargeM3 / (maxCapacityM3 || 1));
  const dilutionBonus = +(rechargeRatio * 6.0).toFixed(2);
  deltaWQI += dilutionBonus;

  // 4. Geogenic Mineral Leaching under severe drawdown
  // If storage drops below 25%, deep mineral dissolution (fluoride, salinity, arsenic) spikes
  const storageRatio = finalStorageM3 / (maxCapacityM3 || 1);
  let drawdownPenalty = 0;
  if (storageRatio < 0.25) {
    drawdownPenalty = -((0.25 - storageRatio) * 20.0);
    deltaWQI += drawdownPenalty;
  }

  // 5. Bio-filter Remediation Interventions
  if (bioFiltersActive) {
    deltaWQI += 3.5;
  }

  // Clamp final WQI to 0.0 - 100.0
  const finalWQI = +Math.min(100.0, Math.max(0.0, current + deltaWQI)).toFixed(2);
  const netChange = +(finalWQI - current).toFixed(2);

  // Categorize
  let category = WQI_CATEGORIES.CRITICAL;
  if (finalWQI >= WQI_CATEGORIES.EXCELLENT.min) category = WQI_CATEGORIES.EXCELLENT;
  else if (finalWQI >= WQI_CATEGORIES.GOOD.min) category = WQI_CATEGORIES.GOOD;
  else if (finalWQI >= WQI_CATEGORIES.MODERATE.min) category = WQI_CATEGORIES.MODERATE;
  else if (finalWQI >= WQI_CATEGORIES.POOR.min) category = WQI_CATEGORIES.POOR;

  return {
    initialWQI: current,
    finalWQI,
    netChange,
    category: category.label,
    description: category.description,
    stressorsAndRemediations: {
      agriculturalChemicalImpact: agStress,
      domesticWastewaterImpact: sewageStress,
      dilutionEffect: dilutionBonus,
      deepDrawdownSalinityPenalty: +drawdownPenalty.toFixed(2),
      bioRemediationGain: bioFiltersActive ? 3.5 : 0.0
    },
    disclaimer: 'Simulated educational index for pedagogical exploration. Not a laboratory water safety assessment.'
  };
}

export default {
  calculateWaterQuality,
  WQI_CATEGORIES
};
