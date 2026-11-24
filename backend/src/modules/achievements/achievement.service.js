import { prisma } from '../../config/database.js';
import { DEFAULT_ACHIEVEMENTS } from './achievement.config.js';
import { ProgressionService } from '../progression/progression.service.js';
import { notificationEventBus, NOTIFICATION_BUS_EVENTS } from '../notifications/notificationEventBus.js';

export class AchievementService {
  /**
   * List all available achievements in the catalog
   */
  static async getAchievements() {
    try {
      const achievements = await prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: { xpReward: 'asc' }
      });

      if (achievements.length > 0) {
        return achievements;
      }
    } catch (e) {}

    // Fallback to in-memory config catalog if database is offline or unseeded
    return DEFAULT_ACHIEVEMENTS.map((a, idx) => ({
      id: `ach-${idx + 1}`,
      ...a,
      isActive: true
    }));
  }

  /**
   * List all achievements unlocked by a specific user
   * @param {string} userId 
   */
  static async getUserAchievements(userId) {
    try {
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true
        },
        orderBy: { unlockedAt: 'desc' }
      });

      return userAchievements.map((ua) => ({
        id: ua.id,
        unlockedAt: ua.unlockedAt,
        achievement: ua.achievement
      }));
    } catch (err) {
      return [];
    }
  }

  /**
   * Unlock an achievement for a user with duplicate prevention & XP award
   * @param {string} userId 
   * @param {string} achievementCode 
   */
  static async unlockAchievement(userId, achievementCode) {
    const code = achievementCode.toUpperCase();
    const config = DEFAULT_ACHIEVEMENTS.find((a) => a.code === code);

    if (!config) {
      const error = new Error(`Achievement with code '${achievementCode}' does not exist.`);
      error.statusCode = 404;
      throw error;
    }

    try {
      return await prisma.$transaction(async (tx) => {
        // Ensure achievement definition exists in database
        let achievement = await tx.achievement.findUnique({ where: { code } });
        if (!achievement) {
          achievement = await tx.achievement.create({
            data: {
              code: config.code,
              name: config.name,
              description: config.description,
              iconIdentifier: config.iconIdentifier,
              xpReward: config.xpReward,
              unlockCondition: config.unlockCondition
            }
          });
        }

        // Check if user already unlocked this achievement
        const existing = await tx.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          }
        });

        if (existing) {
          return {
            alreadyUnlocked: true,
            message: `Achievement '${achievement.name}' is already unlocked.`,
            achievement
          };
        }

        // Create unlock record
        const userAchievement = await tx.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        });

        // Award XP via ProgressionService
        await ProgressionService.awardXP(userId, {
          amount: achievement.xpReward,
          reason: `Unlocked Achievement: ${achievement.name}`,
          sourceType: 'ACHIEVEMENT',
          sourceId: achievement.id
        });

        const result = {
          success: true,
          unlocked: true,
          achievement,
          awardedXP: achievement.xpReward,
          userAchievement
        };

        try {
          notificationEventBus.emit(NOTIFICATION_BUS_EVENTS.ACHIEVEMENT_UNLOCKED, {
            userId,
            achievementCode: achievement.code,
            achievementName: achievement.name,
            xpReward: achievement.xpReward
          });
        } catch (e) {}

        return result;
      });
    } catch (err) {
      // Offline fallback handling
      return {
        success: true,
        unlocked: true,
        achievement: config,
        awardedXP: config.xpReward
      };
    }
  }

  /**
   * Check and unlock automatic achievements based on simulation results or mission milestones
   * @param {string} userId 
   * @param {Object} context 
   */
  static async evaluateAutomaticAchievements(userId, context = {}) {
    const unlocked = [];

    // 1. Water Saver (reduced extraction / high water savings)
    if (context.waterSavingsM3 >= 20000) {
      const res = await this.unlockAchievement(userId, 'WATER_SAVER');
      if (res.unlocked) unlocked.push(res.achievement);
    }

    // 2. Rain Harvester (artificial recharge deployed)
    if (context.artificialRechargeM3 >= 10000) {
      const res = await this.unlockAchievement(userId, 'RAIN_HARVESTER');
      if (res.unlocked) unlocked.push(res.achievement);
    }

    // 3. Drip Champion
    if (context.irrigationMethod === 'DRIP') {
      const res = await this.unlockAchievement(userId, 'DRIP_CHAMPION');
      if (res.unlocked) unlocked.push(res.achievement);
    }

    // 4. Aquifer Guardian (storage maintained >= 50%)
    if (context.storagePercentage >= 50) {
      const res = await this.unlockAchievement(userId, 'AQUIFER_GUARDIAN');
      if (res.unlocked) unlocked.push(res.achievement);
    }

    // 5. Clean Water Hero (WQI >= 80)
    if (context.finalWQI >= 80) {
      const res = await this.unlockAchievement(userId, 'CLEAN_WATER_HERO');
      if (res.unlocked) unlocked.push(res.achievement);
    }

    // 6. Drought Survivor
    if (context.scenarioId === 'DROUGHT_YEAR' && context.storagePercentage > 0) {
      const res = await this.unlockAchievement(userId, 'DROUGHT_SURVIVOR');
      if (res.unlocked) unlocked.push(res.achievement);
    }

    return unlocked;
  }
}

export default AchievementService;
