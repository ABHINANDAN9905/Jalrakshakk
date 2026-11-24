import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation.js';

const router = Router();

// Strict login rate limiter: max 10 failed/successful attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// Public endpoints
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);

// Protected endpoints
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;
