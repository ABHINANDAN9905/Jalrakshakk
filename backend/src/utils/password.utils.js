import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

/**
 * Hashes a plaintext password using bcrypt with configured salt rounds
 * @param {string} password 
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
};

/**
 * Compares plaintext password against a stored bcrypt hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }
  return await bcrypt.compare(password, hash);
};

export default {
  hashPassword,
  comparePassword
};
