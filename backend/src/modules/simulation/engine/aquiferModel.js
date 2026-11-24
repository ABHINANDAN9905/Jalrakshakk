/**
 * Aquifer Storage and Water Table State Model
 * 
 * Simulates storage dynamics, capacity saturation constraints, baseflow/natural discharge,
 * negative storage prevention, and classifies the water table state condition.
 * 
 * Core Equation:
 *   S_tentative = S_initial + Recharge - Extraction - NaturalDischarge
 *   S_final = max(0, min(S_max, S_tentative))
 */

export const WATER_TABLE_CATEGORIES = {
  CRITICAL: {
    code: 'CRITICAL',
    label: 'Critical / Severely Depleted',
    rangeDescription: 'Storage < 20% of capacity',
    hydrologicalImpact: 'Shallow dug wells dry; severe borewell yield collapse; acute agricultural deficit.'
  },
  SEMI_CRITICAL: {
    code: 'SEMI_CRITICAL',
    label: 'Semi-Critical / Vulnerable',
    rangeDescription: 'Storage 20% to 40% of capacity',
    hydrologicalImpact: 'Water table receding; seasonal dry spells observed; strict rationing advised.'
  },
  SAFE: {
    code: 'SAFE',
    label: 'Safe / Balanced Equilibrium',
    rangeDescription: 'Storage 40% to 70% of capacity',
    hydrologicalImpact: 'Sustainable extraction; regular recharge; stable domestic and irrigation supply.'
  },
  OPTIMAL: {
    code: 'OPTIMAL',
    label: 'Optimal / Saturated Aquifer',
    rangeDescription: 'Storage > 70% of capacity',
    hydrologicalImpact: 'Abundant groundwater reserves; baseflow feeds surface streams and springs.'
  }
};

/**
 * Updates aquifer storage and computes mass conservation boundaries.
 * 
 * @param {Object} params
 * @param {number} params.initialStorageM3 - Starting groundwater volume in m3 (>= 0)
 * @param {number} params.maxCapacityM3 - Total storage capacity of the aquifer in m3 (> 0)
 * @param {number} params.rechargeM3 - Total recharge gained in m3 (>= 0)
 * @param {number} params.extractionM3 - Total groundwater draft in m3 (>= 0)
 * @param {number} [params.naturalDischargeCoeff=0.03] - Baseflow/natural discharge fraction (0.0 to 0.1)
 */
export function calculateAquiferState({
  initialStorageM3,
  maxCapacityM3,
  rechargeM3,
  extractionM3,
  naturalDischargeCoeff = 0.03
}) {
  if (initialStorageM3 < 0) {
    throw new Error('Initial storage cannot be negative.');
  }
  if (!maxCapacityM3 || maxCapacityM3 <= 0) {
    throw new Error('Maximum aquifer capacity must be a positive number in cubic meters.');
  }
  if (rechargeM3 < 0 || extractionM3 < 0) {
    throw new Error('Recharge and extraction must be non-negative.');
  }

  // Clamped initial storage to capacity if input exceeded
  const validInitial = Math.min(maxCapacityM3, initialStorageM3);

  // Natural discharge / baseflow into local streams (proportional to current hydrostatic head)
  const clampedDischargeCoeff = Math.min(0.10, Math.max(0.0, naturalDischargeCoeff));
  const naturalDischargeM3 = +(validInitial * clampedDischargeCoeff).toFixed(2);

  // Tentative unbounded storage
  const tentativeStorageM3 = validInitial + rechargeM3 - extractionM3 - naturalDischargeM3;

  let finalStorageM3 = 0;
  let rejectedRechargeM3 = 0;
  let unmetDeficitM3 = 0;

  if (tentativeStorageM3 > maxCapacityM3) {
    // Aquifer overflow: saturated aquifer rejects excess recharge as surface runoff/spring baseflow
    finalStorageM3 = maxCapacityM3;
    rejectedRechargeM3 = +(tentativeStorageM3 - maxCapacityM3).toFixed(2);
  } else if (tentativeStorageM3 < 0) {
    // Aquifer exhaustion: storage cannot drop below zero
    finalStorageM3 = 0;
    unmetDeficitM3 = +(Math.abs(tentativeStorageM3)).toFixed(2);
  } else {
    finalStorageM3 = +tentativeStorageM3.toFixed(2);
  }

  const storageChangeM3 = +(finalStorageM3 - validInitial).toFixed(2);
  const storagePercentage = +((finalStorageM3 / maxCapacityM3) * 100).toFixed(2);

  // Water table state classification
  let conditionCategory = WATER_TABLE_CATEGORIES.SAFE;
  if (storagePercentage < 20.0) {
    conditionCategory = WATER_TABLE_CATEGORIES.CRITICAL;
  } else if (storagePercentage < 40.0) {
    conditionCategory = WATER_TABLE_CATEGORIES.SEMI_CRITICAL;
  } else if (storagePercentage <= 70.0) {
    conditionCategory = WATER_TABLE_CATEGORIES.SAFE;
  } else {
    conditionCategory = WATER_TABLE_CATEGORIES.OPTIMAL;
  }

  return {
    initialStorageM3: +validInitial.toFixed(2),
    finalStorageM3,
    maxCapacityM3: +maxCapacityM3.toFixed(2),
    rechargeM3: +rechargeM3.toFixed(2),
    extractionM3: +extractionM3.toFixed(2),
    naturalDischargeM3,
    storageChangeM3,
    storagePercentage,
    conditionCategory: conditionCategory.code,
    conditionLabel: conditionCategory.label,
    conditionImpact: conditionCategory.hydrologicalImpact,
    rejectedRechargeM3,
    unmetDeficitM3,
    assumptions: [
      `Starting storage: ${+validInitial.toFixed(1)} m³ (${((validInitial / maxCapacityM3) * 100).toFixed(1)}% of ${maxCapacityM3} m³ capacity).`,
      `Inflows: +${+rechargeM3.toFixed(1)} m³ recharge.`,
      `Outflows: -${+extractionM3.toFixed(1)} m³ extraction, -${naturalDischargeM3} m³ natural baseflow.`,
      `Net change: ${storageChangeM3 >= 0 ? '+' : ''}${storageChangeM3} m³, leaving ${finalStorageM3} m³ (${storagePercentage}%).`,
      rejectedRechargeM3 > 0 ? `Rejected recharge due to capacity overflow: ${rejectedRechargeM3} m³.` : null,
      unmetDeficitM3 > 0 ? `Groundwater deficit (unmet demand due to dry aquifer): ${unmetDeficitM3} m³.` : null
    ].filter(Boolean)
  };
}

export default {
  calculateAquiferState,
  WATER_TABLE_CATEGORIES
};
