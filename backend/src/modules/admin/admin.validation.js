import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN'], {
    errorMap: () => ({ message: "Role must be one of 'STUDENT', 'TEACHER', or 'ADMIN'." })
  })
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: 'isActive boolean flag is required.'
  })
});

export const adminUserFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional()
});

export const createVillageSchema = z.object({
  name: z.string().min(2, 'Village name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  region: z.string().min(2, 'Region is required'),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  population: z.coerce.number().int().positive().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional()
});

export const updateVillageSchema = createVillageSchema.partial();

export const createAdminMissionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'GROUNDWATER',
    'GROUNDWATER_CONSERVATION',
    'RAINWATER_HARVESTING',
    'SUSTAINABLE_AGRICULTURE',
    'IRRIGATION',
    'IRRIGATION_EFFICIENCY',
    'WATER_QUALITY',
    'WATER_POLLUTION',
    'POLLUTION_PREVENTION',
    'SUSTAINABLE_USAGE',
    'COMMUNITY_AWARENESS',
    'DROUGHT_MANAGEMENT'
  ]),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  xpReward: z.coerce.number().int().positive().default(100),
  points: z.coerce.number().int().positive().default(100),
  requiredLevel: z.coerce.number().int().positive().default(1),
  estimatedDurationMinutes: z.coerce.number().int().positive().default(30),
  instructions: z.string().optional(),
  learningObjectives: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  tasks: z.array(z.object({
    title: z.string().min(3),
    description: z.string(),
    taskType: z.enum([
      'COMPLETE_SIMULATION',
      'ACHIEVE_STORAGE_THRESHOLD',
      'IMPROVE_SUSTAINABILITY_SCORE',
      'USE_DRIP_IRRIGATION',
      'BUILD_CONSERVATION_STRUCTURE',
      'COMPLETE_WATER_QUALITY_CHALLENGE',
      'REDUCE_GROUNDWATER_EXTRACTION',
      'COMPLETE_QUIZ'
    ]),
    targetCriteria: z.record(z.any()).default({}),
    xpReward: z.coerce.number().int().positive().default(50),
    orderIndex: z.coerce.number().int().default(0)
  })).optional()
});

export const updateAdminMissionSchema = createAdminMissionSchema.partial();

export const createAdminChallengeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['DAILY', 'WEEKLY', 'LIMITED_TIME']).default('WEEKLY'),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  targetCriteria: z.record(z.any()).default({}),
  xpReward: z.coerce.number().int().positive().default(150),
  isActive: z.boolean().default(true)
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be strictly after start date',
  path: ['endDate']
});

export const updateAdminChallengeSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  type: z.enum(['DAILY', 'WEEKLY', 'LIMITED_TIME']).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  targetCriteria: z.record(z.any()).optional(),
  xpReward: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional()
});

export const auditLogFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  actorId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional()
});
