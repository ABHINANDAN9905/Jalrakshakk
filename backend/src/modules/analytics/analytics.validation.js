import { z } from 'zod';

export const dateRangeQuerySchema = z.object({
  startDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d')
});

export const studentAnalyticsQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  startDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d')
});

export const groundwaterInsightsQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  villageId: z.string().uuid().optional(),
  simulationRunId: z.string().optional(),
  baselineRunId: z.string().optional(),
  interventionRunId: z.string().optional()
});

export const reportGenerationSchema = z.object({
  reportType: z.enum([
    'STUDENT_PROGRESS',
    'TEACHER_CLASSROOM',
    'MISSION_PERFORMANCE',
    'GROUNDWATER_SIMULATION',
    'ADMIN_PLATFORM'
  ]),
  format: z.enum(['csv', 'html', 'json']).default('json'),
  studentId: z.string().uuid().optional(),
  villageId: z.string().uuid().optional(),
  startDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  period: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d')
});
