import { z } from 'zod';

export const userQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean status is required' })
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN'], {
    required_error: 'Valid role (STUDENT, TEACHER, or ADMIN) is required'
  })
});

export default {
  userQuerySchema,
  updateUserStatusSchema,
  updateUserRoleSchema
};
