/**
 * JalRakshak Groundwater Learning Insights Engine
 * 
 * Rule-based, scientifically explainable hydrological insights engine based on
 * Phase 7 simulation engine principles (water balance equation, recharge vs extraction,
 * irrigation efficiency, crop water demand, and conservation interventions).
 * 
 * DISCLAIMER: All outputs are educational simulation analytics. Not real-world hydrological forecasts.
 */

export const SIMULATION_DISCLAIMER = 'Simulated values generated for educational groundwater conservation gameplay. Model based on CGWB hydrological balance principles; not real-world sensor measurements or groundwater forecasts.';

/**
 * Classify aquifer condition based on storage saturation percentage and extraction/recharge ratio
 * @param {number} storagePercentage - 0 to 100%
 * @param {number} recharge - Inflow in m3
 * @param {number} extraction - Outflow in m3
 */
export function classifyAquiferCondition(storagePercentage, recharge, extraction) {
  const stageOfExtraction = recharge > 0 ? (extraction / recharge) * 100 : (extraction > 0 ? 200 : 0);

  if (storagePercentage < 20 || stageOfExtraction > 100) {
    return {
      category: 'OVER_EXPLOITED',
      label: 'Over-Exploited / Critical',
      description: 'Groundwater extraction exceeds annual replenishable recharge or aquifer storage is dangerously depleted (<20%).',
      severity: 'CRITICAL',
      color: 'rose'
    };
  }

  if (storagePercentage < 40 || stageOfExtraction > 90) {
    return {
      category: 'CRITICAL',
      label: 'Critical',
      description: 'Stage of groundwater development is between 90-100% or storage index is under 40%. Aquifer stress is significant.',
      severity: 'WARNING',
      color: 'amber'
    };
  }

  if (storagePercentage < 70 || stageOfExtraction > 70) {
    return {
      category: 'SEMI_CRITICAL',
      label: 'Semi-Critical',
      description: 'Stage of groundwater development is between 70-90%. Extraction is approaching annual recharge limits.',
      severity: 'MODERATE',
      color: 'yellow'
    };
  }

  if (storagePercentage >= 70 && stageOfExtraction <= 70) {
    return {
      category: 'SAFE',
      label: 'Safe & Sustainable',
      description: 'Stage of groundwater extraction is <= 70% and storage is abundant (>=70%). Aquifer has healthy resilience buffer.',
      severity: 'POSITIVE',
      color: 'emerald'
    };
  }

  return {
    category: 'SAFE',
    label: 'Safe',
    description: 'Groundwater draft is within sustainable limits of natural and artificial recharge.',
    severity: 'POSITIVE',
    color: 'emerald'
  };
}

/**
 * Analyze a single simulation run and produce rule-based hydrological insights
 * @param {Object} run - Simulation run data
 */
