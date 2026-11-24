import { Server } from 'socket.io';
import { env } from './env.js';
import { verifyAccessToken } from '../utils/token.utils.js';

let io = null;

/**
 * Initializes and configures Socket.IO server on top of the HTTP server
 * @param {import('node:http').Server} httpServer 
 * @returns {Server}
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [env.CLIENT_ORIGIN, 'http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket.IO Authentication Middleware
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      
      // Also allow token from handshake query for testing/environments where headers cannot be set
      if (!token && socket.handshake.query?.token) {
        token = socket.handshake.query.token;
      }

      if (!token) {
        return next(new Error('Authentication error: Access token required for Socket.IO connection.'));
      }

      const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1].trim() : token.trim();
      const decoded = verifyAccessToken(cleanToken);
      
      // Attach authenticated user identity to socket
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (err) {
      return next(new Error(`Authentication error: ${err.message}`));
    }
  });

  // Base namespace connection handler
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket.IO] Authenticated client connected: ${socket.id} (User: ${user.id}, Role: ${user.role})`);

    // Automatically join the user's private simulation room, user notification room, and role room
    const userSimRoom = `simulation:${user.id}`;
    const userNotifRoom = `user:${user.id}`;
    const userRoleRoom = `role:${user.role}`;
    socket.join(userSimRoom);
    socket.join(userNotifRoom);
    socket.join(userRoleRoom);
    socket.join('role:ALL');

    // Heartbeat / ping
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    /**
     * Client to Server: Subscribe to personal simulation channel
     */
    socket.on('simulation:subscribe', () => {
      socket.join(userSimRoom);
      socket.emit('subscription:confirmed', { room: userSimRoom });
    });

    /**
     * Client to Server: Subscribe to personal notification channel
     */
    socket.on('notifications:subscribe', () => {
      socket.join(userNotifRoom);
      socket.emit('subscription:confirmed', { room: userNotifRoom });
    });

    /**
     * Client to Server: Unsubscribe from personal notification channel
     */
    socket.on('notifications:unsubscribe', () => {
      socket.leave(userNotifRoom);
      socket.emit('unsubscription:confirmed', { room: userNotifRoom });
    });

    /**
     * Client to Server: Unsubscribe from personal simulation channel
     */
    socket.on('simulation:unsubscribe', () => {
      socket.leave(userSimRoom);
      socket.emit('unsubscription:confirmed', { room: userSimRoom });
    });

    /**
     * Client to Server: Subscribe to village-wide groundwater updates
     */
    socket.on('village:subscribe', (data) => {
      const villageId = data?.villageId;
      if (!villageId || typeof villageId !== 'string') {
        return socket.emit('error', { message: 'Invalid villageId parameter for village:subscribe' });
      }

      const villageRoom = `village:${villageId}`;
      socket.join(villageRoom);
      socket.emit('subscription:confirmed', { room: villageRoom, villageId });
      console.log(`[Socket.IO] Socket ${socket.id} joined ${villageRoom}`);
    });

    /**
     * Client to Server: Unsubscribe from village-wide groundwater updates
     */
    socket.on('village:unsubscribe', (data) => {
      const villageId = data?.villageId;
      if (villageId) {
        const villageRoom = `village:${villageId}`;
        socket.leave(villageRoom);
        socket.emit('unsubscription:confirmed', { room: villageRoom, villageId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (User: ${user.id}, Reason: ${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket.IO] Socket error on ${socket.id}:`, err.message);
    });
  });

  console.log(`[Socket.IO] Initialized with authenticated middleware and origins: ${env.CLIENT_ORIGIN}`);
  return io;
};

/**
 * Retrieves the initialized Socket.IO instance
 * @returns {Server}
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket(httpServer) first.');
  }
  return io;
};

// ==========================================
// Authoritative Server-to-Client Event Emitters
// ==========================================

/**
 * Emits simulation:started event to the executing student's private room
 */
export const emitSimulationStarted = (userId, data) => {
  try {
    if (io) {
      io.to(`simulation:${userId}`).emit('simulation:started', {
        timestamp: new Date().toISOString(),
        userId,
        villageId: data.villageId,
        scenarioId: data.scenarioId
      });
    }
  } catch (err) {
    console.error('[Socket.IO] emitSimulationStarted error:', err.message);
  }
};

/**
 * Emits simulation:completed event to student and broadcast to village observers
 */
export const emitSimulationCompleted = (userId, villageId, result) => {
  try {
    if (io) {
      const payload = {
        timestamp: new Date().toISOString(),
        simulationId: result.simulationId,
        villageId,
        waterBalance: result.waterBalance,
        waterQuality: result.waterQuality,
        sustainability: result.sustainability,
        interventions: result.interventions,
        executedAt: result.executedAt
      };

      // Notify the private executing student room
      io.to(`simulation:${userId}`).emit('simulation:completed', payload);

      // Broadcast non-sensitive state update to all students observing this village
      io.to(`village:${villageId}`).emit('village:state:updated', {
        villageId,
        storagePercentage: result.waterBalance.storagePercentage,
        conditionCategory: result.waterBalance.conditionCategory,
        finalStorageM3: result.waterBalance.finalStorageM3,
        rechargeM3: result.waterBalance.rechargeM3,
        extractionM3: result.waterBalance.extractionM3,
        waterQualityIndex: result.waterQuality.finalWQI,
        sustainabilityScore: result.sustainability.overallScore,
        updatedAt: new Date().toISOString()
      });

      io.to(`village:${villageId}`).emit('groundwater:updated', {
        villageId,
        storagePercentage: result.waterBalance.storagePercentage,
        conditionCategory: result.waterBalance.conditionCategory,
        depthToWaterTableMeters: Number((22.0 - (result.waterBalance.storagePercentage / 100.0) * 12.0).toFixed(1)),
        annualRechargeM3: result.waterBalance.rechargeM3,
        annualExtractionM3: result.waterBalance.extractionM3,
        waterQualityIndex: result.waterQuality.finalWQI
      });
    }
  } catch (err) {
    console.error('[Socket.IO] emitSimulationCompleted error:', err.message);
  }
};

/**
 * Emits simulation:failed event to student's private room
 */
export const emitSimulationFailed = (userId, errorPayload) => {
  try {
    if (io) {
      io.to(`simulation:${userId}`).emit('simulation:failed', {
        timestamp: new Date().toISOString(),
        error: errorPayload.message || 'Simulation execution failed',
        code: errorPayload.code || 'SIMULATION_ERROR'
      });
    }
  } catch (err) {
    console.error('[Socket.IO] emitSimulationFailed error:', err.message);
  }
};

/**
 * Emits leaderboard:updated event to all connected clients
 */
export const emitLeaderboardUpdated = (data) => {
  try {
    if (io) {
      io.emit('leaderboard:updated', {
        timestamp: new Date().toISOString(),
        data
      });
    }
  } catch (err) {
    console.error('[Socket.IO] emitLeaderboardUpdated error:', err.message);
  }
};

/**
 * Emits a real-time notification to a specific user's private notification room
 * @param {string} userId
 * @param {Object} notification
 */
export const emitNotificationToUser = (userId, notification) => {
  try {
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }
  } catch (err) {
    console.error('[Socket.IO] emitNotificationToUser error:', err.message);
  }
};

/**
 * Emits notification read event to sync multiple sessions/devices of the user
 * @param {string} userId
 * @param {Object} payload
 */
export const emitNotificationReadToUser = (userId, payload) => {
  try {
    if (io) {
      io.to(`user:${userId}`).emit('notification:read', payload);
    }
  } catch (err) {
    console.error('[Socket.IO] emitNotificationReadToUser error:', err.message);
  }
};

/**
 * Emits updated unread notification count to user
 * @param {string} userId
 * @param {number} unreadCount
 */
export const emitUnreadCountToUser = (userId, unreadCount) => {
  try {
    if (io) {
      io.to(`user:${userId}`).emit('notification:unread_count', { unreadCount });
    }
  } catch (err) {
    console.error('[Socket.IO] emitUnreadCountToUser error:', err.message);
  }
};

/**
 * Emits a platform or teacher announcement to role room or all clients
 * @param {string} targetRole - 'STUDENT', 'TEACHER', 'ALL'
 * @param {Object} announcement
 */
export const emitAnnouncementToRole = (targetRole, announcement) => {
  try {
    if (io) {
      const room = targetRole === 'ALL' ? 'role:ALL' : `role:${targetRole}`;
      io.to(room).emit('announcement:new', announcement);
    }
  } catch (err) {
    console.error('[Socket.IO] emitAnnouncementToRole error:', err.message);
  }
};

export default {
  initSocket,
  getIO,
  emitSimulationStarted,
  emitSimulationCompleted,
  emitSimulationFailed,
  emitLeaderboardUpdated,
  emitNotificationToUser,
  emitNotificationReadToUser,
  emitUnreadCountToUser,
  emitAnnouncementToRole
};
