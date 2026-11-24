import { prisma } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/password.utils.js';
import { generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken } from '../../utils/token.utils.js';
import { AuditLogService } from '../audit-logs/auditLog.service.js';

export class AuthService {
  /**
   * Register a new user
   * @param {Object} data { name, email, password, role }
   */
  static async register(data) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingUser) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role || 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist hashed refresh token (never plain-text)
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    // Record audit event in MongoDB asynchronously
    try {
      await AuditLogService.recordAudit({
        actorId: user.id,
        action: 'USER_REGISTERED',
        resource: 'User',
        resourceId: user.id,
        metadata: { role: user.role }
      });
    } catch {
      // Non-blocking telemetry
    }

    return { user, accessToken, refreshToken };
  }

  /**
   * Authenticate user credentials and issue token pair
   * @param {string} email 
   * @param {string} password 
   */
  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Generic error message to prevent user enumeration
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    const accessToken = generateAccessToken(userProfile);
    const refreshToken = generateRefreshToken(userProfile);

    // Save hashed refresh token
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    // Record login in audit log
    try {
      await AuditLogService.recordAudit({
        actorId: user.id,
        action: 'USER_LOGGED_IN',
        resource: 'User',
        resourceId: user.id
      });
    } catch {
      // Non-blocking telemetry
    }

    return { user: userProfile, accessToken, refreshToken };
  }

  /**
   * Rotate refresh token and issue fresh token pair
   * @param {string} rawRefreshToken 
   */
  static async refresh(rawRefreshToken) {
    if (!rawRefreshToken) {
      const error = new Error('Refresh token is required.');
      error.statusCode = 401;
      throw error;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch {
      const error = new Error('Invalid or expired refresh token.');
      error.statusCode = 401;
      throw error;
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      const error = new Error('Refresh token is invalid, revoked, or expired.');
      error.statusCode = 401;
      throw error;
    }

    // Revoke used refresh token (Rotation security)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true }
    });

    const userProfile = {
      id: storedToken.user.id,
      name: storedToken.user.name,
      email: storedToken.user.email,
      role: storedToken.user.role,
      createdAt: storedToken.user.createdAt
    };

    // Issue new pair
    const newAccessToken = generateAccessToken(userProfile);
    const newRefreshToken = generateRefreshToken(userProfile);

    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: userProfile.id,
        expiresAt
      }
    });

    return {
      user: userProfile,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Invalidate session and revoke refresh token
   * @param {string} rawRefreshToken 
   */
  static async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      try {
        const tokenHash = hashToken(rawRefreshToken);
        await prisma.refreshToken.updateMany({
          where: { tokenHash },
          data: { isRevoked: true }
        });
      } catch {
        // Safe fail
      }
    }
    return { success: true };
  }

  /**
   * Fetch authenticated user details
   * @param {string} userId 
   */
  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }
}

export default AuthService;
