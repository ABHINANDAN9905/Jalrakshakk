import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: String,
      required: [true, 'actorId is required'],
      index: true
    },
    action: {
      type: String,
      required: [true, 'action is required'],
      index: true
    },
    resource: {
      type: String,
      required: [true, 'resource type is required'],
      index: true
    },
    resourceId: {
      type: String,
      default: null,
      index: true
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
    collection: 'audit_logs',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ actorId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