export function analyzeSimulationRun(run) {
  if (!run) return null;

  const initialStorage = run.initialStorage ?? 100000;
  const finalStorage = run.finalStorage ?? 105000;
  const rainfall = run.rainfall ?? 120;
  const recharge = run.recharge ?? 15000;
  const extraction = run.extraction ?? 12000;
  const losses = run.losses ?? 3000;
  const sustainabilityScore = run.sustainabilityScore ?? 75;

  const deltaStorage = +(finalStorage - initialStorage).toFixed(2);
  const netWaterBalance = +(recharge - (extraction + losses)).toFixed(2);
  const storagePercentage = initialStorage > 0 ? Math.min(100, Math.max(0, +((finalStorage / (initialStorage * 1.5)) * 100).toFixed(1))) : 50;

  const condition = classifyAquiferCondition(storagePercentage, recharge, extraction);

  const observations = [];
  const recommendations = [];

  // Observation 1: Storage Delta
  if (deltaStorage > 0) {
    observations.push({
      type: 'STORAGE_GAIN',
      title: 'Net Groundwater Storage Accretion',
      summary: `Aquifer storage expanded by +${deltaStorage.toLocaleString()} m³ (+${((deltaStorage / initialStorage) * 100).toFixed(1)}%).`,
      sentiment: 'POSITIVE',
      rule: 'Delta Storage (Final - Initial) > 0'
    });
  } else if (deltaStorage < 0) {
    observations.push({
      type: 'STORAGE_DEPLETION',
      title: 'Net Groundwater Storage Deficit',
      summary: `Aquifer storage contracted by ${deltaStorage.toLocaleString()} m³ (${((deltaStorage / initialStorage) * 100).toFixed(1)}%). Outflows exceeded inflows.`,
      sentiment: 'NEGATIVE',
      rule: 'Delta Storage (Final - Initial) < 0'
    });
    recommendations.push({
      action: 'REDUCE_EXTRACTION',
      priority: 'HIGH',
      suggestion: 'Deploy micro-irrigation (drip/sprinkler) or restrict deep borewell pumping to arrest storage depletion.'
    });
  } else {
    observations.push({
      type: 'STORAGE_STEADY',
      title: 'Equilibrium Aquifer State',
      summary: 'Aquifer volume remained in dynamic equilibrium where total recharge matched extraction and natural discharge.',
      sentiment: 'NEUTRAL',
      rule: 'Delta Storage == 0'
    });
  }

  // Observation 2: Recharge vs Extraction Balance
  const rechargeRatio = extraction > 0 ? +(recharge / extraction).toFixed(2) : 999;
  if (rechargeRatio >= 1.25) {
    observations.push({
      type: 'RECHARGE_SURPLUS',
      title: 'Strong Recharge Dominance',
      summary: `Recharge (${recharge.toLocaleString()} m³) was ${(rechargeRatio * 100).toFixed(0)}% of total extraction (${extraction.toLocaleString()} m³).`,
      sentiment: 'POSITIVE',
      rule: 'Recharge / Extraction >= 1.25'
    });
  } else if (rechargeRatio < 1.0) {
    observations.push({
      type: 'EXTRACTION_EXCESS',
      title: 'Over-Draft Detected',
      summary: `Extraction (${extraction.toLocaleString()} m³) surpassed total recharge (${recharge.toLocaleString()} m³) by ${((1 - rechargeRatio) * 100).toFixed(1)}%.`,
      sentiment: 'CRITICAL',
      rule: 'Recharge / Extraction < 1.0'
    });
    recommendations.push({
      action: 'EXPAND_RECHARGE_STRUCTURES',
      priority: 'CRITICAL',
      suggestion: 'Construct check dams, percolation tanks, and recharge shafts to capture surplus monsoon runoff.'
    });
  }

  // Observation 3: Sustainability Score Rating
  let sustainabilityTier = 'POOR';
  if (sustainabilityScore >= 80) sustainabilityTier = 'EXCELLENT';
  else if (sustainabilityScore >= 60) sustainabilityTier = 'GOOD';
  else if (sustainabilityScore >= 40) sustainabilityTier = 'MODERATE';

  return {
    runId: run.id || 'sim-current',
    villageId: run.villageId,
    createdAt: run.createdAt || new Date().toISOString(),
    isSimulated: true,
    modelDisclaimer: SIMULATION_DISCLAIMER,
    hydrologicalBalance: {
      initialStorageM3: initialStorage,
      finalStorageM3: finalStorage,
      deltaStorageM3: deltaStorage,
      rainfallMm: rainfall,
      rechargeM3: recharge,
      extractionM3: extraction,
      lossesM3: losses,
      netWaterBalanceM3: netWaterBalance,
      rechargeToExtractionRatio: rechargeRatio,
      estimatedStoragePercentage: storagePercentage
    },
    aquiferCondition: condition,
    sustainabilityScore,
    sustainabilityTier,
    observations,
    recommendations
  };
}

/**
 * Compare two simulation runs (e.g. baseline vs intervention) to measure impact
 * @param {Object} baselineRun - Baseline simulation run
 * @param {Object} interventionRun - Post-intervention simulation run
 */
