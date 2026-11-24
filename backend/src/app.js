import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getMongoStatus } from './config/mongo.js';

// Initialize Express application instance
export const app = express();

// Disable x-powered-by header for security hardening
app.disable('x-powered-by');

// Security middleware - HTTP response headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Request body parser with size limit to prevent payload abuse
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// HTTP request logger (only in development and non-test environments)
if (env.isDevelopment) {
  app.use(morgan('dev'));
}

/**
 * @route   GET /
 * @desc    Root server identification and status check
 * @access  Public
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'JalRakshak API',
    version: '1.0.0',
    status: 'online'
  });
});

/**
 * @route   GET /health
 * @desc    Standard container/load-balancer health-check endpoint
 * @access  Public
 */
app.get('/health', (req, res) => {
  const mongoStatus = getMongoStatus();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    databases: {
      mongodb: mongoStatus.state
    }
  });
});

// Mount versioned API router (default: /api/v1)
app.use(env.API_PREFIX, apiRouter);

// Catch-all 404 handler for unregistered routes
app.use(notFound);

// Centralized application error handling middleware
app.use(errorHandler);

export default app;
