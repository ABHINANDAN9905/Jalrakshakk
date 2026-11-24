export type NotificationCategory =
  | 'MISSION_ASSIGNED'
  | 'MISSION_COMPLETED'
  | 'XP_EARNED'
  | 'LEVEL_UNLOCKED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'CHALLENGE_STARTED'
  | 'CHALLENGE_ENDING_SOON'
  | 'TEACHER_ANNOUNCEMENT'
  | 'ASSIGNMENT_DEADLINE_APPROACHING'
  | 'ASSIGNMENT_OVERDUE'
  | 'STUDENT_PROGRESS_UPDATE'
  | 'PLATFORM_ANNOUNCEMENT';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  readAt: string | null;
  relatedEntity?: {
    type?: string;
    id?: string;
  } | null;
  actionUrl?: string | null;
  dedupKey?: string | null;
  metadata?: Record<string, any>;
  isPersisted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
  isPersisted: boolean;
  persistenceStatus?: 'PERSISTED' | 'IN_MEMORY_OFFLINE';
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppCategories: Record<NotificationCategory | string, boolean>;
}

export interface TeacherAnnouncement {
  id: string;
  authorId: string;
  authorRole: 'TEACHER' | 'ADMIN';
  authorName: string;
  title: string;
  message: string;
  targetRole: 'STUDENT' | 'TEACHER' | 'ALL';
  targetStudentIds: string[];
  isActive: boolean;
  deliveryCount: number;
  createdAt: string;
  deactivatedAt?: string | null;
}

export interface AdminAnnouncement {
  id: string;
  authorId: string;
  authorRole: 'ADMIN';
  authorName: string;
  title: string;
  message: string;
  targetRole: 'STUDENT' | 'TEACHER' | 'ALL';
  targetStudentIds?: string[];
  isActive: boolean;
  deliveryCount?: number;
  createdAt: string;
  deactivatedAt?: string | null;
}
