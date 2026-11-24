import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant', 'system']
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true
    },
    hydroContext: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true
    },
    sessionId: {
      type: String,
      required: [true, 'sessionId is required'],
      unique: true,
      index: true
    },
    villageId: {
      type: String,
      default: null,
      index: true
    },
    topic: {
      type: String,
      default: 'General Groundwater Conservation & Hydrogeology'
    },
    messages: [messageSchema],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    collection: 'conversations',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
