import { z } from 'zod';

/**
 * User Registration Schema
 * Strictly forbids public self-registration as ADMIN
 */
export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Full name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address format')
      .toLowerCase()
      .trim(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one digit'),
    confirmPassword: z.string({ required_error: 'Confirm password is required' }),
    role: z
      .enum(['STUDENT', 'TEACHER'], {
        message: 'Public registration allows only STUDENT or TEACHER roles. ADMIN is forbidden.'
      })
      .default('STUDENT')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

/**
 * User Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address format')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty')
});

/**
 * Token Refresh Schema
 */
export const refreshSchema = z.object({
  refreshToken: z.string().optional()
});

/**
 * Profile Update Schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .optional()
});

export default {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema
};
