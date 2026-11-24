import { z } from 'zod';

export const assignMissionSchema = z.object({
  studentId: z.string().uuid({ message: 'studentId must be a valid UUID' }),
  missionId: z.string().min(1, 'missionId is required'),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

export const bulkAssignMissionSchema = z.object({
  studentIds: z.array(z.string().uuid()).optional(),
  allClassroom: z.boolean().optional(),
  missionId: z.string().min(1, 'missionId is required'),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional()
}).refine((data) => data.allClassroom === true || (Array.isArray(data.studentIds) && data.studentIds.length > 0), {
  message: 'Must provide either studentIds array or set allClassroom: true'
});

export const studentProgressParamsSchema = z.object({
  studentId: z.string().uuid({ message: 'studentId must be a valid UUID' })
});

export const reportQuerySchema = z.object({
  format: z.enum(['csv', 'json']).optional().default('json'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});
