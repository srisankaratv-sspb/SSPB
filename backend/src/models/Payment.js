import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const PaymentSchema = new mongoose.Schema({
  internalPaymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    default: null,
    index: true
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  amountInPaise: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
    index: true
  },
  method: {
    type: String,
    default: null // e.g. upi, card, netbanking, wallet
  },
  bank: { type: String, default: null },
  wallet: { type: String, default: null },
  vpa: { type: String, default: null },
  email: { type: String, default: null },
  contact: { type: String, default: null },
  errorDetails: {
    code: { type: String, default: null },
    description: { type: String, default: null },
    source: { type: String, default: null },
    step: { type: String, default: null },
    reason: { type: String, default: null }
  },
  webhookEventIds: [{
    type: String
  }],
  rawGatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  isReconciled: {
    type: Boolean,
    default: false
  },
  reconciledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

PaymentSchema.virtual('amountInRupees').get(function () {
  return this.amountInPaise / 100;
});

export default mongoose.model('Payment', PaymentSchema);
