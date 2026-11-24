import { z } from 'zod';

export const missionQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  level: z.string().regex(/^\d+$/).optional()
});

export const missionParamsSchema = z.object({
  id: z.string().min(1, 'Mission ID is required')
});

export const completeTaskParamsSchema = z.object({
  id: z.string().min(1, 'Mission ID is required'),
  taskId: z.string().min(1, 'Task ID is required')
});

export const createMissionSchema = z.object({
  title: z.string().min(3).trim(),
  description: z.string().min(10).trim(),
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
  xpReward: z.number().int().positive().default(100),
  estimatedDurationMinutes: z.number().int().positive().default(30),
  requiredLevel: z.number().int().positive().default(1),
  learningObjectives: z.array(z.string()).optional().default([]),
  instructions: z.string().optional(),
  completionCriteria: z.record(z.any()).optional().default({}),
  isActive: z.boolean().optional().default(true)
});

export const updateMissionSchema = createMissionSchema.partial();
