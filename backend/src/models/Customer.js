import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  passwordHash: {
    type: String,
    default: null
  },
  addresses: [AddressSchema],
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpentInPaise: {
    type: Number,
    default: 0
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  lastOrderAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

CustomerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

CustomerSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    phone: this.phone,
    email: this.email,
    addresses: this.addresses || [],
    totalOrders: this.totalOrders,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt
  };
};

CustomerSchema.virtual('totalSpentInRupees').get(function () {
  return this.totalSpentInPaise / 100;
});

export default mongoose.model('Customer', CustomerSchema);
