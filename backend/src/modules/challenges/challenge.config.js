/**
 * Daily and Weekly Challenge Blueprints
 */

export const DEFAULT_CHALLENGES = [
  {
    id: 'ch-daily-1',
    title: 'Daily Drip Master',
    description: 'Execute a village simulation with drip micro-irrigation saving at least 10,000 m³ of water.',
    challengeType: 'DAILY',
    xpReward: 150,
    criteria: {
      requireDrip: true,
      minWaterSavingsM3: 10000
    },
    durationDays: 1
  },
  {
    id: 'ch-weekly-1',
    title: 'Weekly Watershed Builder',
    description: 'Deploy check dams and percolation tanks to generate at least 15,000 m³ of artificial groundwater recharge.',
    challengeType: 'WEEKLY',
    xpReward: 300,
    criteria: {
      minArtificialRechargeM3: 15000
    },
    durationDays: 7
  },
  {
    id: 'ch-weekly-2',
    title: 'Pure Water Steward',
    description: 'Maintain simulated village Water Quality Index at 82 or above in any simulation run.',
    challengeType: 'WEEKLY',
    xpReward: 250,
    criteria: {
      minWQI: 82.0
    },
    durationDays: 7
  }
];

export default {
  DEFAULT_CHALLENGES
};
