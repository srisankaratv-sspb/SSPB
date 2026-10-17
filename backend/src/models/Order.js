import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';

const OrderTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    uppercase: true,
    trim: true 
  },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, default: 'Tamil Nadu', trim: true },
    pincode: { type: String, required: true, trim: true }
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  unitPriceInPaise: {
    type: Number,
    required: true
  },
  subtotalInPaise: {
    type: Number,
    required: true
  },
  deliveryChargeInPaise: {
    type: Number,
    default: 0
  },
  discountInPaise: {
    type: Number,
    default: 0
  },
  totalAmountInPaise: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
    index: true
  },
  orderStatus: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.CREATED,
    index: true
  },
  razorpayOrderId: {
    type: String,
    default: null,
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
  notificationStatus: {
    customerEmailSent: { type: Boolean, default: false },
    adminAlertSent: { type: Boolean, default: false },
    lastEmailSentAt: { type: Date, default: null },
    failureReason: { type: String, default: null }
  },
  tracking: {
    carrier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    dispatchedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null }
  },
  refund: {
    isRefunded: { type: Boolean, default: false },
    amountInPaise: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    refundedAt: { type: Date, default: null },
    razorpayRefundId: { type: String, default: null }
  },
  timeline: [OrderTimelineSchema]
}, {
  timestamps: true
});

OrderSchema.virtual('totalAmountInRupees').get(function () {
  return this.totalAmountInPaise / 100;
});

OrderSchema.virtual('subtotalInRupees').get(function () {
  return this.subtotalInPaise / 100;
});

export default mongoose.model('Order', OrderSchema);
