import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    agentId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    telephonyCallId: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ['twilio', 'simulator'],
      default: 'simulator',
    },
    fromPhone: {
      type: String,
      default: '+15005550006',
    },
    toPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer', 'canceled'],
      default: 'queued',
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    recordingUrl: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Call = mongoose.model('Call', callSchema);
