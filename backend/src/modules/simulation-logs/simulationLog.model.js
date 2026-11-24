import mongoose from 'mongoose';

export const SIMULATION_EVENT_TYPES = [
  'TICK',
  'INTERVENTION_ADDED',
  'DROUGHT_TRIGGERED',
  'RUNOFF_SPIKE',
  'CRITICAL_DEPLETION',
  'HARVEST_START',
  'SEASONAL_RESET'
];

const simulationLogSchema = new mongoose.Schema(
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
    simulationRunId: {
      type: String,
      required: [true, 'simulationRunId reference is required'],
      index: true
    },
    eventType: {
      type: String,
      required: [true, 'eventType is required'],
      enum: {
        values: SIMULATION_EVENT_TYPES,
        message: '{VALUE} is not a valid simulation event type'
      },
      index: true
    },
    rainfall: {
      type: Number,
      default: 0,
      min: [0, 'Rainfall cannot be negative']
    },
    recharge: {
      type: Number,
      default: 0,
      min: [0, 'Recharge cannot be negative']
    },
    extraction: {
      type: Number,
      default: 0,
      min: [0, 'Extraction cannot be negative']
    },
    storageIndex: {
      type: Number,
      required: [true, 'storageIndex is required'],
      min: [0, 'storageIndex cannot be below 0.0'],
      max: [1, 'storageIndex cannot exceed 1.0']
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
    collection: 'simulation_logs',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for time-series extraction curves
simulationLogSchema.index({ simulationRunId: 1, timestamp: -1 });
simulationLogSchema.index({ villageId: 1, timestamp: -1 });
simulationLogSchema.index({ eventType: 1, timestamp: -1 });

export const SimulationLog = mongoose.model('SimulationLog', simulationLogSchema);

export default SimulationLog;
