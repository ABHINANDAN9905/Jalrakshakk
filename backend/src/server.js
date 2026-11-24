import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectMongo, disconnectMongo } from './config/mongo.js';

// Create native Node.js HTTP server wrapping the Express app
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server instance
const io = initSocket(server);

// Start listening for incoming connections
server.listen(env.PORT, async () => {
  console.log(`==============================================`);
  console.log(`💧 JalRakshak Backend Service Operational`);
  console.log(`🚀 Server listening on: http://localhost:${env.PORT}`);
  console.log(`🌐 Environment:       ${env.NODE_ENV}`);
  console.log(`📡 API Prefix:        ${env.API_PREFIX}`);
  console.log(`🔗 Allowed Origin:    ${env.CLIENT_ORIGIN}`);
  console.log(`==============================================`);

  // Attempt PostgreSQL heartbeat in background (non-blocking)
  try {
    await connectDatabase(1, 1000);
  } catch (err) {
    console.warn(`[Database] Notice: PostgreSQL is currently not reachable (${err.message}). Operational in offline-relational mode.`);
  }

  // Attempt MongoDB connection in background (non-blocking)
  try {
    await connectMongo(1, 1000);
  } catch (err) {
    console.warn(`[MongoDB] Notice: MongoDB is currently not reachable (${err.message}). Operational in offline-document mode.`);
  }
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Fatal] Port ${env.PORT} is already in use. Please select a different port or terminate the existing process.`);
  } else {
    console.error(`[Fatal] Server startup error:`, err);
  }
  process.exit(1);
});

/**
 * Graceful termination handler
 * Ensures in-flight HTTP requests, Socket.IO connections, and database pools close cleanly
 * @param {string} signal 
 */
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Commencing graceful termination...`);

  // Close active Socket.IO connections
  if (io) {
    io.close(() => {
      console.log('[Shutdown] Socket.IO server closed.');
    });
  }

  // Close PostgreSQL connection
  try {
    await disconnectDatabase();
  } catch (dbErr) {
    console.error('[Shutdown] Error disconnecting PostgreSQL:', dbErr);
  }

  // Close MongoDB connection
  try {
    await disconnectMongo();
  } catch (mongoErr) {
    console.error('[Shutdown] Error disconnecting MongoDB:', mongoErr);
  }

  // Close HTTP listener
  server.close((err) => {
    if (err) {
      console.error('[Shutdown] Error while closing HTTP server:', err);
      process.exit(1);
    }
    console.log('[Shutdown] HTTP server successfully closed. Process exiting.');
    process.exit(0);
  });

  // Force close after 10s if connections do not terminate cleanly
  setTimeout(() => {
    console.error('[Shutdown] Forced termination due to connection timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('[Fatal] Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Fatal] Unhandled Promise Rejection:', reason);
  process.exit(1);
});

export { server, io };
