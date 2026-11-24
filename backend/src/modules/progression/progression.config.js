/**
 * Gamification Progression Configuration & Level Hierarchy
 * 
 * Configurable XP thresholds, titles, and perks for student learning progression.
 */

export const LEVEL_DEFINITIONS = [
  {
    level: 1,
    title: 'Water Explorer',
    minXP: 0,
    perks: 'Access to beginner village simulations and introductory watershed missions.'
  },
  {
    level: 2,
    title: 'Water Guardian',
    minXP: 500,
    perks: 'Unlock rainwater harvesting structures and basic crop water budgeting.'
  },
  {
    level: 3,
    title: 'Aquifer Protector',
    minXP: 1200,
    perks: 'Unlock micro-irrigation tools (sprinklers/drip) and intermediate scenarios.'
  },
  {
    level: 4,
    title: 'Conservation Champion',
    minXP: 2500,
    perks: 'Unlock community percolation tanks and water quality bio-filter challenges.'
  },
  {
    level: 5,
    title: 'Groundwater Hero',
    minXP: 5000,
    perks: 'Unlock advanced drought management missions and classroom leadership quests.'
  },
  {
    level: 6,
    title: 'JalRakshak Master',
    minXP: 10000,
    perks: 'Master hydrological governance, custom scenario modeling, and mentor badge.'
  }
];

/**
 * Calculates current level and progression metadata based on total XP.
 * @param {number} totalXP 
 */
export function calculateLevelFromXP(totalXP = 0) {
  const xp = Math.max(0, parseInt(totalXP || 0, 10));
  let currentTier = LEVEL_DEFINITIONS[0];

  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_DEFINITIONS[i].minXP) {
      currentTier = LEVEL_DEFINITIONS[i];
      break;
    }
  }

  const nextTier = LEVEL_DEFINITIONS.find((tier) => tier.level === currentTier.level + 1) || null;
  const xpToNextLevel = nextTier ? nextTier.minXP - xp : 0;
  const progressInLevel = nextTier
    ? +(((xp - currentTier.minXP) / (nextTier.minXP - currentTier.minXP)) * 100).toFixed(1)
    : 100.0;

  return {
    currentLevel: currentTier.level,
    levelTitle: currentTier.title,
    currentXP: xp,
    minXPForCurrentLevel: currentTier.minXP,
    nextLevel: nextTier ? nextTier.level : null,
    nextLevelTitle: nextTier ? nextTier.title : null,
    minXPForNextLevel: nextTier ? nextTier.minXP : null,
    xpToNextLevel,
    progressPercentage: progressInLevel,
    perks: currentTier.perks
  };
}

export default {
  LEVEL_DEFINITIONS,
  calculateLevelFromXP
};
