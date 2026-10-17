import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null,
    index: true
  },
  adminEmail: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    required: true,
    index: true // e.g. 'ORDER', 'PAYMENT', 'PRODUCT', 'SETTING', 'ADMIN_USER'
  },
  resourceId: {
    type: String,
    default: null,
    index: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('AuditLog', AuditLogSchema);
