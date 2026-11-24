import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates and normalizes the server port
 * @param {string|number|undefined} val 
 * @returns {number}
 */
const parsePort = (val) => {
  const port = parseInt(String(val || '5000'), 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT specified in environment: ${val}. Must be an integer between 1 and 65535.`);
  }
  return port;
};

/**
 * Validates the runtime environment string
 * @param {string|undefined} val 
 * @returns {'development'|'production'|'test'}
 */
const parseNodeEnv = (val) => {
  const env = (val || 'development').trim().toLowerCase();
  const allowed = ['development', 'production', 'test'];
  if (!allowed.includes(env)) {
    throw new Error(`Invalid NODE_ENV specified: ${val}. Allowed values are: ${allowed.join(', ')}`);
  }
  return env;
};

/**
 * Validates and normalizes client origin URL for CORS
 * @param {string|undefined} val 
 * @returns {string}
 */
const parseClientOrigin = (val) => {
  const origin = (val || process.env.CORS_ORIGIN || 'http://localhost:5173').trim();
  if (!origin) {
    throw new Error('CLIENT_ORIGIN cannot be empty');
  }
  return origin;
};

/**
 * Validates and normalizes API route prefix
 * @param {string|undefined} val 
 * @returns {string}
 */
const parseApiPrefix = (val) => {
  const prefix = (val || '/api/v1').trim();
  if (!prefix.startsWith('/')) {
    throw new Error(`Invalid API_PREFIX: "${prefix}". Must start with "/"`);
  }
  return prefix;
};

// Construct and freeze environment configuration object
export const env = Object.freeze({
  PORT: parsePort(process.env.PORT),
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
  CLIENT_ORIGIN: parseClientOrigin(process.env.CLIENT_ORIGIN),
  API_PREFIX: parseApiPrefix(process.env.API_PREFIX),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jalrakshak?schema=public',
  MONGODB_URI: (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jalrakshak').trim(),
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_access_secret_jalrakshak_2026_super_secure_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_jalrakshak_2026_long_lived_key',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  OPENAI_API_KEY: (process.env.OPENAI_API_KEY || '').trim(),
  OPENAI_MODEL: (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim(),
  isProduction: parseNodeEnv(process.env.NODE_ENV) === 'production',
  isDevelopment: parseNodeEnv(process.env.NODE_ENV) === 'development',
  isTest: parseNodeEnv(process.env.NODE_ENV) === 'test'
});

export default env;
