import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// Global singleton reference for Prisma Client
let prismaInstance = null;

/**
 * Returns the singleton instance of PrismaClient
 * @returns {PrismaClient}
 */
export const getPrismaClient = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: env.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty'
    });
  }
  return prismaInstance;
};

export const prisma = getPrismaClient();

/**
 * Connects to PostgreSQL and verifies the connection with a heartbeat query
 * @param {number} maxRetries 
 * @param {number} delayMs 
 * @returns {Promise<boolean>}
 */
export const connectDatabase = async (maxRetries = 3, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Execute lightweight query to confirm active connection
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1 as heartbeat`;
      console.log(`[Database] PostgreSQL connection established successfully via Prisma ORM.`);
      return true;
    } catch (error) {
      console.error(`[Database] Connection attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt < maxRetries) {
        console.log(`[Database] Retrying connection in ${delayMs / 1000}s...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        console.error(`[Database] Fatal: Unable to connect to PostgreSQL. Please check DATABASE_URL and server state.`);
        throw error;
      }
    }
  }
  return false;
};

/**
 * Gracefully disconnects Prisma from PostgreSQL
 * @returns {Promise<void>}
 */
export const disconnectDatabase = async () => {
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
      console.log(`[Database] PostgreSQL connection closed cleanly.`);
    } catch (err) {
      console.error(`[Database] Error during Prisma disconnect:`, err.message);
    }
  }
};

export default {
  prisma,
  getPrismaClient,
  connectDatabase,
  disconnectDatabase
};
