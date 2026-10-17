import mongoose from 'mongoose';
import { EMAIL_TEMPLATES } from '../config/constants.js';

const EmailLogSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
    index: true
  },
  orderNumber: {
    type: String,
    default: '',
    index: true
  },
  recipientEmail: {
    type: String,
    required: true,
    index: true
  },
  recipientName: {
    type: String,
    default: ''
  },
  templateType: {
    type: String,
    enum: Object.values(EMAIL_TEMPLATES),
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  brevoMessageId: {
    type: String,
    default: null,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'],
    default: 'PENDING',
    index: true
  },
  retryCount: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('EmailLog', EmailLogSchema);
