import mongoose from 'mongoose';

export const ACTIVITY_TYPES = [
  'LOGIN',
  'LOGOUT',
  'VIEW_VILLAGE',
  'START_MISSION',
  'COMPLETE_MISSION',
  'APPLY_INTERVENTION',
  'CHAT_WITH_MENTOR',
  'EXPORT_DATA',
  'UPDATE_SETTINGS'
];

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'userId reference is required'],
      index: true
    },
    villageId: {
      type: String,
      required: [true, 'villageId reference is required'],
      index: true
    },
    activityType: {
      type: String,
      required: [true, 'activityType is required'],
      enum: {
        values: ACTIVITY_TYPES,
        message: '{VALUE} is not a valid activity type'
      },
      index: true
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'activity_logs',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for rapid student telemetry queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ villageId: 1, timestamp: -1 });
activityLogSchema.index({ activityType: 1, timestamp: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