export function compareSimulations(baselineRun, interventionRun) {
  if (!baselineRun || !interventionRun) return null;

  const baseAnalysis = analyzeSimulationRun(baselineRun);
  const interAnalysis = analyzeSimulationRun(interventionRun);

  const deltaScore = +(interAnalysis.sustainabilityScore - baseAnalysis.sustainabilityScore).toFixed(1);
  const deltaRecharge = +(interAnalysis.hydrologicalBalance.rechargeM3 - baseAnalysis.hydrologicalBalance.rechargeM3).toFixed(2);
  const deltaExtraction = +(interAnalysis.hydrologicalBalance.extractionM3 - baseAnalysis.hydrologicalBalance.extractionM3).toFixed(2);
  const deltaStorage = +(interAnalysis.hydrologicalBalance.finalStorageM3 - baseAnalysis.hydrologicalBalance.finalStorageM3).toFixed(2);
  
  const extractionReductionPct = baseAnalysis.hydrologicalBalance.extractionM3 > 0
    ? +(((baseAnalysis.hydrologicalBalance.extractionM3 - interAnalysis.hydrologicalBalance.extractionM3) / baseAnalysis.hydrologicalBalance.extractionM3) * 100).toFixed(1)
    : 0;

  const rechargeIncreasePct = baseAnalysis.hydrologicalBalance.rechargeM3 > 0
    ? +(((interAnalysis.hydrologicalBalance.rechargeM3 - baseAnalysis.hydrologicalBalance.rechargeM3) / baseAnalysis.hydrologicalBalance.rechargeM3) * 100).toFixed(1)
    : 0;

  const impactKeypoints = [];

  if (deltaScore > 0) {
    impactKeypoints.push(`Sustainability score advanced by +${deltaScore} points (from ${baseAnalysis.sustainabilityScore} to ${interAnalysis.sustainabilityScore}).`);
  }
  if (extractionReductionPct > 0) {
    impactKeypoints.push(`Irrigation/extraction draft reduced by ${extractionReductionPct}% via water-efficiency measures.`);
  }
  if (rechargeIncreasePct > 0) {
    impactKeypoints.push(`Aquifer recharge volume increased by +${rechargeIncreasePct}% (+${deltaRecharge.toLocaleString()} m³) through conservation structures.`);
  }
  if (deltaStorage > 0) {
    impactKeypoints.push(`Final groundwater storage improved by +${deltaStorage.toLocaleString()} m³ compared to baseline.`);
  }

  let overallVerdict = 'POSITIVE_IMPACT';
  if (deltaScore < 0 || deltaStorage < 0) {
    overallVerdict = 'NEGATIVE_IMPACT';
  } else if (deltaScore === 0 && deltaStorage === 0) {
    overallVerdict = 'NEUTRAL_IMPACT';
  }

  return {
    isSimulated: true,
    modelDisclaimer: SIMULATION_DISCLAIMER,
    baseline: baseAnalysis,
    intervention: interAnalysis,
    comparison: {
      deltaSustainabilityScore: deltaScore,
      deltaRechargeM3: deltaRecharge,
      deltaExtractionM3: deltaExtraction,
      deltaFinalStorageM3: deltaStorage,
      extractionReductionPercentage: extractionReductionPct,
      rechargeIncreasePercentage: rechargeIncreasePct,
      conditionTransition: {
        from: baseAnalysis.aquiferCondition.label,
        to: interAnalysis.aquiferCondition.label,
        improved: interAnalysis.aquiferCondition.severity !== 'CRITICAL' && baseAnalysis.aquiferCondition.severity === 'CRITICAL'
      },
      overallVerdict,
      impactKeypoints
    }
  };
}

/**
 * Generate student learning mastery and struggle observations based on mission & simulation history
 * @param {Array} missionProgress - List of completed/in-progress missions
 * @param {Array} simulationRuns - Student simulation runs
 * @param {Array} taskProgress - Individual mission task records
 */
