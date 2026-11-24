import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { calculateLevelFromXP, LEVEL_DEFINITIONS } from '../../src/modules/progression/progression.config.js';
import { TaskEvaluator } from '../../src/modules/mission-tasks/taskEvaluator.js';
import { DEFAULT_ACHIEVEMENTS } from '../../src/modules/achievements/achievement.config.js';
import { DEFAULT_MISSIONS } from '../../src/modules/missions/mission.config.js';
import { DEFAULT_CHALLENGES } from '../../src/modules/challenges/challenge.config.js';

describe('Phase 8: Gamification & Educational Progression Unit Tests', () => {

  describe('1. XP and Level Progression Calculations', () => {
    it('should map 0 XP to Level 1 Water Explorer', () => {
      const p = calculateLevelFromXP(0);
      assert.equal(p.currentLevel, 1);
      assert.equal(p.levelTitle, 'Water Explorer');
      assert.equal(p.nextLevel, 2);
      assert.equal(p.xpToNextLevel, 500);
      assert.equal(p.progressPercentage, 0);
    });

    it('should map 500 XP to Level 2 Water Guardian with exact threshold', () => {
      const p = calculateLevelFromXP(500);
      assert.equal(p.currentLevel, 2);
      assert.equal(p.levelTitle, 'Water Guardian');
      assert.equal(p.nextLevel, 3);
      assert.equal(p.xpToNextLevel, 700); // 1200 - 500 = 700
      assert.equal(p.progressPercentage, 0);
    });

    it('should map intermediate XP accurately with percentage progression', () => {
      // 850 XP is between Level 2 (500) and Level 3 (1200)
      // Progress = (850 - 500) / (1200 - 500) = 350 / 700 = 50%
      const p = calculateLevelFromXP(850);
      assert.equal(p.currentLevel, 2);
      assert.equal(p.progressPercentage, 50.0);
      assert.equal(p.xpToNextLevel, 350);
    });

    it('should map 10,000+ XP to maximum Level 6 JalRakshak Master', () => {
      const p = calculateLevelFromXP(12500);
      assert.equal(p.currentLevel, 6);
      assert.equal(p.levelTitle, 'JalRakshak Master');
      assert.equal(p.nextLevel, null);
      assert.equal(p.xpToNextLevel, 0);
      assert.equal(p.progressPercentage, 100);
    });
  });

  describe('2. Mission Task Evaluator & Phase 7 Simulation Integration', () => {
    it('COMPLETE_SIMULATION should pass with valid simulation run', () => {
      const task = {
        taskType: 'COMPLETE_SIMULATION',
        targetCriteria: { minSustainabilityScore: 60 }
      };
      const validSubmission = {
        simulationId: 'sim-123',
        waterBalance: { storagePercentage: 55 },
        sustainability: { overallScore: 78 }
      };

      const evalResult = TaskEvaluator.evaluate(task, validSubmission);
      assert.equal(evalResult.passed, true);
    });

    it('COMPLETE_SIMULATION should reject when sustainability score is below target', () => {
      const task = {
        taskType: 'COMPLETE_SIMULATION',
        targetCriteria: { minSustainabilityScore: 70 }
      };
      const weakSubmission = {
        simulationId: 'sim-123',
        waterBalance: { storagePercentage: 35 },
        sustainability: { overallScore: 52 }
      };

      const evalResult = TaskEvaluator.evaluate(task, weakSubmission);
      assert.equal(evalResult.passed, false);
      assert.ok(evalResult.reason.includes('fell below the required threshold'));
    });

    it('ACHIEVE_STORAGE_THRESHOLD should evaluate storage percentage against target', () => {
      const task = {
        taskType: 'ACHIEVE_STORAGE_THRESHOLD',
        targetCriteria: { minStoragePercentage: 45.0 }
      };

      assert.equal(TaskEvaluator.evaluate(task, { waterBalance: { storagePercentage: 52.0 } }).passed, true);
      assert.equal(TaskEvaluator.evaluate(task, { waterBalance: { storagePercentage: 38.0 } }).passed, false);
    });

    it('USE_DRIP_IRRIGATION should verify drip irrigation method and water savings', () => {
      const task = {
        taskType: 'USE_DRIP_IRRIGATION',
        targetCriteria: { minWaterSavingsM3: 10000 }
      };

      // Drip with sufficient savings
      const passSubmission = {
        sectors: {
          irrigationMethod: 'Drip / Micro-Irrigation',
          waterSavingsM3: 18000
        }
      };
      assert.equal(TaskEvaluator.evaluate(task, passSubmission).passed, true);

      // Flood irrigation fails
      const floodSubmission = {
        sectors: {
          irrigationMethod: 'Traditional Flood Irrigation',
          waterSavingsM3: 0
        }
      };
      assert.equal(TaskEvaluator.evaluate(task, floodSubmission).passed, false);
    });

    it('BUILD_CONSERVATION_STRUCTURE should verify artificial recharge threshold', () => {
      const task = {
        taskType: 'BUILD_CONSERVATION_STRUCTURE',
        targetCriteria: { minRechargeM3: 6000 }
      };

      assert.equal(TaskEvaluator.evaluate(task, { interventions: { artificialRechargeM3: 8500 } }).passed, true);
      assert.equal(TaskEvaluator.evaluate(task, { interventions: { artificialRechargeM3: 3000 } }).passed, false);
    });

    it('COMPLETE_WATER_QUALITY_CHALLENGE should verify simulated WQI', () => {
      const task = {
        taskType: 'COMPLETE_WATER_QUALITY_CHALLENGE',
        targetCriteria: { minWQI: 80.0 }
      };

      assert.equal(TaskEvaluator.evaluate(task, { waterQuality: { finalWQI: 84.5 } }).passed, true);
      assert.equal(TaskEvaluator.evaluate(task, { waterQuality: { finalWQI: 72.0 } }).passed, false);
    });

    it('REDUCE_GROUNDWATER_EXTRACTION should verify extraction is restrained under cap', () => {
      const task = {
        taskType: 'REDUCE_GROUNDWATER_EXTRACTION',
        targetCriteria: { maxExtractionM3: 100000 }
      };

      assert.equal(TaskEvaluator.evaluate(task, { waterBalance: { extractionM3: 85000 } }).passed, true);
      assert.equal(TaskEvaluator.evaluate(task, { waterBalance: { extractionM3: 135000 } }).passed, false);
    });

    it('COMPLETE_QUIZ should verify answer key and calculate pass threshold', () => {
      const task = {
        taskType: 'COMPLETE_QUIZ',
        targetCriteria: {
          passPercentage: 66,
          answerKey: { q1: 'A', q2: 'B', q3: 'C' }
        }
      };

      // 2/3 = 66.6% -> Pass
      assert.equal(TaskEvaluator.evaluate(task, { answers: { q1: 'A', q2: 'B', q3: 'WRONG' } }).passed, true);

      // 1/3 = 33.3% -> Fail
      assert.equal(TaskEvaluator.evaluate(task, { answers: { q1: 'A', q2: 'WRONG', q3: 'WRONG' } }).passed, false);
    });
  });

  describe('3. Achievements Configuration & Catalog', () => {
    it('should configure at least 8 distinct achievements', () => {
      assert.ok(DEFAULT_ACHIEVEMENTS.length >= 8);
      const codes = DEFAULT_ACHIEVEMENTS.map((a) => a.code);
      assert.ok(codes.includes('FIRST_MISSION'));
      assert.ok(codes.includes('WATER_SAVER'));
      assert.ok(codes.includes('RAIN_HARVESTER'));
      assert.ok(codes.includes('DRIP_CHAMPION'));
      assert.ok(codes.includes('AQUIFER_GUARDIAN'));
      assert.ok(codes.includes('CLEAN_WATER_HERO'));
      assert.ok(codes.includes('DROUGHT_SURVIVOR'));
      assert.ok(codes.includes('CONSERVATION_MASTER'));
    });
  });

  describe('4. Educational Missions & Category Coverage', () => {
    it('should configure structured default missions covering groundwater domains', () => {
      assert.ok(DEFAULT_MISSIONS.length >= 5);
      for (const mission of DEFAULT_MISSIONS) {
        assert.ok(mission.title);
        assert.ok(mission.category);
        assert.ok(mission.xpReward > 0);
        assert.ok(mission.tasks.length >= 2);
        for (const task of mission.tasks) {
          assert.ok(task.taskType);
          assert.ok(task.xpReward > 0);
        }
      }
    });
  });

  describe('5. Daily and Weekly Challenges', () => {
    it('should configure both DAILY and WEEKLY challenge types with criteria', () => {
      assert.ok(DEFAULT_CHALLENGES.some((c) => c.challengeType === 'DAILY'));
      assert.ok(DEFAULT_CHALLENGES.some((c) => c.challengeType === 'WEEKLY'));
      for (const challenge of DEFAULT_CHALLENGES) {
        assert.ok(challenge.xpReward > 0);
        assert.ok(challenge.criteria);
      }
    });
  });

});
