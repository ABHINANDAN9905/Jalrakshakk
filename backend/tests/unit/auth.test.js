import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../../src/utils/password.utils.js';
import { generateAccessToken, generateRefreshToken, hashToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/token.utils.js';
import { registerSchema, loginSchema } from '../../src/modules/auth/auth.validation.js';
import { env } from '../../src/config/env.js';
import { authenticate } from '../../src/middleware/authenticate.js';
import { authorize } from '../../src/middleware/authorize.js';

describe('Phase 5 Auth Unit Tests - Security & Tokens', () => {

  describe('Password Utilities', () => {
    it('should hash a password and verify correctly using bcrypt', async () => {
      const password = 'ConservationPass2026!';
      const hash = await hashPassword(password);

      assert.ok(hash !== password, 'Hash should not match plaintext password');
      assert.ok(hash.startsWith('$2b$'), 'Bcrypt hash should start with $2b$');

      const isMatch = await comparePassword(password, hash);
      assert.equal(isMatch, true, 'Correct password must match hash');

      const isWrongMatch = await comparePassword('WrongPassword123!', hash);
      assert.equal(isWrongMatch, false, 'Incorrect password must not match hash');
    });

    it('should reject empty passwords', async () => {
      await assert.rejects(async () => {
        await hashPassword('');
      }, /Password must be a non-empty string/);
    });
  });

  describe('Token Utilities', () => {
    const userPayload = {
      id: 'uuid-student-101',
      email: 'student@jalrakshak.local',
      role: 'STUDENT'
    };

    it('should generate a valid access token and decode payload', () => {
      const token = generateAccessToken(userPayload);
      assert.ok(typeof token === 'string');

      const decoded = verifyAccessToken(token);
      assert.equal(decoded.id, userPayload.id);
      assert.equal(decoded.email, userPayload.email);
      assert.equal(decoded.role, userPayload.role);
    });

    it('should generate a refresh token with jti and hash it consistently', () => {
      const refreshToken = generateRefreshToken({ id: userPayload.id });
      assert.ok(typeof refreshToken === 'string');

      const decoded = verifyRefreshToken(refreshToken);
      assert.equal(decoded.id, userPayload.id);
      assert.ok(decoded.jti);

      const hash1 = hashToken(refreshToken);
      const hash2 = hashToken(refreshToken);
      assert.equal(hash1, hash2, 'SHA-256 hash must be deterministic');
      assert.equal(hash1.length, 64, 'SHA-256 hex string must be 64 characters');
    });

    it('should reject expired access tokens', () => {
      // Create an expired token by signing with negative expiresIn
      const expiredToken = jwt.sign(
        { id: userPayload.id, email: userPayload.email, role: userPayload.role },
        env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      assert.throws(() => {
        verifyAccessToken(expiredToken);
      }, (err) => err.name === 'TokenExpiredError');
    });

    it('should reject tokens signed with invalid secret', () => {
      const forgedToken = jwt.sign(
        { id: userPayload.id, role: 'ADMIN' },
        'wrong_secret_key_123'
      );

      assert.throws(() => {
        verifyAccessToken(forgedToken);
      }, (err) => err.name === 'JsonWebTokenError');
    });
  });

  describe('Registration & Role Validation (Zod)', () => {
    it('should accept valid registration with STUDENT role', async () => {
      const validData = {
        name: 'Kavita Patel',
        email: 'kavita@jalrakshak.org',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'STUDENT'
      };

      const parsed = await registerSchema.parseAsync(validData);
      assert.equal(parsed.email, 'kavita@jalrakshak.org');
      assert.equal(parsed.role, 'STUDENT');
    });

    it('should strictly reject public registration attempting ADMIN role', async () => {
      const maliciousData = {
        name: 'Attacker',
        email: 'attacker@jalrakshak.org',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'ADMIN'
      };

      await assert.rejects(async () => {
        await registerSchema.parseAsync(maliciousData);
      }, (err) => {
        const issues = err.issues || err.errors || [];
        return issues.some((e) => e.message.includes('ADMIN is forbidden'));
      });
    });

    it('should reject registration when passwords do not match', async () => {
      const mismatchData = {
        name: 'Rahul Sen',
        email: 'rahul@jalrakshak.org',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword999!',
        role: 'STUDENT'
      };

      await assert.rejects(async () => {
        await registerSchema.parseAsync(mismatchData);
      }, (err) => {
        const issues = err.issues || err.errors || [];
        return issues.some((e) => e.message.includes('Passwords do not match'));
      });
    });

    it('should reject weak password shorter than 8 characters or missing digits', async () => {
      const weakData = {
        name: 'Test User',
        email: 'test@jalrakshak.org',
        password: 'short',
        confirmPassword: 'short',
        role: 'STUDENT'
      };

      await assert.rejects(async () => {
        await registerSchema.parseAsync(weakData);
      });
    });
  });

  describe('RBAC Middleware Unit Tests', () => {
    it('authorize should allow student on student role', () => {
      let nextCalled = false;
      const req = { user: { id: 'u-1', role: 'STUDENT' } };
      const res = {};
      const next = () => { nextCalled = true; };

      const middleware = authorize('STUDENT', 'TEACHER');
      middleware(req, res, next);

      assert.equal(nextCalled, true);
    });

    it('authorize should forbid student on teacher-only role (403)', () => {
      let statusCode = null;
      let jsonPayload = null;
      const req = { user: { id: 'u-1', role: 'STUDENT' } };
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (payload) => { jsonPayload = payload; }
          };
        }
      };
      const next = () => {};

      const middleware = authorize('TEACHER', 'ADMIN');
      middleware(req, res, next);

      assert.equal(statusCode, 403);
      assert.equal(jsonPayload.success, false);
      assert.ok(jsonPayload.message.includes('Forbidden'));
    });

    it('authorize should forbid teacher on admin-only role (403)', () => {
      let statusCode = null;
      const req = { user: { id: 't-1', role: 'TEACHER' } };
      const res = {
        status: (code) => {
          statusCode = code;
          return { json: () => {} };
        }
      };
      const next = () => {};

      const middleware = authorize('ADMIN');
      middleware(req, res, next);

      assert.equal(statusCode, 403);
    });
  });

});
