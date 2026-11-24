/**
 * Comprehensive Groundwater Sustainability Scoring Model
 * 
 * Provides an objective, transparent, educational rating (0 to 100)
 * composed of 5 weighted hydrogeological and management pillars:
 * 
 * 1. Aquifer Health Condition (30 points)
 * 2. Recharge-to-Extraction Ratio (25 points)
 * 3. Irrigation Water Efficiency (20 points)
 * 4. Conservation Interventions (15 points)
 * 5. Water Quality Condition (10 points)
 */

/**
 * Computes transparent sustainability score and educational feedback.
 * 
 * @param {Object} params
 * @param {number} params.storagePercentage - Aquifer saturation percentage (0-100)
 * @param {number} params.rechargeM3 - Total recharge volume
 * @param {number} params.extractionM3 - Total extraction volume
 * @param {string} params.irrigationMethod - 'FLOOD', 'SPRINKLER', or 'DRIP'
 * @param {number} params.waterSavingsM3 - Water saved via efficient techniques
 * @param {number} params.artificialRechargeM3 - Recharge gained via interventions
 * @param {number} params.waterQualityIndex - Ending simulated WQI (0-100)
 */
export function calculateSustainabilityScore({
  storagePercentage = 50,
  rechargeM3 = 0,
  extractionM3 = 0,
  irrigationMethod = 'FLOOD',
  waterSavingsM3 = 0,
  artificialRechargeM3 = 0,
  waterQualityIndex = 75
}) {
  const explanations = [];
  const recommendations = [];

  // 1. Pillar 1: Aquifer Health Condition (Max 30 pts)
  let aquiferHealthScore = 0;
  if (storagePercentage >= 50 && storagePercentage <= 85) {
    aquiferHealthScore = 30;
    explanations.push(`Aquifer storage is in ideal equilibrium (${storagePercentage}% of capacity).`);
  } else if (storagePercentage > 85) {
    aquiferHealthScore = 27; // Slightly penalizes overflowing water logging risk
    explanations.push(`Aquifer is near full saturation (${storagePercentage}%). High water table.`);
  } else if (storagePercentage >= 35) {
    aquiferHealthScore = 20;
    explanations.push(`Aquifer storage is moderate (${storagePercentage}%). Vigilance required.`);
    recommendations.push('Augment artificial recharge structures to build storage buffer.');
  } else if (storagePercentage >= 20) {
    aquiferHealthScore = 10;
    explanations.push(`Aquifer storage is semi-critical (${storagePercentage}%). Wells at risk.`);
    recommendations.push('Implement immediate extraction curbs and promote crop diversification.');
  } else {
    aquiferHealthScore = 2;
    explanations.push(`Aquifer storage is critical (${storagePercentage}%). Severe depletion hazard.`);
    recommendations.push('Emergency conservation: halt high-water cash crop cultivation immediately.');
  }

  // 2. Pillar 2: Recharge-to-Extraction Balance (Max 25 pts)
  let rechargeBalanceScore = 0;
  const ratio = extractionM3 > 0 ? rechargeM3 / extractionM3 : 2.0;

  if (ratio >= 1.2) {
    rechargeBalanceScore = 25;
    explanations.push(`Positive recharge balance: Recharge exceeds extraction by ${+((ratio - 1) * 100).toFixed(0)}%.`);
  } else if (ratio >= 1.0) {
    rechargeBalanceScore = 22;
    explanations.push('Balanced groundwater budget: Recharge safely meets total seasonal draft.');
  } else if (ratio >= 0.75) {
    rechargeBalanceScore = 15;
    explanations.push(`Mild overdraft: Extraction exceeds recharge by ${+((1 - ratio) * 100).toFixed(0)}%.`);
    recommendations.push('Shift a portion of summer acreage to drought-hardy pulses or millets.');
  } else if (ratio >= 0.50) {
    rechargeBalanceScore = 8;
    explanations.push(`Significant overdraft: Drawing down ${+((1 - ratio) * 100).toFixed(0)}% more than replenished.`);
    recommendations.push('Transition from flood irrigation to drip or sprinkler systems.');
  } else {
    rechargeBalanceScore = 2;
    explanations.push(`Severe overdraft: Extraction is more than double total recharge.`);
    recommendations.push('Adopt strict water budgeting and mandatory village groundwater quotas.');
  }

  // 3. Pillar 3: Irrigation Efficiency (Max 20 pts)
  let irrigationScore = 6;
  if (irrigationMethod === 'DRIP') {
    irrigationScore = 20;
    explanations.push(`Drip micro-irrigation applied: High precision root-zone delivery saved ${waterSavingsM3} m³.`);
  } else if (irrigationMethod === 'SPRINKLER') {
    irrigationScore = 14;
    explanations.push(`Sprinkler irrigation applied: Mitigated conveyance losses, saving ${waterSavingsM3} m³.`);
  } else {
    irrigationScore = 6;
    explanations.push('Traditional flood irrigation used: Substantial water lost to conveyance and evaporation.');
    recommendations.push('Adopt micro-irrigation (drip/sprinkler) to reduce agricultural draft by up to 48%.');
  }

  // 4. Pillar 4: Conservation Interventions (Max 15 pts)
  let conservationScore = 0;
  if (artificialRechargeM3 > 30000) {
    conservationScore = 15;
    explanations.push(`Exceptional watershed harvesting: Interventions captured and recharged ${artificialRechargeM3} m³.`);
  } else if (artificialRechargeM3 > 10000) {
    conservationScore = 11;
    explanations.push(`Effective watershed harvesting: Interventions recharged ${artificialRechargeM3} m³.`);
  } else if (artificialRechargeM3 > 0) {
    conservationScore = 7;
    explanations.push(`Basic conservation in place: Interventions contributed ${artificialRechargeM3} m³.`);
    recommendations.push('Construct community percolation tanks to capture excess monsoon runoff.');
  } else {
    conservationScore = 2;
    explanations.push('No artificial recharge structures deployed; monsoon runoff leaves the catchment unutilized.');
    recommendations.push('Build masonry check dams along drainage lines to arrest peak runoff.');
  }

  // 5. Pillar 5: Water Quality Condition (Max 10 pts)
  let qualityScore = +(Math.min(10, Math.max(0, (waterQualityIndex / 100) * 10))).toFixed(1);
  if (waterQualityIndex >= 80) {
    explanations.push(`High water quality index (${waterQualityIndex}/100). Minimal agrochemical pollution.`);
  } else if (waterQualityIndex < 50) {
    explanations.push(`Degraded water quality (${waterQualityIndex}/100). Contamination risk present.`);
    recommendations.push('Adopt organic bio-pesticides and village soak-pit wastewater management.');
  }

  // Overall Score Calculation (Clamped 0 to 100)
  const rawTotal = aquiferHealthScore + rechargeBalanceScore + irrigationScore + conservationScore + qualityScore;
  const overallScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  return {
    overallScore,
    factorScores: {
      aquiferHealth: aquiferHealthScore,
      rechargeBalance: rechargeBalanceScore,
      irrigationEfficiency: irrigationScore,
      conservationInterventions: conservationScore,
      waterQuality: qualityScore
    },
    metricsSummary: {
      storagePercentage,
      rechargeToExtractionRatio: +ratio.toFixed(2),
      waterSavingsM3,
      artificialRechargeM3,
      waterQualityIndex
    },
    explanations,
    recommendations
  };
}

export default {
  calculateSustainabilityScore
};
