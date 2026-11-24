/**
 * Achievement Definitions & Criteria Blueprint
 */

export const DEFAULT_ACHIEVEMENTS = [
  {
    code: 'FIRST_MISSION',
    name: 'Water Pioneer',
    description: 'Complete your first groundwater conservation mission.',
    iconIdentifier: 'award',
    xpReward: 100,
    unlockCondition: { type: 'COMPLETED_MISSIONS_COUNT', minCount: 1 }
  },
  {
    code: 'WATER_SAVER',
    name: 'Efficiency Champion',
    description: 'Save 20,000 m³ or more through water conservation practices.',
    iconIdentifier: 'droplet',
    xpReward: 150,
    unlockCondition: { type: 'WATER_SAVINGS_M3', minSavingsM3: 20000 }
  },
  {
    code: 'RAIN_HARVESTER',
    name: 'Monsoon Collector',
    description: 'Deploy rainwater harvesting or check dam structures to capture runoff.',
    iconIdentifier: 'cloud-rain',
    xpReward: 150,
    unlockCondition: { type: 'ARTIFICIAL_RECHARGE_M3', minRechargeM3: 10000 }
  },
  {
    code: 'DRIP_CHAMPION',
    name: 'Precision Irrigator',
    description: 'Complete an agricultural challenge using drip micro-irrigation.',
    iconIdentifier: 'gauge',
    xpReward: 200,
    unlockCondition: { type: 'IRRIGATION_METHOD', method: 'DRIP' }
  },
  {
    code: 'AQUIFER_GUARDIAN',
    name: 'Sustained Water Table',
    description: 'Maintain village aquifer storage at 50% or above while fulfilling extraction demands.',
    iconIdentifier: 'shield-check',
    xpReward: 250,
    unlockCondition: { type: 'STORAGE_PERCENTAGE', minPercentage: 50 }
  },
  {
    code: 'CLEAN_WATER_HERO',
    name: 'Pure Hydrology',
    description: 'Attain an educational Water Quality Index above 80 in a pollution challenge.',
    iconIdentifier: 'sparkles',
    xpReward: 200,
    unlockCondition: { type: 'WATER_QUALITY_INDEX', minWQI: 80 }
  },
  {
    code: 'DROUGHT_SURVIVOR',
    name: 'Crisis Manager',
    description: 'Complete a severe drought year simulation without aquifer exhaustion.',
    iconIdentifier: 'sun',
    xpReward: 300,
    unlockCondition: { type: 'DROUGHT_SURVIVAL', survived: true }
  },
  {
    code: 'CONSERVATION_MASTER',
    name: 'Master Hydrologist',
    description: 'Complete 5 or more educational conservation missions across all categories.',
    iconIdentifier: 'crown',
    xpReward: 500,
    unlockCondition: { type: 'COMPLETED_MISSIONS_COUNT', minCount: 5 }
  }
];

export default {
  DEFAULT_ACHIEVEMENTS
};
