/**
 * Educational Scenario Engine
 * 
 * Provides 6 pre-configured, pedagogically structured simulation scenarios
 * representing distinct groundwater management and hydrological challenges in rural India.
 */

export const SIMULATION_SCENARIOS = [
  {
    id: 'NORMAL_MONSOON',
    name: 'Normal Monsoon Equilibrium',
    season: 'Monsoon',
    difficulty: 'BEGINNER',
    description: 'A standard Indian agricultural season with average monsoon precipitation and mixed cropping.',
    learningObjectives: [
      'Understand the fundamental groundwater balance equation (Storage = Initial + Recharge - Extraction - Discharge).',
      'Distinguish between total precipitation volume and actual aquifer recharge.',
      'Observe seasonal equilibrium in semi-arid hard rock aquifers.'
    ],
    initialConditions: {
      catchmentAreaM2: 5000000, // 500 hectares
      soilType: 'HARD_ROCK',
      slope: 'MODERATE',
      rainfallMm: 750,
      initialStorageM3: 450000,
      maxCapacityM3: 1000000,
      population: 4000,
      perCapitaLpcd: 55,
      simulationDays: 90,
      crops: [
        { crop: 'WHEAT', hectares: 40 },
        { crop: 'PULSES', hectares: 30 },
        { crop: 'VEGETABLES', hectares: 15 }
      ],
      irrigationMethod: 'FLOOD',
      interventions: {
        checkDamsCount: 1,
        percolationTanksCount: 0,
        farmPondsCount: 2,
        rooftopRWHUnits: 5
      },
      initialWQI: 78,
      chemicalIntensity: 'MODERATE',
      wastewaterManagement: 'PARTIAL',
      organicFarming: false,
      bioFiltersActive: false
    }
  },
  {
    id: 'DROUGHT_YEAR',
    name: 'Severe Drought Year Stress Test',
    season: 'Monsoon',
    difficulty: 'INTERMEDIATE',
    description: 'Monsoon failure with a 60% rainfall deficit tests the village resilience against severe groundwater depletion.',
    learningObjectives: [
      'Experience how low rainfall impacts natural infiltration and surface runoff.',
      'Observe rapid drawdown when extraction demand remains unadjusted during a drought.',
      'Formulate emergency water rationing strategies to avoid reaching Critical status.'
    ],
    initialConditions: {
      catchmentAreaM2: 5000000,
      soilType: 'HARD_ROCK',
      slope: 'MODERATE',
      rainfallMm: 280, // Severe deficit
      initialStorageM3: 350000,
      maxCapacityM3: 1000000,
      population: 4200,
      perCapitaLpcd: 55,
      simulationDays: 90,
      crops: [
        { crop: 'WHEAT', hectares: 45 },
        { crop: 'PULSES', hectares: 20 },
        { crop: 'SUGARCANE', hectares: 10 }
      ],
      irrigationMethod: 'FLOOD',
      interventions: {
        checkDamsCount: 1,
        percolationTanksCount: 0,
        farmPondsCount: 1,
        rooftopRWHUnits: 0
      },
      initialWQI: 70,
      chemicalIntensity: 'MODERATE',
      wastewaterManagement: 'PARTIAL',
      organicFarming: false,
      bioFiltersActive: false
    }
  },
  {
    id: 'EXCESSIVE_EXTRACTION',
    name: 'Cash Crop Overdraft & Aquifer Depletion',
    season: 'Winter',
    difficulty: 'INTERMEDIATE',
    description: 'High cash crop market prices led farmers to plant water-thirsty sugarcane and paddy with flood irrigation.',
    learningObjectives: [
      'Understand how uncontrolled agricultural extraction triggers water table collapse despite normal rainfall.',
      'Analyze the economic temptation of water-intensive cash crops vs. long-term resource exhaustion.',
      'Observe deep drawdown and resulting geogenic mineral concentration.'
    ],
    initialConditions: {
      catchmentAreaM2: 5000000,
      soilType: 'ALLUVIAL',
      slope: 'FLAT',
      rainfallMm: 680,
      initialStorageM3: 550000,
      maxCapacityM3: 1000000,
      population: 4500,
      perCapitaLpcd: 60,
      simulationDays: 90,
      crops: [
        { crop: 'SUGARCANE', hectares: 60 },
        { crop: 'PADDY', hectares: 40 },
        { crop: 'WHEAT', hectares: 20 }
      ],
      irrigationMethod: 'FLOOD',
      interventions: {
        checkDamsCount: 0,
        percolationTanksCount: 0,
        farmPondsCount: 0,
        rooftopRWHUnits: 0
      },
      initialWQI: 74,
      chemicalIntensity: 'HIGH',
      wastewaterManagement: 'UNTREATED',
      organicFarming: false,
      bioFiltersActive: false
    }
  },
  {
    id: 'SUSTAINABLE_FARMING',
    name: 'Climate-Smart Micro-Irrigation & Crop Diversification',
    season: 'Post-Monsoon',
    difficulty: 'ADVANCED',
    description: 'A progressive farming cooperative adopts low-water millets, pulses, drip irrigation, and organic practices.',
    learningObjectives: [
      'Evaluate how precision drip irrigation cuts agricultural extraction by almost 50%.',
      'Demonstrate how climate-resilient crops (millets/pulses) maintain rural livelihoods without depleting aquifers.',
      'Achieve top-tier sustainability scores through combined water-saving interventions.'
    ],
    initialConditions: {
      catchmentAreaM2: 5000000,
      soilType: 'BLACK_COTTON',
      slope: 'MODERATE',
      rainfallMm: 520,
      initialStorageM3: 400000,
      maxCapacityM3: 1000000,
      population: 4000,
      perCapitaLpcd: 55,
      simulationDays: 90,
      crops: [
        { crop: 'MILLETS', hectares: 50 },
        { crop: 'PULSES', hectares: 35 },
        { crop: 'VEGETABLES', hectares: 15 }
      ],
      irrigationMethod: 'DRIP',
      interventions: {
        checkDamsCount: 2,
        percolationTanksCount: 1,
        farmPondsCount: 3,
        rooftopRWHUnits: 20
      },
      initialWQI: 82,
      chemicalIntensity: 'LOW',
      wastewaterManagement: 'SOAK_PITS',
      organicFarming: true,
      bioFiltersActive: true
    }
  },
  {
    id: 'RAINWATER_HARVESTING',
    name: 'Community Watershed & Artificial Recharge Champions',
    season: 'Monsoon',
    difficulty: 'ADVANCED',
    description: 'A village constructs a comprehensive network of check dams, percolation tanks, and rooftop harvesting units.',
    learningObjectives: [
      'Quantify the volume of surface runoff arrested and recharged into the ground.',
      'Observe how artificial recharge structures buffer against rainfall variability.',
      'Understand community watershed governance inspired by successful Indian case studies (e.g. Hiware Bazar, Ralegan Siddhi).'
    ],
    initialConditions: {
      catchmentAreaM2: 5000000,
      soilType: 'HARD_ROCK',
      slope: 'MODERATE',
      rainfallMm: 620,
      initialStorageM3: 350000,
      maxCapacityM3: 1000000,
      population: 3800,
      perCapitaLpcd: 55,
      simulationDays: 90,
      crops: [
        { crop: 'WHEAT', hectares: 35 },
        { crop: 'PULSES', hectares: 30 },
        { crop: 'VEGETABLES', hectares: 10 }
      ],
      irrigationMethod: 'SPRINKLER',
      interventions: {
        checkDamsCount: 4,
        percolationTanksCount: 2,
        farmPondsCount: 6,
        rooftopRWHUnits: 40
      },
      initialWQI: 80,
      chemicalIntensity: 'LOW',
      wastewaterManagement: 'SOAK_PITS',
      organicFarming: false,
      bioFiltersActive: false
    }
  },
  {
    id: 'POLLUTION_CRISIS',
    name: 'Agrochemical Contamination & Groundwater Quality Crisis',
    season: 'Summer',
    difficulty: 'ADVANCED',
    description: 'Heavy chemical pesticide leaching and unmanaged village sewage degrade groundwater potability.',
    learningObjectives: [
      'Understand that groundwater security is fundamentally dual: volume availability AND chemical purity.',
      'Observe how pollutant concentration rises during low-storage summer periods.',
      'Implement bio-remediation, organic transition, and wastewater management to restore water quality.'
    ],
    initialConditions: {
      catchmentAreaM2: 5000000,
      soilType: 'ALLUVIAL',
      slope: 'FLAT',
      rainfallMm: 720,
      initialStorageM3: 450000,
      maxCapacityM3: 1000000,
      population: 4800,
      perCapitaLpcd: 60,
      simulationDays: 90,
      crops: [
        { crop: 'PADDY', hectares: 45 },
        { crop: 'VEGETABLES', hectares: 25 },
        { crop: 'WHEAT', hectares: 20 }
      ],
      irrigationMethod: 'FLOOD',
      interventions: {
        checkDamsCount: 1,
        percolationTanksCount: 0,
        farmPondsCount: 0,
        rooftopRWHUnits: 0
      },
      initialWQI: 65,
      chemicalIntensity: 'HIGH',
      wastewaterManagement: 'UNTREATED',
      organicFarming: false,
      bioFiltersActive: false
    }
  }
];

export function getScenarioList() {
  return SIMULATION_SCENARIOS.map((s) => ({
    id: s.id,
    name: s.name,
    season: s.season,
    difficulty: s.difficulty,
    description: s.description,
    learningObjectives: s.learningObjectives
  }));
}

export function getScenarioById(scenarioId) {
  const scenario = SIMULATION_SCENARIOS.find(
    (s) => s.id.toUpperCase() === (scenarioId || '').toUpperCase()
  );
  if (!scenario) {
    const error = new Error(`Simulation scenario '${scenarioId}' not found.`);
    error.statusCode = 404;
    throw error;
  }
  return scenario;
}

export default {
  SIMULATION_SCENARIOS,
  getScenarioList,
  getScenarioById
};
