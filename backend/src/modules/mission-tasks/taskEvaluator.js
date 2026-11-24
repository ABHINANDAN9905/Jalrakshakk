/**
 * Mission Task Verification & Simulation Integration Engine
 * 
 * Evaluates whether a student's actions and actual Phase 7 simulation outputs
 * satisfy a mission task's objective criteria.
 * 
 * CRITICAL SECURITY RULE:
 * Never trust client-submitted success flags or XP amounts.
 * Verification strictly inspects server-side simulation math or verified quiz keys.
 */

export class TaskEvaluator {
  /**
   * Evaluates if a task's criteria are satisfied by the submission
   * 
   * @param {Object} task - MissionTask object { taskType, targetCriteria, xpReward }
   * @param {Object} submission - Data submitted by client (e.g. simulation run result, quiz answers)
   */
  static evaluate(task, submission = {}) {
    const { taskType, targetCriteria = {} } = task;

    switch (taskType) {
      case 'COMPLETE_SIMULATION': {
        // Requires a valid simulation run result
        if (!submission.waterBalance || !submission.simulationId) {
          return {
            passed: false,
            reason: 'Task requires executing a valid groundwater simulation run.'
          };
        }
        if (targetCriteria.scenarioId && submission.scenarioId !== targetCriteria.scenarioId) {
          return {
            passed: false,
            reason: `Simulation must be run under the '${targetCriteria.scenarioId}' scenario.`
          };
        }
        if (targetCriteria.minSustainabilityScore) {
          const score = submission.sustainability?.overallScore || 0;
          if (score < targetCriteria.minSustainabilityScore) {
            return {
              passed: false,
              reason: `Sustainability score (${score}) fell below the required threshold of ${targetCriteria.minSustainabilityScore}.`
            };
          }
        }
        return { passed: true, reason: 'Simulation completed successfully.' };
      }

      case 'ACHIEVE_STORAGE_THRESHOLD': {
        const percentage = submission.waterBalance?.storagePercentage ?? submission.storagePercentage;
        const target = targetCriteria.minStoragePercentage || 40.0;

        if (percentage === undefined || percentage === null) {
          return { passed: false, reason: 'Missing storage percentage data from simulation run.' };
        }
        if (percentage < target) {
          return {
            passed: false,
            reason: `Aquifer storage reached ${percentage}%, which is below the target ${target}%.`
          };
        }
        return {
          passed: true,
          reason: `Target storage achieved: ${percentage}% (Required: ≥ ${target}%).`
        };
      }

      case 'IMPROVE_SUSTAINABILITY_SCORE': {
        const score = submission.sustainability?.overallScore ?? submission.sustainabilityScore;
        const minScore = targetCriteria.minScore || 75;

        if (score === undefined || score === null) {
          return { passed: false, reason: 'Missing sustainability score from simulation run.' };
        }
        if (score < minScore) {
          return {
            passed: false,
            reason: `Sustainability score (${score}) did not reach the target benchmark of ${minScore}.`
          };
        }
        return {
          passed: true,
          reason: `Sustainability benchmark achieved: ${score}/100 (Target: ≥ ${minScore}).`
        };
      }

      case 'USE_DRIP_IRRIGATION': {
        const method = submission.sectors?.irrigationMethod || submission.irrigationMethod || '';
        const waterSaved = submission.sectors?.waterSavingsM3 || submission.waterSavingsM3 || 0;

        const isDrip = method.toUpperCase().includes('DRIP');
        if (!isDrip) {
          return {
            passed: false,
            reason: 'Task requires applying Drip / Micro-Irrigation to the agricultural area.'
          };
        }
        if (targetCriteria.minWaterSavingsM3 && waterSaved < targetCriteria.minWaterSavingsM3) {
          return {
            passed: false,
            reason: `Water saved (${waterSaved} m³) did not meet the required threshold of ${targetCriteria.minWaterSavingsM3} m³.`
          };
        }
        return {
          passed: true,
          reason: `Drip irrigation applied successfully, conserving ${waterSaved} m³ of groundwater.`
        };
      }

      case 'BUILD_CONSERVATION_STRUCTURE': {
        const artificialRecharge = submission.interventions?.artificialRechargeM3 ?? submission.artificialRechargeM3 ?? 0;
        const minRecharge = targetCriteria.minRechargeM3 || 5000;

        if (artificialRecharge < minRecharge) {
          return {
            passed: false,
            reason: `Artificial recharge (${artificialRecharge} m³) is below the requirement of ${minRecharge} m³.`
          };
        }
        return {
          passed: true,
          reason: `Conservation structures generated ${artificialRecharge} m³ of recharge.`
        };
      }

      case 'COMPLETE_WATER_QUALITY_CHALLENGE': {
        const wqi = submission.waterQuality?.finalWQI ?? submission.finalWQI;
        const targetWQI = targetCriteria.minWQI || 75.0;

        if (wqi === undefined || wqi === null) {
          return { passed: false, reason: 'Missing water quality index from simulation.' };
        }
        if (wqi < targetWQI) {
          return {
            passed: false,
            reason: `Water Quality Index (${wqi}) fell below the target of ${targetWQI}.`
          };
        }
        return {
          passed: true,
          reason: `Water Quality target achieved: ${wqi} (Target: ≥ ${targetWQI}).`
        };
      }

      case 'REDUCE_GROUNDWATER_EXTRACTION': {
        const extraction = submission.waterBalance?.extractionM3 ?? submission.totalExtractionM3;
        const maxLimit = targetCriteria.maxExtractionM3 || 150000;

        if (extraction === undefined || extraction === null) {
          return { passed: false, reason: 'Missing extraction data from simulation run.' };
        }
        if (extraction > maxLimit) {
          return {
            passed: false,
            reason: `Groundwater extraction (${extraction} m³) exceeded the maximum conservation cap of ${maxLimit} m³.`
          };
        }
        return {
          passed: true,
          reason: `Extraction restrained to ${extraction} m³ (Cap: ≤ ${maxLimit} m³).`
        };
      }

      case 'COMPLETE_QUIZ': {
        const submittedAnswers = submission.answers || {};
        const answerKey = targetCriteria.answerKey || {};
        let score = 0;
        const totalQuestions = Object.keys(answerKey).length;

        for (const [qId, correctAns] of Object.entries(answerKey)) {
          if (submittedAnswers[qId] === correctAns) {
            score++;
          }
        }

        const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
        const passThreshold = targetCriteria.passPercentage || 70.0;

        if (percentage < passThreshold) {
          return {
            passed: false,
            reason: `Quiz score was ${percentage.toFixed(0)}%, which is below the pass threshold of ${passThreshold}%.`
          };
        }
        return {
          passed: true,
          reason: `Quiz passed with ${percentage.toFixed(0)}% score (${score}/${totalQuestions} correct).`
        };
      }

      default:
        return { passed: false, reason: `Unknown task type: ${taskType}` };
    }
  }
}

export default TaskEvaluator;
