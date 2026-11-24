/**
 * Groundwater Recharge Model
 * 
 * Computes deep aquifer recharge through natural vadose zone percolation
 * and artificial recharge structures (check dams, percolation tanks, farm ponds, RWH).
 * 
 * Strictly ensures total recharge does not exceed available infiltration and runoff.
 */

export const INTERVENTION_SPECIFICATIONS = {
  CHECK_DAM: {
    name: 'Masonry Check Dam',
    captureCapacityM3: 6000,
    rechargeEfficiency: 0.75, // 75% of captured runoff enters deep aquifer
    description: 'Small barrier across minor drainage channel to impede runoff and promote percolation'
  },
  PERCOLATION_TANK: {
    name: 'Community Percolation Tank',
    captureCapacityM3: 25000,
    rechargeEfficiency: 0.80,
    description: 'Excavated earthen storage basin capturing monsoon runoff over permeable strata'
  },
  FARM_POND: {
    name: 'On-Farm Pond / Contour Trenches',
    captureCapacityM3: 3000,
    rechargeEfficiency: 0.70,
    description: 'Decentralized farm-level recharge and surface moisture buffering'
  },
  ROOFTOP_RWH: {
    name: 'Rooftop Rainwater Harvesting Unit',
    captureCapacityM3: 75,
    rechargeEfficiency: 0.85,
    description: 'Recharges filtered roof runoff directly into shallow dug/recharge wells'
  }
};

/**
 * Calculates natural and artificial groundwater recharge.
 * 
 * @param {Object} params
 * @param {number} params.infiltrationVolumeM3 - Soil infiltration volume in m3 (>= 0)
 * @param {number} params.runoffVolumeM3 - Surface runoff volume in m3 (>= 0)
 * @param {number} [params.deepPercolationFraction=0.50] - Fraction of infiltration reaching saturated zone (0.1 to 0.9)
 * @param {Object} [params.interventions={}] - Deployed conservation infrastructure
 * @param {number} [params.interventions.checkDamsCount=0]
 * @param {number} [params.interventions.percolationTanksCount=0]
 * @param {number} [params.interventions.farmPondsCount=0]
 * @param {number} [params.interventions.rooftopRWHUnits=0]
 */
export function calculateRecharge({
  infiltrationVolumeM3,
  runoffVolumeM3,
  deepPercolationFraction = 0.50,
  interventions = {}
}) {
  if (infiltrationVolumeM3 < 0 || runoffVolumeM3 < 0) {
    throw new Error('Infiltration and runoff volumes must be non-negative.');
  }

  // 1. Natural Recharge from deep vadose percolation
  // Deep percolation fraction accounts for soil moisture retention and plant transpiration in the root zone
  const clampedPercolation = Math.min(0.90, Math.max(0.10, deepPercolationFraction));
  const naturalRechargeM3 = +(infiltrationVolumeM3 * clampedPercolation).toFixed(2);
  const soilMoistureRetainedM3 = +(infiltrationVolumeM3 - naturalRechargeM3).toFixed(2);

  // 2. Artificial Recharge from Interventions
  const checkDams = Math.max(0, parseInt(interventions.checkDamsCount || 0, 10));
  const percTanks = Math.max(0, parseInt(interventions.percolationTanksCount || 0, 10));
  const farmPonds = Math.max(0, parseInt(interventions.farmPondsCount || 0, 10));
  const rwhUnits = Math.max(0, parseInt(interventions.rooftopRWHUnits || 0, 10));

  const totalCapturePotentialM3 =
    checkDams * INTERVENTION_SPECIFICATIONS.CHECK_DAM.captureCapacityM3 +
    percTanks * INTERVENTION_SPECIFICATIONS.PERCOLATION_TANK.captureCapacityM3 +
    farmPonds * INTERVENTION_SPECIFICATIONS.FARM_POND.captureCapacityM3 +
    rwhUnits * INTERVENTION_SPECIFICATIONS.ROOFTOP_RWH.captureCapacityM3;

  // Actual runoff captured cannot exceed total available surface runoff
  const runoffCapturedM3 = Math.min(runoffVolumeM3, totalCapturePotentialM3);
  const uncapturedRunoffM3 = +(runoffVolumeM3 - runoffCapturedM3).toFixed(2);

  // Weighted average recharge efficiency across deployed structures
  let weightedEfficiency = 0.75;
  if (totalCapturePotentialM3 > 0) {
    const weightedSum =
      checkDams * INTERVENTION_SPECIFICATIONS.CHECK_DAM.captureCapacityM3 * INTERVENTION_SPECIFICATIONS.CHECK_DAM.rechargeEfficiency +
      percTanks * INTERVENTION_SPECIFICATIONS.PERCOLATION_TANK.captureCapacityM3 * INTERVENTION_SPECIFICATIONS.PERCOLATION_TANK.rechargeEfficiency +
      farmPonds * INTERVENTION_SPECIFICATIONS.FARM_POND.captureCapacityM3 * INTERVENTION_SPECIFICATIONS.FARM_POND.rechargeEfficiency +
      rwhUnits * INTERVENTION_SPECIFICATIONS.ROOFTOP_RWH.captureCapacityM3 * INTERVENTION_SPECIFICATIONS.ROOFTOP_RWH.rechargeEfficiency;
    weightedEfficiency = weightedSum / totalCapturePotentialM3;
  }

  const artificialRechargeM3 = +(runoffCapturedM3 * weightedEfficiency).toFixed(2);
  const totalRechargeM3 = +(naturalRechargeM3 + artificialRechargeM3).toFixed(2);

  return {
    naturalRechargeM3,
    soilMoistureRetainedM3,
    artificialRechargeM3,
    totalRechargeM3,
    runoffCapturedM3: +runoffCapturedM3.toFixed(2),
    uncapturedRunoffM3,
    interventionsSummary: {
      checkDams,
      percolationTanks: percTanks,
      farmPonds,
      rooftopRWHUnits: rwhUnits,
      captureCapacityM3: totalCapturePotentialM3,
      weightedEfficiency: +weightedEfficiency.toFixed(3)
    },
    assumptions: [
      `Natural recharge assumed at ${+(clampedPercolation * 100).toFixed(0)}% of surface infiltration.`,
      `Interventions captured ${+runoffCapturedM3.toFixed(1)} m³ of runoff (${totalCapturePotentialM3 > 0 ? +(runoffCapturedM3 / (runoffVolumeM3 || 1) * 100).toFixed(1) : 0}% of total runoff).`,
      `Total recharge delivers ${totalRechargeM3} m³ to the saturated aquifer.`
    ]
  };
}

export default {
  calculateRecharge,
  INTERVENTION_SPECIFICATIONS
};
