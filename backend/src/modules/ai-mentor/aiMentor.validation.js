import { z } from 'zod';

export const askQuestionSchema = z.object({
  message: z.string({ required_error: 'Message is required' }).min(1, 'Message cannot be empty').max(1500, 'Message cannot exceed 1500 characters').trim(),
  sessionId: z.string().min(1).optional(),
  villageId: z.string().uuid().optional(),
  includeSimulationContext: z.boolean().optional().default(true)
});

export const explainSimulationSchema = z.object({
  sessionId: z.string().optional(),
  villageId: z.string().uuid().optional(),
  simulationId: z.string().optional()
});

export const recommendActionsSchema = z.object({
  villageId: z.string().uuid().optional(),
  simulationId: z.string().optional()
});

export const quizQuestionSchema = z.object({
  topic: z.enum([
    'RECHARGE',
    'IRRIGATION',
    'AQUIFER_DYNAMICS',
    'RAINWATER_HARVESTING',
    'WATER_QUALITY',
    'WATERSHED_MANAGEMENT'
  ]).optional().default('RECHARGE')
});
