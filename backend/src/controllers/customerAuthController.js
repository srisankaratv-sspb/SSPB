import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

const JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'super_secret_jwt_key_sri_sankara_tv_2026_dev_mode';
const TOKEN_EXPIRY = '30d';

const generateToken = (customer) => {
  return jwt.sign(
    {
      id: customer._id,
      phone: customer.phone,
      email: customer.email,
      name: customer.name
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Enter your full name (at least 2 characters).' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }

    const cleanPhone = phone ? phone.replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '') : '';
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // 2. Check for existing customer by phone or email
    const existing = await Customer.findOne({
      $or: [{ phone: cleanPhone }, { email: cleanEmail }]
    });

    let customer = null;

    if (existing) {
      if (existing.passwordHash) {
        return res.status(409).json({
          success: false,
          message: 'An account with this mobile number or email address already exists. Please sign in.'
        });
      }

      // Existing guest record without a password: update with credentials
      existing.name = name.trim();
      existing.email = cleanEmail;
      existing.phone = cleanPhone;
      existing.passwordHash = await bcrypt.hash(password, 10);
      existing.lastLoginAt = new Date();
      await existing.save();
      customer = existing;
    } else {
      // 3. Hash password and create new Customer
      const passwordHash = await bcrypt.hash(password, 10);
      customer = new Customer({
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        lastLoginAt: new Date()
      });
      await customer.save();
    }

    const token = generateToken(customer);

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Sri Sankara TV!',
      token,
      customer: customer.toSafeJSON()
    });
  } catch (err) {
    console.error('[CustomerAuth] Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create account: ' + err.message
    });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address or 10-digit mobile number.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password.'
      });
    }

    const trimmed = identifier.trim();
    const cleanPhone = trimmed.replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
    const cleanEmail = trimmed.toLowerCase();

    // Query by either email or phone
    const customer = await Customer.findOne({
      $or: [
        { email: cleanEmail },
        { phone: cleanPhone },
        { phone: trimmed }
      ]
    });

    if (!customer || !customer.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'No registered account found with these details. Please create an account first.'
      });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify your credentials and try again.'
      });
    }

    customer.lastLoginAt = new Date();
    await customer.save();

    const token = generateToken(customer);

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully. Welcome back!',
      token,
      customer: customer.toSafeJSON()
    });
  } catch (err) {
    console.error('[CustomerAuth] Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Sign in failed: ' + err.message
    });
  }
};

export const logoutCustomer = async (req, res) => {
  res.clearCookie('customer_token');
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.'
  });
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      customer: req.customer.toSafeJSON()
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { customerId: req.customer._id },
        { 'customer.phone': req.customer.phone },
        { 'customer.email': req.customer.email }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
