import { AuthService } from './auth.service.js';
import { env } from '../../config/env.js';

// Cookie security options
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth'
};

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await AuthService.register({ name, email, password, role });

      res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Account registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken // Also provided in JSON for non-browser/CLI clients
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  static async refresh(req, res, next) {
    try {
      const rawToken = req.cookies?.refresh_token || req.body?.refreshToken;
      const result = await AuthService.refresh(rawToken);

      res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Session refreshed successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  static async logout(req, res, next) {
    try {
      const rawToken = req.cookies?.refresh_token || req.body?.refreshToken;
      await AuthService.logout(rawToken);

      res.clearCookie('refresh_token', { path: '/api/v1/auth' });
      res.clearCookie('access_token');

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Current user profile retrieved',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
