import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

// Configure global Mongoose settings
mongoose.set('strictQuery', true);

// Register connection lifecycle event listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log(`[MongoDB] Connected to database: "${mongoose.connection.name}" at ${mongoose.connection.host}:${mongoose.connection.port}`);
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[MongoDB] Connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('[MongoDB] Connection disconnected.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB] Connection re-established.');
});

/**
 * Connect to MongoDB with timeout and retry handling
 * @param {number} maxRetries 
 * @param {number} delayMs 
 * @returns {Promise<boolean>}
 */
export const connectMongo = async (maxRetries = 2, delayMs = 1500) => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    autoIndex: env.isDevelopment
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, options);
      return true;
    } catch (err) {
      console.warn(`[MongoDB] Connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt < maxRetries) {
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        console.warn(`[MongoDB] Notice: MongoDB is currently not reachable at ${env.MONGODB_URI}. Operational in offline-document mode.`);
        return false;
      }
    }
  }
  return false;
};

/**
 * Gracefully disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectMongo = async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      isConnected = false;
      console.log('[MongoDB] Connection closed cleanly.');
    } catch (err) {
      console.error('[MongoDB] Error during disconnect:', err.message);
    }
  }
};

/**
 * Get current MongoDB connection status
 * @returns {{ isConnected: boolean, readyState: number, host: string|null, name: string|null }}
 */
export const getMongoStatus = () => {
  const readyStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    isConnected: mongoose.connection.readyState === 1,
    state: readyStates[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

export default {
  connectMongo,
  disconnectMongo,
  getMongoStatus,
  mongoose
};
