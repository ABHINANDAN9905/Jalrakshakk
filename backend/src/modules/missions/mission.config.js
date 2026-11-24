/**
 * Pre-configured Educational Missions & Sub-Task Blueprints
 */

export const DEFAULT_MISSIONS = [
  {
    id: 'm-101',
    title: 'Foundations of Groundwater Balance',
    description: 'Learn the primary water balance equation (Storage = Initial + Recharge - Extraction - Discharge) by running your first village simulation.',
    category: 'GROUNDWATER_CONSERVATION',
    difficulty: 'BEGINNER',
    xpReward: 200,
    estimatedDurationMinutes: 20,
    requiredLevel: 1,
    learningObjectives: [
      'Understand how precipitation partitions into runoff, infiltration, and evaporation.',
      'Calculate the difference between rainfall volume and deep aquifer recharge.',
      'Maintain village aquifer storage in a safe equilibrium condition.'
    ],
    instructions: 'Navigate to the simulation panel, select a village, and run a simulation keeping extraction balanced with natural recharge.',
    tasks: [
      {
        id: 't-101-1',
        title: 'Run a Baseline Village Simulation',
        description: 'Execute a single seasonal groundwater simulation step.',
        taskType: 'COMPLETE_SIMULATION',
        orderIndex: 1,
        xpReward: 100,
        targetCriteria: {
          minSustainabilityScore: 50
        }
      },
      {
        id: 't-101-2',
        title: 'Maintain Safe Aquifer Storage',
        description: 'Ensure aquifer storage remains above 40% of maximum capacity.',
        taskType: 'ACHIEVE_STORAGE_THRESHOLD',
        orderIndex: 2,
        xpReward: 100,
        targetCriteria: {
          minStoragePercentage: 40.0
        }
      }
    ]
  },
  {
    id: 'm-102',
    title: 'Monsoon Runoff & Rainwater Harvesting',
    description: 'Arrest rapid monsoon surface runoff by building check dams and percolation tanks to maximize deep recharge.',
    category: 'RAINWATER_HARVESTING',
    difficulty: 'INTERMEDIATE',
    xpReward: 300,
    estimatedDurationMinutes: 30,
    requiredLevel: 2,
    learningObjectives: [
      'Evaluate how check dams impede peak runoff in natural drainage lines.',
      'Quantify the volumetric contribution of community percolation tanks.',
      'Boost overall sustainability rating through watershed interventions.'
    ],
    instructions: 'Deploy at least 1 check dam or percolation tank in a monsoon simulation step and record positive artificial recharge.',
    tasks: [
      {
        id: 't-102-1',
        title: 'Construct Watershed Recharge Interventions',
        description: 'Capture and recharge at least 6,000 m³ of surface runoff.',
        taskType: 'BUILD_CONSERVATION_STRUCTURE',
        orderIndex: 1,
        xpReward: 150,
        targetCriteria: {
          minRechargeM3: 6000
        }
      },
      {
        id: 't-102-2',
        title: 'Attain High Sustainability Rating',
        description: 'Achieve an overall sustainability score of 75 or higher.',
        taskType: 'IMPROVE_SUSTAINABILITY_SCORE',
        orderIndex: 2,
        xpReward: 150,
        targetCriteria: {
          minScore: 75
        }
      }
    ]
  },
  {
    id: 'm-103',
    title: 'Precision Micro-Irrigation & Crop Diversification',
    description: 'Transition agriculture from traditional flood irrigation to precision drip irrigation while planting climate-smart pulses and millets.',
    category: 'SUSTAINABLE_AGRICULTURE',
    difficulty: 'INTERMEDIATE',
    xpReward: 350,
    estimatedDurationMinutes: 35,
    requiredLevel: 2,
    learningObjectives: [
      'Demonstrate how drip irrigation delivers up to 48% water savings.',
      'Understand the impact of cash crop duty vs climate-hardy millets.',
      'Cap agricultural draft to prevent seasonal water table decline.'
    ],
    instructions: 'Configure crop fields with millets/pulses and apply DRIP irrigation in the simulation setup.',
    tasks: [
      {
        id: 't-103-1',
        title: 'Deploy Drip Micro-Irrigation',
        description: 'Apply precision drip irrigation saving at least 15,000 m³ of water.',
        taskType: 'USE_DRIP_IRRIGATION',
        orderIndex: 1,
        xpReward: 175,
        targetCriteria: {
          minWaterSavingsM3: 15000
        }
      },
      {
        id: 't-103-2',
        title: 'Cap Agricultural Draft',
        description: 'Restrain total seasonal groundwater extraction to 120,000 m³ or less.',
        taskType: 'REDUCE_GROUNDWATER_EXTRACTION',
        orderIndex: 2,
        xpReward: 175,
        targetCriteria: {
          maxExtractionM3: 120000
        }
      }
    ]
  },
  {
    id: 'm-104',
    title: 'Aquifer Water Quality & Pollution Prevention',
    description: 'Protect village groundwater from agrochemical leaching and sewage contamination by promoting organic farming and soak-pit filtration.',
    category: 'WATER_QUALITY',
    difficulty: 'ADVANCED',
    xpReward: 400,
    estimatedDurationMinutes: 40,
    requiredLevel: 3,
    learningObjectives: [
      'Understand non-point source agrochemical pollution mechanics.',
      'Observe how dilution during high recharge mitigates pollutant concentration.',
      'Deploy bio-filters and managed soak pits to maintain potable groundwater.'
    ],
    instructions: 'Run a simulation using organic farming practices, low chemical intensity, and soak pits to maintain a WQI above 80.',
    tasks: [
      {
        id: 't-104-1',
        title: 'Achieve Pristine Water Quality Index',
        description: 'Maintain simulated Water Quality Index at 80.0 or higher.',
        taskType: 'COMPLETE_WATER_QUALITY_CHALLENGE',
        orderIndex: 1,
        xpReward: 200,
        targetCriteria: {
          minWQI: 80.0
        }
      },
      {
        id: 't-104-2',
        title: 'Hydrology & Pollution Prevention Quiz',
        description: 'Test your understanding of non-point source pollution and dilution dynamics.',
        taskType: 'COMPLETE_QUIZ',
        orderIndex: 2,
        xpReward: 200,
        targetCriteria: {
          passPercentage: 66,
          answerKey: {
            q1: 'ORGANIC_FARMING',
            q2: 'FRESH_RECHARGE_DILUTION',
            q3: 'DEEP_MINERAL_LEACHING'
          }
        }
      }
    ]
  },
  {
    id: 'm-105',
    title: 'Severe Drought Resilience & Crisis Management',
    description: 'Guide the village through a severe 60% monsoon deficit without allowing the aquifer to collapse into Critical state.',
    category: 'DROUGHT_MANAGEMENT',
    difficulty: 'ADVANCED',
    xpReward: 500,
    estimatedDurationMinutes: 45,
    requiredLevel: 4,
    learningObjectives: [
      'Formulate emergency water rationing protocols during monsoon failure.',
      'Prioritize domestic drinking water security over commercial crops.',
      'Prevent aquifer exhaustion to avoid dry dug wells and tanker dependency.'
    ],
    instructions: 'Select the DROUGHT_YEAR scenario, apply strict water conservation, and finish the simulation with storage above 20%.',
    tasks: [
      {
        id: 't-105-1',
        title: 'Execute Drought Stress Test',
        description: 'Run the DROUGHT_YEAR scenario simulation.',
        taskType: 'COMPLETE_SIMULATION',
        orderIndex: 1,
        xpReward: 250,
        targetCriteria: {
          scenarioId: 'DROUGHT_YEAR'
        }
      },
      {
        id: 't-105-2',
        title: 'Prevent Critical Aquifer Collapse',
        description: 'Maintain aquifer storage above 20% to avoid severe well drying.',
        taskType: 'ACHIEVE_STORAGE_THRESHOLD',
        orderIndex: 2,
        xpReward: 250,
        targetCriteria: {
          minStoragePercentage: 20.0
        }
      }
    ]
  }
];

export default {
  DEFAULT_MISSIONS
};
