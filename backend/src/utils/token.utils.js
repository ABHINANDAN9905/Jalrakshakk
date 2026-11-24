import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generates short-lived Access Token (default 15m)
 * @param {Object} payload { id, email, role }
 * @returns {string}
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
};

/**
 * Generates secure Refresh Token (default 7d)
 * @param {Object} payload { id }
 * @returns {string}
 */
export const generateRefreshToken = (payload) => {
  // Combine random cryptographic bytes with signed JWT
  const jti = crypto.randomBytes(16).toString('hex');
  return jwt.sign(
    {
      id: payload.id,
      jti
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN
    }
  );
};

/**
 * Produces a SHA-256 hash of a token for secure database persistence
 * Prevents plain-text token exposure in case of database inspection
 * @param {string} token 
 * @returns {string}
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verifies and decodes an Access Token
 * @param {string} token 
 * @returns {Object} decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Verifies and decodes a Refresh Token
 * @param {string} token 
 * @returns {Object} decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

export default {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken
};
