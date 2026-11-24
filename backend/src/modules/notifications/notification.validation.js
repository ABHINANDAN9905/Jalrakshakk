import { z } from 'zod';
import { NOTIFICATION_CATEGORIES } from './notification.model.js';

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.enum(NOTIFICATION_CATEGORIES).optional(),
  unreadOnly: z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return Boolean(val);
  }, z.boolean()).optional()
});

export const teacherAnnouncementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(1500, 'Message cannot exceed 1500 characters'),
  targetStudentIds: z.array(z.string().uuid()).optional().default([])
});

export const adminAnnouncementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(1500, 'Message cannot exceed 1500 characters'),
  targetRole: z.enum(['STUDENT', 'TEACHER', 'ALL']).default('ALL')
});

export const updateNotificationPreferencesSchema = z.object({
  inAppCategories: z.record(z.string(), z.boolean()).optional()
});
