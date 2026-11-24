/**
 * Groundwater Extraction Model
 * 
 * Computes agricultural, domestic, and optional industrial water extraction (draft).
 * Accurately models crop water requirements, irrigation methods (flood vs. micro-irrigation),
 * and domestic per-capita consumption.
 */

export const CROP_WATER_REQUIREMENTS = {
  // Volume in m3 per hectare per agricultural season (~90-120 days)
  SUGARCANE: {
    name: 'Sugarcane',
    waterRequirementM3PerHa: 18000,
    category: 'Water-Intensive Cash Crop',
    typicalSeasons: ['Monsoon', 'Post-Monsoon', 'Winter', 'Summer']
  },
  PADDY: {
    name: 'Paddy Rice',
    waterRequirementM3PerHa: 12000,
    category: 'Water-Intensive Cereal',
    typicalSeasons: ['Monsoon', 'Summer']
  },
  WHEAT: {
    name: 'Wheat',
    waterRequirementM3PerHa: 4500,
    category: 'Moderate Cereal',
    typicalSeasons: ['Winter']
  },
  VEGETABLES: {
    name: 'Vegetables & Horticulture',
    waterRequirementM3PerHa: 3800,
    category: 'High-Value Horticultural',
    typicalSeasons: ['Winter', 'Summer']
  },
  PULSES: {
    name: 'Pulses (Gram / Lentil / Pigeonpea)',
    waterRequirementM3PerHa: 2200,
    category: 'Low-Water Legume',
    typicalSeasons: ['Post-Monsoon', 'Winter']
  },
  MILLETS: {
    name: 'Millets (Jowar / Bajra / Ragi)',
    waterRequirementM3PerHa: 1800,
    category: 'Climate-Resilient Low-Water Crop',
    typicalSeasons: ['Monsoon', 'Summer']
  }
};

export const IRRIGATION_EFFICIENCIES = {
  FLOOD: {
    name: 'Traditional Flood Irrigation',
    fieldEfficiency: 0.45,
    savingsFactor: 0.00, // baseline
    description: 'Significant conveyance and deep percolation/evaporation losses in unlined channels'
  },
  SPRINKLER: {
    name: 'Sprinkler Irrigation',
    fieldEfficiency: 0.75,
    savingsFactor: 0.30, // 30% water savings compared to flood
    description: 'Pressurized overhead spray; mitigates furrow conveyance loss'
  },
  DRIP: {
    name: 'Drip / Micro-Irrigation',
    fieldEfficiency: 0.90,
    savingsFactor: 0.48, // 48% water savings compared to flood
    description: 'Precision root-zone delivery; minimal evaporation and weed transpiration'
  }
};

/**
 * Calculates total groundwater extraction across sectors.
 * 
 * @param {Object} params
 * @param {Array<{ crop: string, hectares: number }>} [params.crops=[]]
 * @param {string} [params.irrigationMethod='FLOOD'] - 'FLOOD', 'SPRINKLER', or 'DRIP'
 * @param {number} [params.population=4000] - Village population
 * @param {number} [params.perCapitaLpcd=55] - Liters per capita per day (55 LPCD is Jal Jeevan Mission norm)
 * @param {number} [params.simulationDays=90] - Days simulated in this step/season
 * @param {number} [params.industrialExtractionM3=0] - Non-agricultural commercial/industrial draft
 */
export function calculateExtraction({
  crops = [],
  irrigationMethod = 'FLOOD',
  population = 4000,
  perCapitaLpcd = 55,
  simulationDays = 90,
  industrialExtractionM3 = 0
}) {
  const method = IRRIGATION_EFFICIENCIES[irrigationMethod] || IRRIGATION_EFFICIENCIES.FLOOD;
  const days = Math.max(1, simulationDays);
  const pop = Math.max(0, population);
  const lpcd = Math.max(20, perCapitaLpcd);

  // 1. Agricultural Extraction Calculation
  let baselineAgriM3 = 0;
  const cropBreakdown = [];

  for (const item of crops) {
    const cropKey = (item.crop || '').toUpperCase();
    const spec = CROP_WATER_REQUIREMENTS[cropKey] || CROP_WATER_REQUIREMENTS.MILLETS;
    const hectares = Math.max(0, parseFloat(item.hectares || 0));

    // Base seasonal water needed in m3
    const cropBaselineM3 = hectares * spec.waterRequirementM3PerHa;
    const actualCropM3 = cropBaselineM3 * (1.0 - method.savingsFactor);

    baselineAgriM3 += cropBaselineM3;
    cropBreakdown.push({
      crop: spec.name,
      category: spec.category,
      hectares: +hectares.toFixed(2),
      waterRequirementM3PerHa: spec.waterRequirementM3PerHa,
      baselineDemandM3: +cropBaselineM3.toFixed(2),
      actualExtractionM3: +actualCropM3.toFixed(2)
    });
  }

  const agriculturalExtractionM3 = +(baselineAgriM3 * (1.0 - method.savingsFactor)).toFixed(2);
  const waterSavingsM3 = +(baselineAgriM3 * method.savingsFactor).toFixed(2);

  // 2. Domestic Extraction Calculation
  // Daily liters = Population * LPCD -> Convert to m3: Liters / 1000
  // Seasonal m3 = Daily m3 * simulationDays
  const domesticExtractionM3 = +((pop * lpcd * days) / 1000.0).toFixed(2);

  // 3. Industrial / Commercial
  const industrialDraftM3 = Math.max(0, +parseFloat(industrialExtractionM3 || 0).toFixed(2));

  // 4. Total Groundwater Draft
  const totalExtractionM3 = +(agriculturalExtractionM3 + domesticExtractionM3 + industrialDraftM3).toFixed(2);

  return {
    agriculturalExtractionM3,
    domesticExtractionM3,
    industrialExtractionM3: industrialDraftM3,
    totalExtractionM3,
    waterSavingsM3,
    irrigationMethod: method.name,
    savingsPercentage: +(method.savingsFactor * 100).toFixed(1),
    cropBreakdown,
    demographics: {
      population: pop,
      perCapitaLpcd: lpcd,
      simulationDays: days
    },
    assumptions: [
      `Agricultural draft: ${agriculturalExtractionM3} m³ across ${cropBreakdown.reduce((sum, c) => sum + c.hectares, 0).toFixed(1)} ha using ${method.name}.`,
      `Efficiency savings: ${waterSavingsM3} m³ saved via ${method.name}.`,
      `Domestic consumption: ${domesticExtractionM3} m³ (${pop} residents @ ${lpcd} LPCD over ${days} days).`,
      `Total seasonal draft: ${totalExtractionM3} m³.`
    ]
  };
}

export default {
  calculateExtraction,
  CROP_WATER_REQUIREMENTS,
  IRRIGATION_EFFICIENCIES
};
