import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyAquiferCondition,
  analyzeSimulationRun,
  compareSimulations,
  generateStudentLearningInsights,
  SIMULATION_DISCLAIMER
} from '../../src/modules/analytics/insightsEngine.js';
import { ReportingEngine } from '../../src/modules/analytics/reportingEngine.js';
import { AnalyticsService } from '../../src/modules/analytics/analytics.service.js';

describe('Phase 14: Analytics, Learning Insights & Reporting Unit Tests', () => {
  const studentUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@jalrakshak.org',
    role: 'STUDENT'
  };

  const otherStudentUser = {
    id: '123e4567-e89b-12d3-a456-426614174099',
    name: 'Random Student',
    email: 'random@jalrakshak.org',
    role: 'STUDENT'
  };

  const teacherUser = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Priya Sharma (Teacher)',
    email: 'teacher@jalrakshak.org',
    role: 'TEACHER'
  };

  const adminUser = {
    id: '123e4567-e89b-12d3-a456-426614174099',
    name: 'System Admin',
    email: 'admin@jalrakshak.org',
    role: 'ADMIN'
  };

  describe('1. Groundwater Learning Insights Engine', () => {
    it('classifyAquiferCondition should categorize severely depleted aquifer as OVER_EXPLOITED / CRITICAL', () => {
      const result = classifyAquiferCondition(15, 10000, 18000);
      assert.strictEqual(result.category, 'OVER_EXPLOITED');
      assert.strictEqual(result.severity, 'CRITICAL');
    });

    it('classifyAquiferCondition should categorize balanced aquifer as SAFE & SUSTAINABLE', () => {
      const result = classifyAquiferCondition(80, 20000, 10000);
      assert.strictEqual(result.category, 'SAFE');
      assert.strictEqual(result.severity, 'POSITIVE');
    });

    it('analyzeSimulationRun should produce explainable water balance metrics & observations', () => {
      const run = {
        id: 'sim-test-1',
        villageId: 'v-1',
        initialStorage: 100000,
        finalStorage: 110000,
        rainfall: 150,
        recharge: 25000,
        extraction: 12000,
        losses: 3000,
        sustainabilityScore: 85
      };

      const analysis = analyzeSimulationRun(run);
      assert.ok(analysis);
      assert.strictEqual(analysis.isSimulated, true);
      assert.strictEqual(typeof analysis.modelDisclaimer, 'string');
      assert.strictEqual(analysis.hydrologicalBalance.deltaStorageM3, 10000);
      assert.ok(analysis.observations.length > 0);
      assert.strictEqual(analysis.observations[0].type, 'STORAGE_GAIN');
      assert.strictEqual(analysis.sustainabilityTier, 'EXCELLENT');
    });

    it('compareSimulations should calculate delta impacts between baseline and intervention runs', () => {
      const baseline = {
        id: 'sim-base',
        initialStorage: 100000,
        finalStorage: 88000,
        rainfall: 100,
        recharge: 10000,
        extraction: 20000,
        losses: 2000,
        sustainabilityScore: 45
      };

      const intervention = {
        id: 'sim-interv',
        initialStorage: 100000,
        finalStorage: 108000,
        rainfall: 100,
        recharge: 22000,
        extraction: 12000,
        losses: 2000,
        sustainabilityScore: 85
      };

      const comparison = compareSimulations(baseline, intervention);
      assert.ok(comparison);
      assert.strictEqual(comparison.isSimulated, true);
      assert.strictEqual(comparison.comparison.deltaSustainabilityScore, 40);
      assert.strictEqual(comparison.comparison.extractionReductionPercentage, 40);
      assert.strictEqual(comparison.comparison.rechargeIncreasePercentage, 120);
      assert.strictEqual(comparison.comparison.overallVerdict, 'POSITIVE_IMPACT');
      assert.ok(comparison.comparison.impactKeypoints.length >= 2);
    });

    it('generateStudentLearningInsights should formulate strengths, growth areas, and milestones', () => {
      const missions = [
        { status: 'COMPLETED', completedAt: new Date().toISOString(), mission: { category: 'RAINWATER_HARVESTING' } },
        { status: 'COMPLETED', completedAt: new Date().toISOString(), mission: { category: 'IRRIGATION_EFFICIENCY' } },
        { status: 'COMPLETED', completedAt: new Date().toISOString(), mission: { category: 'GROUNDWATER_CONSERVATION' } }
      ];
      const runs = [
        { initialStorage: 100000, finalStorage: 105000, sustainabilityScore: 82, createdAt: new Date().toISOString() },
        { initialStorage: 105000, finalStorage: 110000, sustainabilityScore: 88, createdAt: new Date().toISOString() }
      ];

      const insights = generateStudentLearningInsights(missions, runs, []);
      assert.ok(insights);
      assert.strictEqual(insights.isSimulated, true);
      assert.strictEqual(insights.metrics.totalMissionsCompleted, 3);
      assert.strictEqual(insights.metrics.missionSuccessRate, 100);
      assert.ok(insights.strengths.some((s) => s.category === 'EXECUTION'));
      assert.ok(insights.milestones.length >= 2);
    });
  });

  describe('2. Multi-Format Reporting Engine', () => {
    it('ReportingEngine.generateStudentProgressReport should return RFC 4180 CSV with disclaimer header', () => {
      const csv = ReportingEngine.generateStudentProgressReport({
        student: { id: 's-1', name: 'Aarav Sharma', email: 'aarav@jalrakshak.org' },
        xp: { totalXP: 1450, currentLevel: 3, levelTitle: 'Aquifer Protector' },
        missions: [
          { id: 'm-1', title: 'Survey Alluvial Aquifer', status: 'COMPLETED', score: 150 }
        ],
        simulations: [
          { id: 'sim-1', rainfall: 120, recharge: 15000, extraction: 10000, initialStorage: 100000, finalStorage: 105000, sustainabilityScore: 85 }
        ]
      }, 'csv');

      assert.ok(csv.includes('# Disclaimer:'));
      assert.ok(csv.includes('Aarav Sharma'));
      assert.ok(csv.includes('Survey Alluvial Aquifer'));
      assert.ok(csv.includes('Level 3 (Aquifer Protector)'));
    });

    it('ReportingEngine.generateStudentProgressReport should return printable HTML view with disclaimer badge', () => {
      const html = ReportingEngine.generateStudentProgressReport({
        student: { id: 's-1', name: 'Aarav Sharma', email: 'aarav@jalrakshak.org' },
        xp: { totalXP: 1450, currentLevel: 3, levelTitle: 'Aquifer Protector' },
        missions: [],
        simulations: []
      }, 'html');

      assert.ok(html.includes('<!DOCTYPE html>'));
      assert.ok(html.includes('EDUCATIONAL SIMULATION NOTICE'));
      assert.ok(html.includes('Aarav Sharma'));
      assert.ok(html.includes('1,450'));
    });

    it('ReportingEngine.generateTeacherClassroomReport should output structured CSV roster', () => {
      const csv = ReportingEngine.generateTeacherClassroomReport({
        teacher: { name: 'Priya Sharma' },
        students: [
          { id: 's-1', name: 'Aarav Sharma', email: 'aarav@jalrakshak.org', currentLevel: 3, levelTitle: 'Aquifer Protector', totalXP: 1450, completedMissionsCount: 3, achievementsCount: 4, isActive: true }
        ],
        stats: { totalClassXP: 1450, completionRate: '85%' }
      }, 'csv');

      assert.ok(csv.includes('Student ID,Student Name,Email,Level,Rank Title,Total XP'));
      assert.ok(csv.includes('Aarav Sharma'));
      assert.ok(csv.includes('Aquifer Protector'));
    });

    it('ReportingEngine.generateGroundwaterSimulationReport should output water balance table', () => {
      const csv = ReportingEngine.generateGroundwaterSimulationReport({
        village: { name: 'Kisanpur' },
        simulationRuns: [
          { id: 'sim-100', villageId: 'v-1', initialStorage: 100000, finalStorage: 108000, rainfall: 150, recharge: 22000, extraction: 12000, losses: 2000, sustainabilityScore: 86, createdAt: '2026-03-01' }
        ]
      }, 'csv');

      assert.ok(csv.includes('Initial Storage (m3),Final Storage (m3),Delta (m3)'));
      assert.ok(csv.includes('Kisanpur'));
      assert.ok(csv.includes('8000'));
    });
  });

  describe('3. Analytics Service & Authorization Enforcement', () => {
    it('getStudentAnalytics should return progression, category mastery, and simulation history', async () => {
      const result = await AnalyticsService.getStudentAnalytics(studentUser.id, {}, studentUser);

      assert.ok(result);
      assert.strictEqual(result.isSimulated, true);
      assert.strictEqual(result.student.id, studentUser.id);
      assert.strictEqual(typeof result.progression.totalXP, 'number');
      assert.ok(Array.isArray(result.categoryMastery));
      assert.ok(Array.isArray(result.xpGrowthTimeline));
      assert.ok(result.learningInsights);
    });

    it('getStudentAnalytics should forbid student from accessing another student data', async () => {
      await assert.rejects(
        async () => {
          await AnalyticsService.getStudentAnalytics(otherStudentUser.id, {}, studentUser);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          assert.match(err.message, /Students can only view their own/i);
          return true;
        }
      );
    });

    it('getStudentAnalytics should permit teacher to access supervised student data', async () => {
      const result = await AnalyticsService.getStudentAnalytics(studentUser.id, {}, teacherUser);
      assert.ok(result);
      assert.strictEqual(result.student.id, studentUser.id);
    });

    it('getStudentAnalytics should permit admin to access any student data', async () => {
      const result = await AnalyticsService.getStudentAnalytics(studentUser.id, {}, adminUser);
      assert.ok(result);
      assert.strictEqual(result.student.id, studentUser.id);
    });

    it('getTeacherClassroomAnalytics should return classroom overview, level distribution, and support alerts', async () => {
      const result = await AnalyticsService.getTeacherClassroomAnalytics(teacherUser.id, {});

      assert.ok(result);
      assert.strictEqual(result.isSimulated, true);
      assert.ok(result.classroomOverview);
      assert.strictEqual(typeof result.classroomOverview.totalStudents, 'number');
      assert.ok(Array.isArray(result.levelDistribution));
      assert.ok(Array.isArray(result.studentsRequiringSupport));
      assert.ok(Array.isArray(result.frequentlyFailedTasks));
    });

    it('getAdminPlatformAnalytics should return system-wide totals and engagement trends', async () => {
      const result = await AnalyticsService.getAdminPlatformAnalytics({});

      assert.ok(result);
      assert.strictEqual(result.isSimulated, true);
      assert.ok(result.overview);
      assert.strictEqual(typeof result.overview.totalUsers, 'number');
      assert.ok(Array.isArray(result.userRoleDistribution));
      assert.ok(Array.isArray(result.monthlyActivityGrowth));
    });

    it('generateReport should enforce role permissions for TEACHER_CLASSROOM and ADMIN_PLATFORM', async () => {
      await assert.rejects(
        async () => {
          await AnalyticsService.generateReport('TEACHER_CLASSROOM', {}, studentUser);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );

      await assert.rejects(
        async () => {
          await AnalyticsService.generateReport('ADMIN_PLATFORM', {}, teacherUser);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );
    });
  });
});
