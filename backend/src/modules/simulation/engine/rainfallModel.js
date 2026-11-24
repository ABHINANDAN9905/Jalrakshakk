/**
 * Rainfall and Precipitation Hydrological Model
 * 
 * Computes volumetric rainfall and partitions it into surface runoff,
 * soil infiltration, and initial evaporative losses based on soil hydrogeology
 * and terrain slope.
 * 
 * Mass Conservation: Runoff + Infiltration + Evaporation = 1.0 (No double counting)
 * 
 * NOTE: All values represent discrete pedagogical simulation mathematics
 * for educational exploration, not a real-world forecasting tool.
 */

export const SOIL_CHARACTERISTICS = {
  SANDY_LOAM: {
    name: 'Sandy Loam',
    runoffCoeff: 0.20,
    infiltrationCoeff: 0.55,
    evaporationCoeff: 0.25,
    description: 'High porosity, rapid infiltration, minimal surface runoff'
  },
  ALLUVIAL: {
    name: 'Alluvial Soil',
    runoffCoeff: 0.30,
    infiltrationCoeff: 0.45,
    evaporationCoeff: 0.25,
    description: 'Balanced agricultural soil common in river basins and floodplains'
  },
  BLACK_COTTON: {
    name: 'Black Cotton / Vertisol',
    runoffCoeff: 0.45,
    infiltrationCoeff: 0.25,
    evaporationCoeff: 0.30,
    description: 'High clay content, swells when wet, cracks when dry, high runoff'
  },
  HARD_ROCK: {
    name: 'Hard Rock / Weathered Basalt',
    runoffCoeff: 0.40,
    infiltrationCoeff: 0.35,
    evaporationCoeff: 0.25,
    description: 'Typical peninsular Indian terrain (Deccan Trap); limited infiltration'
  },
  CLAYEY: {
    name: 'Heavy Clay',
    runoffCoeff: 0.55,
    infiltrationCoeff: 0.20,
    evaporationCoeff: 0.25,
    description: 'Dense and low-permeability; significant surface runoff'
  }
};

export const SLOPE_MODIFIERS = {
  FLAT: { runoffMult: 0.85, infilMult: 1.15 },
  MODERATE: { runoffMult: 1.00, infilMult: 1.00 },
  STEEP: { runoffMult: 1.25, infilMult: 0.75 }
};

/**
 * Calculates rainfall volume and partition fractions.
 * 
 * @param {Object} params
 * @param {number} params.rainfallMm - Total rainfall depth in mm (>= 0)
 * @param {number} params.catchmentAreaM2 - Catchment surface area in m2 (> 0)
 * @param {string} [params.soilType='HARD_ROCK'] - Soil category
 * @param {string} [params.slope='MODERATE'] - Topographic slope ('FLAT', 'MODERATE', 'STEEP')
 */
export function calculateRainfallVolume({
  rainfallMm,
  catchmentAreaM2,
  soilType = 'HARD_ROCK',
  slope = 'MODERATE'
}) {
  if (rainfallMm < 0) {
    throw new Error('Rainfall in millimeters cannot be negative.');
  }
  if (!catchmentAreaM2 || catchmentAreaM2 <= 0) {
    throw new Error('Catchment area must be a positive number in square meters.');
  }

  const soil = SOIL_CHARACTERISTICS[soilType] || SOIL_CHARACTERISTICS.HARD_ROCK;
  const slopeMod = SLOPE_MODIFIERS[slope] || SLOPE_MODIFIERS.MODERATE;

  // 1. Total Precipitation Volume (m3) = Rainfall (mm) * Area (m2) / 1000
  const totalVolumeM3 = (rainfallMm * catchmentAreaM2) / 1000.0;

  // 2. Adjust coefficients for terrain slope
  let rawRunoff = soil.runoffCoeff * slopeMod.runoffMult;
  let rawInfil = soil.infiltrationCoeff * slopeMod.infilMult;
  let rawEvap = soil.evaporationCoeff;

  // Normalize to guarantee exact conservation of mass: C_runoff + C_infil + C_evap = 1.0
  const totalCoeff = rawRunoff + rawInfil + rawEvap;
  const runoffCoeff = +(rawRunoff / totalCoeff).toFixed(4);
  const infiltrationCoeff = +(rawInfil / totalCoeff).toFixed(4);
  const evaporationCoeff = +(1.0 - (runoffCoeff + infiltrationCoeff)).toFixed(4);

  // 3. Volumetric partitioning
  const runoffVolumeM3 = +(totalVolumeM3 * runoffCoeff).toFixed(2);
  const infiltrationVolumeM3 = +(totalVolumeM3 * infiltrationCoeff).toFixed(2);
  const evaporativeLossesM3 = +(totalVolumeM3 - (runoffVolumeM3 + infiltrationVolumeM3)).toFixed(2);

  return {
    rainfallMm,
    catchmentAreaM2,
    catchmentAreaHectares: +(catchmentAreaM2 / 10000.0).toFixed(2),
    totalVolumeM3: +totalVolumeM3.toFixed(2),
    runoffVolumeM3,
    infiltrationVolumeM3,
    evaporativeLossesM3,
    coefficients: {
      soilType: soil.name,
      slope,
      runoffCoeff,
      infiltrationCoeff,
      evaporationCoeff
    },
    assumptions: [
      `Rainfall depth of ${rainfallMm} mm over ${+(catchmentAreaM2 / 10000).toFixed(1)} hectares.`,
      `Mass balance strictly partitioned: ${+(runoffCoeff * 100).toFixed(1)}% runoff, ${+(infiltrationCoeff * 100).toFixed(1)}% infiltration, and ${+(evaporationCoeff * 100).toFixed(1)}% initial evaporative abstraction.`,
      'Precipitation volume is not recharge; only deep infiltration reaches the aquifer.'
    ]
  };
}

export default {
  calculateRainfallVolume,
  SOIL_CHARACTERISTICS,
  SLOPE_MODIFIERS
};
