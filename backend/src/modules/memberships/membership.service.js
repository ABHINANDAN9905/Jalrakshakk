import { prisma } from '../../config/database.js';

export class MembershipService {
  /**
   * User joins a village (transactional)
   * @param {string} userId 
   * @param {string} villageId 
   */
  static async joinVillage(userId, villageId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify village exists
      const village = await tx.village.findUnique({
        where: { id: villageId }
      });

      if (!village) {
        const error = new Error('Village not found.');
        error.statusCode = 404;
        throw error;
      }

      // 2. Check for existing duplicate membership
      const existing = await tx.villageMembership.findUnique({
        where: {
          userId_villageId: {
            userId,
            villageId
          }
        }
      });

      if (existing) {
        const error = new Error('You are already an enrolled member of this village.');
        error.statusCode = 409;
        throw error;
      }

      // 3. Create membership
      const membership = await tx.villageMembership.create({
        data: {
          userId,
          villageId
        },
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
      });

      return membership;
    });
  }

  /**
   * User leaves a village (transactional)
   * @param {string} userId 
   * @param {string} villageId 
   */
  static async leaveVillage(userId, villageId) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.villageMembership.findUnique({
        where: {
          userId_villageId: {
            userId,
            villageId
          }
        }
      });

      if (!existing) {
        const error = new Error('Membership not found. You are not enrolled in this village.');
        error.statusCode = 404;
        throw error;
      }

      await tx.villageMembership.delete({
        where: {
          userId_villageId: {
            userId,
            villageId
          }
        }
      });

      return { success: true, message: 'Successfully departed from village community.' };
    });
  }

  /**
   * Get enrolled members of a village
   * @param {string} villageId 
   * @param {number} page 
   * @param {number} limit 
   */
  static async getVillageMembers(villageId, page = 1, limit = 20) {
    const village = await prisma.village.findUnique({ where: { id: villageId } });
    if (!village) {
      const error = new Error('Village not found.');
      error.statusCode = 404;
      throw error;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [memberships, total] = await Promise.all([
      prisma.villageMembership.findMany({
        where: { villageId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' }
      }),
      prisma.villageMembership.count({ where: { villageId } })
    ]);

    return {
      members: memberships.map((m) => ({
        membershipId: m.id,
        joinedAt: m.joinedAt,
        ...m.user
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    };
  }

  /**
   * View all village memberships for a target user (with authorization check)
   * @param {string} targetUserId 
   * @param {Object} requestingUser { id, role }
   */
  static async getUserVillages(targetUserId, requestingUser) {
    // Authorization: Student can only view own, Teacher if student assigned, Admin can view any
    if (requestingUser.role === 'STUDENT' && requestingUser.id !== targetUserId) {
      const error = new Error('Forbidden: Cannot view other students’ village enrollments.');
      error.statusCode = 403;
      throw error;
    }

    if (requestingUser.role === 'TEACHER' && requestingUser.id !== targetUserId) {
      const assignment = await prisma.teacherStudentAssignment.findUnique({
        where: {
          teacherId_studentId: {
            teacherId: requestingUser.id,
            studentId: targetUserId
          }
        }
      });

      if (!assignment) {
        const error = new Error('Forbidden: You are not assigned to monitor this student.');
        error.statusCode = 403;
        throw error;
      }
    }

    const memberships = await prisma.villageMembership.findMany({
      where: { userId: targetUserId },
      include: {
        village: {
          select: {
            id: true,
            name: true,
            description: true,
            region: true,
            state: true,
            district: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      joinedAt: m.joinedAt,
      village: m.village
    }));
  }
}

export default MembershipService;
