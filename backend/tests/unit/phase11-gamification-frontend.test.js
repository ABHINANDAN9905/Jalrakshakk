import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TaskEvaluator } from '../../src/modules/mission-tasks/taskEvaluator.js';
import { calculateLevelFromXP, LEVEL_DEFINITIONS } from '../../src/modules/progression/progression.config.js';
import { DEFAULT_ACHIEVEMENTS } from '../../src/modules/achievements/achievement.config.js';
import { DEFAULT_MISSIONS } from '../../src/modules/missions/mission.config.js';
import { DEFAULT_CHALLENGES } from '../../src/modules/challenges/challenge.config.js';

describe('Phase 11: Frontend Gamification Integration & Evaluation Unit Tests', () => {
  describe('1. TaskEvaluator Server-Side Math Verification', () => {
    it('should pass COMPLETE_SIMULATION when valid simulation results and sustainability criteria are met', () => {
      const task = {
        taskType: 'COMPLETE_SIMULATION',
        targetCriteria: { minSustainabilityScore: 60 }
      };
      const submission = {
        simulationId: 'sim-test-001',
        waterBalance: { storagePercentage: 55 },
        sustainability: { overallScore: 75 }
      };

      const result = TaskEvaluator.evaluate(task, submission);
      assert.strictEqual(result.passed, true);
    });

    it('should reject COMPLETE_SIMULATION when simulation data or ID is missing', () => {
      const task = { taskType: 'COMPLETE_SIMULATION' };
      const submission = { clientDecidedSuccess: true };

      const result = TaskEvaluator.evaluate(task, submission);
      assert.strictEqual(result.passed, false);
      assert.match(result.reason, /valid groundwater simulation/);
    });

    it('should evaluate ACHIEVE_STORAGE_THRESHOLD against simulation water balance storage', () => {
      const task = {
        taskType: 'ACHIEVE_STORAGE_THRESHOLD',
        targetCriteria: { minStoragePercentage: 40.0 }
      };

      const failSubmission = { waterBalance: { storagePercentage: 28.5 } };
      const passSubmission = { waterBalance: { storagePercentage: 48.2 } };

      const failResult = TaskEvaluator.evaluate(task, failSubmission);
      assert.strictEqual(failResult.passed, false);

      const passResult = TaskEvaluator.evaluate(task, passSubmission);
      assert.strictEqual(passResult.passed, true);
    });

    it('should evaluate USE_DRIP_IRRIGATION requiring drip method and water savings', () => {
      const task = {
        taskType: 'USE_DRIP_IRRIGATION',
        targetCriteria: { minWaterSavingsM3: 10000 }
      };

      const floodSubmission = {
        sectors: { irrigationMethod: 'FLOOD', waterSavingsM3: 0 }
      };
      assert.strictEqual(TaskEvaluator.evaluate(task, floodSubmission).passed, false);

      const dripSubmission = {
        sectors: { irrigationMethod: 'DRIP', waterSavingsM3: 15400 }
      };
      assert.strictEqual(TaskEvaluator.evaluate(task, dripSubmission).passed, true);
    });

    it('should evaluate BUILD_CONSERVATION_STRUCTURE verifying artificial recharge volume', () => {
      const task = {
        taskType: 'BUILD_CONSERVATION_STRUCTURE',
        targetCriteria: { minRechargeM3: 6000 }
      };

      const lowRecharge = { interventions: { artificialRechargeM3: 4000 } };
      assert.strictEqual(TaskEvaluator.evaluate(task, lowRecharge).passed, false);

      const highRecharge = { interventions: { artificialRechargeM3: 8500 } };
      assert.strictEqual(TaskEvaluator.evaluate(task, highRecharge).passed, true);
    });

    it('should evaluate COMPLETE_QUIZ against verified answer key', () => {
      const task = {
        taskType: 'COMPLETE_QUIZ',
        targetCriteria: {
          passPercentage: 66,
          answerKey: {
            q1: 'ORGANIC_FARMING',
            q2: 'FRESH_RECHARGE_DILUTION',
            q3: 'DEEP_MINERAL_LEACHING'
          }
        }
      };

      const wrongSubmission = {
        answers: { q1: 'WRONG', q2: 'WRONG', q3: 'DEEP_MINERAL_LEACHING' }
      };
      assert.strictEqual(TaskEvaluator.evaluate(task, wrongSubmission).passed, false);

      const correctSubmission = {
        answers: {
          q1: 'ORGANIC_FARMING',
          q2: 'FRESH_RECHARGE_DILUTION',
          q3: 'DEEP_MINERAL_LEACHING'
        }
      };
      assert.strictEqual(TaskEvaluator.evaluate(task, correctSubmission).passed, true);
    });
  });

  describe('2. Authoritative XP Progression & Level Hierarchy', () => {
    it('should correctly calculate all 6 canonical level tiers', () => {
      assert.strictEqual(calculateLevelFromXP(0).currentLevel, 1);
      assert.strictEqual(calculateLevelFromXP(0).levelTitle, 'Water Explorer');

      assert.strictEqual(calculateLevelFromXP(500).currentLevel, 2);
      assert.strictEqual(calculateLevelFromXP(500).levelTitle, 'Water Guardian');

      assert.strictEqual(calculateLevelFromXP(1200).currentLevel, 3);
      assert.strictEqual(calculateLevelFromXP(1200).levelTitle, 'Aquifer Protector');

      assert.strictEqual(calculateLevelFromXP(2500).currentLevel, 4);
      assert.strictEqual(calculateLevelFromXP(2500).levelTitle, 'Conservation Champion');

      assert.strictEqual(calculateLevelFromXP(5000).currentLevel, 5);
      assert.strictEqual(calculateLevelFromXP(5000).levelTitle, 'Groundwater Hero');

      assert.strictEqual(calculateLevelFromXP(10000).currentLevel, 6);
      assert.strictEqual(calculateLevelFromXP(10000).levelTitle, 'JalRakshak Master');
    });

    it('should compute exact XP delta to next level', () => {
      const prog = calculateLevelFromXP(750);
      assert.strictEqual(prog.currentLevel, 2);
      assert.strictEqual(prog.nextLevel, 3);
      assert.strictEqual(prog.minXPForNextLevel, 1200);
      assert.strictEqual(prog.xpToNextLevel, 450);
    });
  });

  describe('3. Achievements & Catalog Integrity', () => {
    it('should include all 8 Phase 8 achievements with defined unlock conditions', () => {
      assert.strictEqual(DEFAULT_ACHIEVEMENTS.length, 8);
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

  describe('4. Missions & Quest Configurations', () => {
    it('should define structured default missions covering the 5 hydrological domains', () => {
      assert.ok(DEFAULT_MISSIONS.length >= 5);
      DEFAULT_MISSIONS.forEach((m) => {
        assert.ok(m.id);
        assert.ok(m.title);
        assert.ok(m.category);
        assert.ok(m.xpReward > 0);
        assert.ok(m.tasks.length > 0);
      });
    });

    it('should configure daily and weekly challenges', () => {
      assert.ok(DEFAULT_CHALLENGES.length >= 3);
      const daily = DEFAULT_CHALLENGES.filter((c) => c.challengeType === 'DAILY');
      const weekly = DEFAULT_CHALLENGES.filter((c) => c.challengeType === 'WEEKLY');

      assert.ok(daily.length >= 1);
      assert.ok(weekly.length >= 2);
    });
  });
});
