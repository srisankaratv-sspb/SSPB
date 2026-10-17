import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/AdminUser.js';
import Customer from '../models/Customer.js';
import EmailLog from '../models/EmailLog.js';
import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import analyticsService from '../services/analyticsService.js';
import brevoService from '../services/brevoService.js';
import { ADMIN_ROLES, PAYMENT_STATUS } from '../config/constants.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await user.save();

    const secret = process.env.ADMIN_JWT_SECRET || 'super_secret_jwt_key_sri_sankara_tv_2026_dev_mode';
    const expiresIn = process.env.ADMIN_JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: user.toSafeJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('admin_token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.adminUser.toSafeJSON()
  });
};

export const getDashboard = async (req, res) => {
  try {
    const data = await analyticsService.getDashboardSummary();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          limit: parseInt(limit, 10)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmailLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await EmailLog.countDocuments(query);
    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          limit: parseInt(limit, 10)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const retryEmailLog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await brevoService.retryEmail(id);
    res.status(200).json({
      success: true,
      message: 'Email retry triggered',
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await AdminUser.find().sort({ createdAt: -1 }).select('-passwordHash');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new AdminUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role || ADMIN_ROLES.ORDER_MANAGER
    });

    await newUser.save();

    await AuditLog.create({
      adminUserId: req.adminUser._id,
      adminEmail: req.adminUser.email,
      action: 'CREATE_ADMIN_USER',
      resourceType: 'ADMIN_USER',
      resourceId: newUser._id.toString(),
      changes: { name: newUser.name, email: newUser.email, role: newUser.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: newUser.toSafeJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, isActive, password } = req.body;

    const user = await AdminUser.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (role && Object.values(ADMIN_ROLES).includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Admin user updated',
      data: user.toSafeJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    let setting = await Setting.findOne({ key });
    if (!setting) {
      setting = new Setting({ key, value, description });
    } else {
      setting.value = value;
      if (description) setting.description = description;
    }

    await setting.save();

    await AuditLog.create({
      adminUserId: req.adminUser._id,
      adminEmail: req.adminUser.email,
      action: 'UPDATE_SETTING',
      resourceType: 'SETTING',
      resourceId: key,
      changes: { key, value },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 25, resourceType, search } = req.query;
    const query = {};

    if (resourceType) {
      query.resourceType = resourceType;
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { adminEmail: searchRegex },
        { action: searchRegex },
        { resourceId: searchRegex }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          limit: parseInt(limit, 10)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRefunds = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = {
      $or: [
        { 'refund.isRefunded': true },
        { paymentStatus: PAYMENT_STATUS.REFUNDED }
      ]
    };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Order.countDocuments(query);
    const refundedOrders = await Order.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: {
        refunds: refundedOrders.map((o) => ({
          orderId: o._id,
          orderNumber: o.orderNumber,
          customerName: o.customer.name,
          customerPhone: o.customer.phone,
          quantity: o.quantity,
          totalAmountInRupees: o.totalAmountInPaise / 100,
          refundedAmountInRupees: (o.refund?.amountInPaise || o.totalAmountInPaise) / 100,
          reason: o.refund?.reason || 'Administrative refund',
          refundedAt: o.refund?.refundedAt || o.updatedAt,
          razorpayRefundId: o.refund?.razorpayRefundId || 'N/A'
        })),
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          limit: parseInt(limit, 10)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getContent = async (req, res) => {
  try {
    const product = await Product.findOne({ isActive: true }) || await Product.findOne();
    const settings = await Setting.find();
    res.status(200).json({
      success: true,
      data: {
        product,
        settings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateContent = async (req, res) => {
  try {
    const { productUpdates, settingUpdates } = req.body;
    let product = await Product.findOne({ isActive: true }) || await Product.findOne();

    if (productUpdates && product) {
      if (productUpdates.name) product.name = productUpdates.name;
      if (productUpdates.tamilTitle) product.tamilTitle = productUpdates.tamilTitle;
      if (productUpdates.description) product.description = productUpdates.description;
      if (productUpdates.eventLocation) product.eventLocation = productUpdates.eventLocation;
      if (productUpdates.contents) product.contents = productUpdates.contents;
      if (productUpdates.temples) product.temples = productUpdates.temples;
      if (productUpdates.certificateConfig) product.certificateConfig = productUpdates.certificateConfig;
      await product.save();
    }

    if (settingUpdates && Array.isArray(settingUpdates)) {
      for (const s of settingUpdates) {
        await Setting.findOneAndUpdate(
          { key: s.key },
          { value: s.value, description: s.description || '' },
          { upsert: true, new: true }
        );
      }
    }

    await AuditLog.create({
      adminUserId: req.adminUser._id,
      adminEmail: req.adminUser.email,
      action: 'UPDATE_WEBSITE_CONTENT',
      resourceType: 'CONTENT',
      resourceId: product ? product._id.toString() : 'GLOBAL',
      changes: { productUpdates, settingUpdates },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Website content updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

