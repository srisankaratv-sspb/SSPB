import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ADMIN_ROLES } from '../config/constants.js';

const AdminUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(ADMIN_ROLES),
    default: ADMIN_ROLES.SUPER_ADMIN,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  lastLoginIp: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

AdminUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Safe representation without passwordHash
AdminUserSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt
  };
};

export default mongoose.model('AdminUser', AdminUserSchema);