export function generateStudentLearningInsights(missionProgress = [], simulationRuns = [], taskProgress = []) {
  const completedMissions = missionProgress.filter((m) => m.status === 'COMPLETED');
  const failedMissions = missionProgress.filter((m) => m.status === 'FAILED');
  const totalMissions = missionProgress.length;

  const strengths = [];
  const areasForGrowth = [];
  const milestones = [];

  // 1. Success rate analysis
  const successRate = totalMissions > 0 ? +((completedMissions.length / totalMissions) * 100).toFixed(1) : 0;
  if (successRate >= 80 && completedMissions.length >= 3) {
    strengths.push({
      category: 'EXECUTION',
      title: 'High Mission Proficiency',
      detail: `Student demonstrates consistent problem-solving with an ${successRate}% mission completion rate.`
    });
  } else if (successRate < 50 && totalMissions >= 3) {
    areasForGrowth.push({
      category: 'EXECUTION',
      title: 'Mission Difficulty Struggle',
      detail: 'Student has experienced repeated challenges completing advanced missions. Recommend reviewing foundational hydrological tutorials.'
    });
  }

  // 2. Category mastery analysis
  const categoryStats = {};
  completedMissions.forEach((mp) => {
    const cat = mp.mission?.category || 'GENERAL';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  if (categoryStats['RAINWATER_HARVESTING'] || categoryStats['GROUNDWATER_CONSERVATION']) {
    strengths.push({
      category: 'RAINWATER_HARVESTING',
      title: 'Conservation Structure Mastery',
      detail: 'Successfully planned and evaluated artificial recharge structures (check dams and percolation tanks).'
    });
  }

  if (categoryStats['IRRIGATION'] || categoryStats['IRRIGATION_EFFICIENCY'] || categoryStats['SUSTAINABLE_AGRICULTURE']) {
    strengths.push({
      category: 'IRRIGATION_EFFICIENCY',
      title: 'Agricultural Water Budgeting',
      detail: 'Demonstrates deep understanding of crop water requirements and micro-irrigation water savings.'
    });
  }

  // 3. Simulation run performance
  if (simulationRuns.length > 0) {
    const avgScore = +(simulationRuns.reduce((sum, r) => sum + (r.sustainabilityScore || 0), 0) / simulationRuns.length).toFixed(1);
    const positiveStorageRuns = simulationRuns.filter((r) => (r.finalStorage - r.initialStorage) >= 0).length;

    if (avgScore >= 75) {
      strengths.push({
        category: 'SIMULATION_SUSTAINABILITY',
        title: 'Sustainable Water Balance Management',
        detail: `Achieved an average sustainability score of ${avgScore}/100 across ${simulationRuns.length} simulation trials.`
      });
    } else if (avgScore < 50) {
      areasForGrowth.push({
        category: 'SIMULATION_SUSTAINABILITY',
        title: 'Aquifer Depletion Vulnerability',
        detail: `Average simulation score is ${avgScore}/100. Student frequently permits extraction to exceed natural recharge limits.`
      });
    }

    if (positiveStorageRuns === simulationRuns.length && simulationRuns.length >= 2) {
      milestones.push({
        id: 'AQUIFER_STEWARD',
        title: 'Zero Depletion Guardian',
        description: 'Maintained non-negative aquifer storage across all simulation experiments.',
        achievedAt: simulationRuns[simulationRuns.length - 1].createdAt
      });
    }
  } else {
    areasForGrowth.push({
      category: 'SIMULATION_ENGAGEMENT',
      title: 'Limited Simulation Trials',
      detail: 'Student has not yet completed interactive village water balance simulations. Practical experimentation is encouraged.'
    });
  }

  // 4. Milestone synthesis
  if (completedMissions.length >= 1) {
    milestones.push({
      id: 'FIRST_MISSION',
      title: 'First Water Mission Mastered',
      description: 'Completed initial educational hydrological conservation mission.',
      achievedAt: completedMissions[0].completedAt || completedMissions[0].createdAt
    });
  }
  if (completedMissions.length >= 5) {
    milestones.push({
      id: 'SENIOR_RAKSHAK',
      title: 'Hydrology Strategist',
      description: 'Successfully resolved 5+ groundwater challenges across multiple curriculum domains.',
      achievedAt: completedMissions[4].completedAt || completedMissions[4].createdAt
    });
  }

  return {
    isSimulated: true,
    modelDisclaimer: SIMULATION_DISCLAIMER,
    strengths,
    areasForGrowth,
    milestones,
    metrics: {
      totalMissionsAttempted: totalMissions,
      totalMissionsCompleted: completedMissions.length,
      missionSuccessRate: successRate,
      totalSimulationRuns: simulationRuns.length
    }
  };
}
