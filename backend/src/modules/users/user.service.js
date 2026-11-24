import { prisma } from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/password.utils.js';

export class UserService {
  /**
   * Admin: List users with search, role filtering, and pagination
   * @param {Object} filter { search, role }
   * @param {number} page 
   * @param {number} limit 
   */
  static async getUsers(filter = {}, page = 1, limit = 20) {
    const where = {};

    if (filter.role) {
      where.role = filter.role.toUpperCase();
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } }
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    };
  }

  /**
   * View detailed user record with access control validation
   * @param {string} targetUserId 
   * @param {Object} requestingUser { id, role }
   */
  static async getUserById(targetUserId, requestingUser) {
    // 1. Authorization check
    if (requestingUser.role === 'STUDENT' && requestingUser.id !== targetUserId) {
      const error = new Error('Forbidden: Students cannot access other students’ private information.');
      error.statusCode = 403;
      throw error;
    }

    if (requestingUser.role === 'TEACHER' && requestingUser.id !== targetUserId) {
      // Teachers can only view students explicitly assigned to them
      const assignment = await prisma.teacherStudentAssignment.findUnique({
        where: {
          teacherId_studentId: {
            teacherId: requestingUser.id,
            studentId: targetUserId
          }
        }
      });

      if (!assignment) {
        const error = new Error('Forbidden: You are not authorized to view this student’s profile.');
        error.statusCode = 403;
        throw error;
      }
    }

    // 2. Fetch user with relations
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          include: {
            village: {
              select: {
                id: true,
                name: true,
                region: true,
                state: true
              }
            }
          }
        },
        missionProgress: {
          include: {
            mission: {
              select: {
                id: true,
                title: true,
                category: true,
                difficulty: true,
                points: true
              }
            }
          }
        },
        simulationRuns: {
          select: {
            id: true,
            villageId: true,
            sustainabilityScore: true,
            createdAt: true
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Retrieve personal profile with full learning statistics
   * @param {string} userId 
   */
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          include: {
            village: {
              select: {
                id: true,
                name: true,
                region: true,
                state: true
              }
            }
          }
        },
        missionProgress: {
          include: {
            mission: true
          }
        },
        simulationRuns: {
          select: {
            id: true,
            initialStorage: true,
            finalStorage: true,
            sustainabilityScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // Compute student learning statistics
    const totalMissions = user.missionProgress.length;
    const completedMissions = user.missionProgress.filter((p) => p.status === 'COMPLETED').length;
    const totalPoints = user.missionProgress
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (p.mission.points || 0), 0);

    const averageSustainabilityScore = user.simulationRuns.length > 0
      ? user.simulationRuns.reduce((sum, r) => sum + r.sustainabilityScore, 0) / user.simulationRuns.length
      : 0;

    return {
      ...user,
      learningStatistics: {
        totalMissions,
        completedMissions,
        totalPointsEarned: totalPoints,
        simulationRunsCount: user.simulationRuns.length,
        averageSustainabilityScore: Number(averageSustainabilityScore.toFixed(1))
      }
    };
  }

  /**
   * Update personal profile name or password
   * @param {string} userId 
   * @param {Object} updateData 
   */
  static async updateProfile(userId, updateData) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const dataToUpdate = {};
    if (updateData.name) {
      dataToUpdate.name = updateData.name.trim();
    }

    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        const error = new Error('Current password is required to set a new password.');
        error.statusCode = 400;
        throw error;
      }

      const isValid = await comparePassword(updateData.currentPassword, user.passwordHash);
      if (!isValid) {
        const error = new Error('Incorrect current password.');
        error.statusCode = 400;
        throw error;
      }

      dataToUpdate.passwordHash = await hashPassword(updateData.newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  /**
   * Admin: Activate or deactivate a user account
   * @param {string} userId 
   * @param {boolean} isActive 
   */
  static async updateStatus(userId, isActive) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return updated;
  }

  /**
   * Admin: Change user role
   * @param {string} userId 
   * @param {string} role 
   */
  static async updateRole(userId, role) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role.toUpperCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return updated;
  }
}

export default UserService;
