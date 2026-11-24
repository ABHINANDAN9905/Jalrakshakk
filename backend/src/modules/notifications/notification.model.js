import mongoose from 'mongoose';

export const NOTIFICATION_CATEGORIES = [
  'MISSION_ASSIGNED',
  'MISSION_COMPLETED',
  'XP_EARNED',
  'LEVEL_UNLOCKED',
  'ACHIEVEMENT_UNLOCKED',
  'CHALLENGE_STARTED',
  'CHALLENGE_ENDING_SOON',
  'TEACHER_ANNOUNCEMENT',
  'ASSIGNMENT_DEADLINE_APPROACHING',
  'ASSIGNMENT_OVERDUE',
  'STUDENT_PROGRESS_UPDATE',
  'PLATFORM_ANNOUNCEMENT'
];

/**
 * Mongoose Schema: Notification
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'userId reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 120
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 1000
    },
    category: {
      type: String,
      required: [true, 'Notification category is required'],
      enum: {
        values: NOTIFICATION_CATEGORIES,
        message: '{VALUE} is not a valid notification category'
      },
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    relatedEntity: {
      type: {
        type: String,
        default: null
      },
      id: {
        type: String,
        default: null
      }
    },
    actionUrl: {
      type: String,
      default: null,
      trim: true
    },
    dedupKey: {
      type: String,
      default: null,
      sparse: true,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    collection: 'notifications',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for user query performance & sorting
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, category: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

/**
 * Mongoose Schema: Announcement (Teacher & Admin Announcements)
 */
const announcementSchema = new mongoose.Schema(
  {
    authorId: {
      type: String,
      required: true,
      index: true
    },
    authorRole: {
      type: String,
      required: true,
      enum: ['TEACHER', 'ADMIN']
    },
    authorName: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500
    },
    targetRole: {
      type: String,
      default: 'ALL',
      enum: ['STUDENT', 'TEACHER', 'ALL']
    },
    targetStudentIds: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    deliveryCount: {
      type: Number,
      default: 0
    },
    deactivatedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'announcements',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

/**
 * Mongoose Schema: NotificationPreference
 */
const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    // Channels (Note: SMS/Email/Push disabled by default, strictly in-app delivered)
    emailEnabled: { type: Boolean, default: false },
    smsEnabled: { type: Boolean, default: false },
    pushEnabled: { type: Boolean, default: false },
    // Category preferences
    inAppCategories: {
      MISSION_ASSIGNED: { type: Boolean, default: true },
      MISSION_COMPLETED: { type: Boolean, default: true },
      XP_EARNED: { type: Boolean, default: true },
      LEVEL_UNLOCKED: { type: Boolean, default: true },
      ACHIEVEMENT_UNLOCKED: { type: Boolean, default: true },
      CHALLENGE_STARTED: { type: Boolean, default: true },
      CHALLENGE_ENDING_SOON: { type: Boolean, default: true },
      TEACHER_ANNOUNCEMENT: { type: Boolean, default: true },
      ASSIGNMENT_DEADLINE_APPROACHING: { type: Boolean, default: true },
      ASSIGNMENT_OVERDUE: { type: Boolean, default: true },
      STUDENT_PROGRESS_UPDATE: { type: Boolean, default: true },
      PLATFORM_ANNOUNCEMENT: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true,
    collection: 'notification_preferences',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const NotificationPreference = mongoose.models.NotificationPreference || mongoose.model('NotificationPreference', notificationPreferenceSchema);
