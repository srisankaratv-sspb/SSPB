import jwt from 'jsonwebtoken';
import AdminUser from '../models/AdminUser.js';

export const verifyAdminToken = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token found.'
      });
    }

    const secret = process.env.ADMIN_JWT_SECRET || 'super_secret_jwt_key_sri_sankara_tv_2026_dev_mode';
    const decoded = jwt.verify(token, secret);

    const user = await AdminUser.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or has been deactivated.'
      });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
