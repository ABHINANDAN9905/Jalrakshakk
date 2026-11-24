import { env } from '../config/env.js';

/**
 * Centralized Application Error Handling Middleware
 * Ensures consistent JSON error envelopes and prevents leaking stack traces in production
 */
export const errorHandler = (err, req, res, next) => {
  // Determine appropriate HTTP status code
  const statusCode = (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600)
    ? err.statusCode
    : (typeof err.status === 'number' && err.status >= 400 && err.status < 600)
      ? err.status
      : 500;

  // In production, mask internal server errors with a generic message
  const message = (statusCode === 500 && env.isProduction)
    ? 'Internal Server Error'
    : (err.message || 'An unexpected error occurred');

  const errorResponse = {
    success: false,
    statusCode,
    message,
    ...(env.isDevelopment && {
      stack: err.stack,
      errorDetails: err
    })
  };

  if (statusCode === 500) {
    console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
