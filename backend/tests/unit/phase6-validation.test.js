import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createVillageSchema, updateVillageSchema, villageQuerySchema } from '../../src/modules/villages/village.validation.js';
import { updateUserStatusSchema, updateUserRoleSchema, userQuerySchema } from '../../src/modules/users/user.validation.js';
import { teacherStudentParamsSchema, teacherOnlyParamsSchema } from '../../src/modules/teacher-students/teacherStudent.validation.js';

describe('Phase 6 Validation Schemas Unit Tests', () => {

  describe('Village Validation Schemas', () => {
    it('createVillageSchema should accept valid village data', () => {
      const valid = {
        name: 'Khed Shivapur',
        description: 'A drought-prone agricultural village in Western Maharashtra',
        region: 'Western Ghats',
        district: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        population: 4500,
        latitude: 18.356,
        longitude: 73.856
      };

      const parsed = createVillageSchema.parse(valid);
      assert.equal(parsed.name, 'Khed Shivapur');
      assert.equal(parsed.population, 4500);
      assert.equal(parsed.state, 'Maharashtra');
    });

    it('createVillageSchema should reject missing required name/region/state', () => {
      assert.throws(() => {
        createVillageSchema.parse({ description: 'Missing required fields' });
      });
    });

    it('createVillageSchema should reject invalid coordinates outside bounds', () => {
      assert.throws(() => {
        createVillageSchema.parse({
          name: 'Invalid Village',
          region: 'North',
          state: 'Punjab',
          latitude: 95.0 // latitude must be <= 90
        });
      });
    });

    it('updateVillageSchema should allow partial updates', () => {
      const parsed = updateVillageSchema.parse({ population: 6000 });
      assert.equal(parsed.population, 6000);
    });

    it('villageQuerySchema should provide default pagination', () => {
      const parsed = villageQuerySchema.parse({});
      assert.equal(parsed.page, 1);
      assert.equal(parsed.limit, 20);
    });
  });

  describe('User Governance Validation Schemas', () => {
    it('updateUserStatusSchema should accept boolean isActive', () => {
      const parsed = updateUserStatusSchema.parse({ isActive: false });
      assert.equal(parsed.isActive, false);
    });

    it('updateUserStatusSchema should reject non-boolean isActive', () => {
      assert.throws(() => {
        updateUserStatusSchema.parse({ isActive: 'not-a-boolean' });
      });
    });

    it('updateUserRoleSchema should accept valid roles: STUDENT, TEACHER, ADMIN', () => {
      assert.equal(updateUserRoleSchema.parse({ role: 'STUDENT' }).role, 'STUDENT');
      assert.equal(updateUserRoleSchema.parse({ role: 'TEACHER' }).role, 'TEACHER');
      assert.equal(updateUserRoleSchema.parse({ role: 'ADMIN' }).role, 'ADMIN');
    });

    it('updateUserRoleSchema should reject invalid role', () => {
      assert.throws(() => {
        updateUserRoleSchema.parse({ role: 'SUPERUSER' });
      });
    });

    it('userQuerySchema should parse search and role filters', () => {
      const parsed = userQuerySchema.parse({ search: 'Aarav', role: 'STUDENT' });
      assert.equal(parsed.search, 'Aarav');
      assert.equal(parsed.role, 'STUDENT');
    });
  });

  describe('Teacher-Student Assignment Validation Schemas', () => {
    const validUuid1 = '123e4567-e89b-12d3-a456-426614174000';
    const validUuid2 = '987fcdeb-51a2-43f7-9876-ba0987654321';

    it('teacherStudentParamsSchema should accept valid UUIDs', () => {
      const parsed = teacherStudentParamsSchema.parse({
        teacherId: validUuid1,
        studentId: validUuid2
      });
      assert.equal(parsed.teacherId, validUuid1);
      assert.equal(parsed.studentId, validUuid2);
    });

    it('teacherStudentParamsSchema should reject non-UUID params', () => {
      assert.throws(() => {
        teacherStudentParamsSchema.parse({
          teacherId: 'non-uuid-teacher',
          studentId: validUuid2
        });
      });
    });

    it('teacherOnlyParamsSchema should accept valid teacher UUID', () => {
      const parsed = teacherOnlyParamsSchema.parse({ teacherId: validUuid1 });
      assert.equal(parsed.teacherId, validUuid1);
    });
  });

});
