import { z } from 'zod';

export const teacherStudentParamsSchema = z.object({
  teacherId: z.string().uuid({ message: 'teacherId must be a valid UUID' }),
  studentId: z.string().uuid({ message: 'studentId must be a valid UUID' })
});

export const teacherOnlyParamsSchema = z.object({
  teacherId: z.string().uuid({ message: 'teacherId must be a valid UUID' })
});

export const teacherQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20')
});
