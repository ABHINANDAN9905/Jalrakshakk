import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AdminService } from '../../src/modules/admin/admin.service.js';

describe('Phase 13: Admin Dashboard & Platform Governance Unit Tests', () => {
  const adminActorId = '123e4567-e89b-12d3-a456-426614174099';
  const targetStudentId = '123e4567-e89b-12d3-a456-426614174000';
  const soleAdminId = '123e4567-e89b-12d3-a456-426614174099';

  describe('1. Platform Dashboard Statistics & KPI Metrics', () => {
    it('getDashboardStats should return comprehensive platform overview counts', async () => {
      const stats = await AdminService.getDashboardStats();

      assert.ok(stats);
      assert.ok(stats.overview);
      assert.strictEqual(typeof stats.overview.totalUsers, 'number');
      assert.strictEqual(typeof stats.overview.totalStudents, 'number');
      assert.strictEqual(typeof stats.overview.totalTeachers, 'number');
      assert.strictEqual(typeof stats.overview.totalAdmins, 'number');
      assert.strictEqual(typeof stats.overview.totalVillages, 'number');
      assert.strictEqual(typeof stats.overview.totalActiveUsers, 'number');
      assert.strictEqual(typeof stats.overview.totalMissions, 'number');
      assert.strictEqual(typeof stats.overview.totalSimulationRuns, 'number');
      assert.ok(Array.isArray(stats.registrationTrends));
      assert.ok(Array.isArray(stats.missionTrends));
      assert.ok(stats.systemStatus);
    });
  });

  describe('2. User Management & Privilege Safeguards', () => {
    it('getUsers should support pagination and role filtering', async () => {
      const result = await AdminService.getUsers({ role: 'STUDENT' }, 1, 10);

      assert.ok(result);
      assert.ok(Array.isArray(result.users));
      assert.strictEqual(typeof result.total, 'number');
      assert.strictEqual(result.page, 1);
      result.users.forEach((u) => {
        assert.strictEqual(u.role, 'STUDENT');
        assert.strictEqual(u.passwordHash, undefined);
        assert.strictEqual(u.password, undefined);
      });
    });

    it('updateUserStatus should successfully toggle non-admin account status', async () => {
      const updated = await AdminService.updateUserStatus(targetStudentId, false, adminActorId);
      assert.ok(updated);
      assert.strictEqual(updated.isActive, false);

      // Re-activate
      const reactivated = await AdminService.updateUserStatus(targetStudentId, true, adminActorId);
      assert.strictEqual(reactivated.isActive, true);
    });

    it('updateUserStatus should prevent deactivating the last remaining active administrator', async () => {
      await assert.rejects(
        async () => {
          await AdminService.updateUserStatus(soleAdminId, false, adminActorId);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /last remaining active administrator/i);
          return true;
        }
      );
    });

    it('updateUserRole should update non-admin user role', async () => {
      const updated = await AdminService.updateUserRole(targetStudentId, 'TEACHER', adminActorId);
      assert.ok(updated);
      assert.strictEqual(updated.role, 'TEACHER');

      // Revert back to STUDENT
      const reverted = await AdminService.updateUserRole(targetStudentId, 'STUDENT', adminActorId);
      assert.strictEqual(reverted.role, 'STUDENT');
    });

    it('updateUserRole should reject invalid roles', async () => {
      await assert.rejects(
        async () => {
          await AdminService.updateUserRole(targetStudentId, 'SUPERUSER', adminActorId);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          return true;
        }
      );
    });

    it('updateUserRole should prevent demoting the last remaining administrator', async () => {
      await assert.rejects(
        async () => {
          await AdminService.updateUserRole(soleAdminId, 'STUDENT', adminActorId);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.match(err.message, /last remaining administrator/i);
          return true;
        }
      );
    });
  });

  describe('3. Teacher Oversight & Relationship Tracking', () => {
    it('getTeachers should return teachers and accurately report assigned students', async () => {
      const result = await AdminService.getTeachers({}, 1, 10);

      assert.ok(result);
      assert.ok(Array.isArray(result.teachers));
      result.teachers.forEach((t) => {
        assert.strictEqual(t.role, 'TEACHER');
        assert.strictEqual(typeof t.assignedStudentsCount, 'number');
        assert.strictEqual(typeof t.isUnassigned, 'boolean');
      });
    });
  });

  describe('4. Village Modeling & Geographic Configuration', () => {
    it('createVillage should persist new village simulation environment', async () => {
      const newVillage = await AdminService.createVillage({
        name: 'Ganga Watershed Model',
        description: 'Alluvial deep aquifer testing scenario in northern plains.',
        region: 'Indo-Gangetic Basin',
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        population: 4500,
        latitude: 25.3176,
        longitude: 82.9739
      }, adminActorId);

      assert.ok(newVillage);
      assert.strictEqual(newVillage.name, 'Ganga Watershed Model');
      assert.strictEqual(newVillage.region, 'Indo-Gangetic Basin');
    });

    it('getVillages should list registered villages with member counts', async () => {
      const result = await AdminService.getVillages({}, 1, 10);

      assert.ok(result);
      assert.ok(Array.isArray(result.villages));
      assert.ok(result.villages.length > 0);
      result.villages.forEach((v) => {
        assert.ok(v.id);
        assert.ok(v.name);
        assert.strictEqual(typeof v.memberCount, 'number');
      });
    });
  });

  describe('5. Mission Curriculum Governance', () => {
    it('createMission should author new educational quest compatible with TaskEvaluator', async () => {
      const mission = await AdminService.createMission({
        title: 'Deep Saline Aquifer Remediation',
        description: 'Deploy advanced treatment and recharge wells to mitigate salinity intrusion.',
        category: 'WATER_QUALITY',
        difficulty: 'ADVANCED',
        xpReward: 500,
        requiredLevel: 4,
        tasks: [
          {
            title: 'Analyze Salinity Dispersion',
            description: 'Run simulation loop and observe chloride concentration.',
            taskType: 'COMPLETE_SIMULATION',
            xpReward: 200,
            orderIndex: 0
          }
        ]
      }, adminActorId);

      assert.ok(mission);
      assert.strictEqual(mission.title, 'Deep Saline Aquifer Remediation');
      assert.strictEqual(mission.xpReward, 500);
    });

    it('getMissions should return missions catalog with completion metrics', async () => {
      const result = await AdminService.getMissions({}, 1, 20);

      assert.ok(result);
      assert.ok(Array.isArray(result.missions));
      assert.ok(result.missions.length > 0);
    });
  });

  describe('6. Community Challenge Management', () => {
    it('createChallenge should configure time-bound event with verified end dates', async () => {
      const now = new Date();
      const end = new Date(Date.now() + 10 * 24 * 3600 * 1000);

      const challenge = await AdminService.createChallenge({
        title: 'Monsoon Rain Harvesting Blitz',
        description: 'Community-wide initiative to collect 100,000 m³ of peak storm runoff.',
        type: 'WEEKLY',
        startDate: now.toISOString(),
        endDate: end.toISOString(),
        xpReward: 300
      }, adminActorId);

      assert.ok(challenge);
      assert.strictEqual(challenge.title, 'Monsoon Rain Harvesting Blitz');
      assert.strictEqual(challenge.type, 'WEEKLY');
      assert.strictEqual(challenge.xpReward, 300);
    });

    it('getChallenges should list active challenges with participation counters', async () => {
      const challenges = await AdminService.getChallenges();

      assert.ok(Array.isArray(challenges));
      assert.ok(challenges.length > 0);
      challenges.forEach((c) => {
        assert.ok(c.title);
        assert.strictEqual(typeof c.participationCount, 'number');
      });
    });
  });

  describe('7. Platform Analytics Deep-Dive', () => {
    it('getPlatformAnalytics should return role, village, and progression distributions', async () => {
      const analytics = await AdminService.getPlatformAnalytics();

      assert.ok(analytics);
      assert.ok(Array.isArray(analytics.userRoleDistribution));
      assert.ok(Array.isArray(analytics.villageEngagement));
      assert.ok(Array.isArray(analytics.xpDistribution));
      assert.ok(Array.isArray(analytics.monthlyActivityGrowth));
    });
  });

  describe('8. System Health Diagnostics & Secret Redaction', () => {
    it('getSystemHealth should report statuses without exposing secrets or credentials', async () => {
      const health = await AdminService.getSystemHealth();

      assert.ok(health);
      assert.ok(health.services);
      assert.ok(health.services.backendApi);
      assert.strictEqual(health.services.backendApi.status, 'CONNECTED');
      assert.ok(health.services.postgresql);
      assert.ok(health.services.mongodb);
      assert.ok(health.services.socketIo);
      assert.ok(health.services.aiWaterMentor);

      // Verify ZERO credentials exposure
      const jsonString = JSON.stringify(health);
      assert.doesNotMatch(jsonString, /postgres:\/\//i);
      assert.doesNotMatch(jsonString, /mongodb(\+srv)?:\/\//i);
      assert.doesNotMatch(jsonString, /password|secret|jwt/i);
    });
  });
});
