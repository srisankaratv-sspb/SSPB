import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';

export const verifyCustomerToken = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.customer_token) {
      token = req.cookies.customer_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in or create an account to place your order.'
      });
    }

    const secret = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'super_secret_jwt_key_sri_sankara_tv_2026_dev_mode';
    const decoded = jwt.verify(token, secret);

    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Please sign in again.'
      });
    }

    req.customer = customer;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired or is invalid. Please sign in again.'
    });
  }
};

export const optionalCustomerToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.customer_token) {
      token = req.cookies.customer_token;
    }

    if (token) {
      const secret = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'super_secret_jwt_key_sri_sankara_tv_2026_dev_mode';
      const decoded = jwt.verify(token, secret);
      const customer = await Customer.findById(decoded.id);
      if (customer) {
        req.customer = customer;
      }
    }
    next();
  } catch (err) {
    // Non-blocking: continue as guest if token is missing or invalid
    next();
  }
};
