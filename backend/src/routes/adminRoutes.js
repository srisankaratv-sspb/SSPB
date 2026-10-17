import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  logout,
  getMe,
  getDashboard,
  getCustomers,
  getEmailLogs,
  retryEmailLog,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  getSettings,
  updateSetting,
  getAuditLogs,
  getRefunds,
  getContent,
  updateContent
} from '../controllers/adminController.js';
import { verifyAdminToken, requireRole } from '../middleware/auth.js';
import { ADMIN_ROLES } from '../config/constants.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Authentication routes
router.post('/auth/login', loginLimiter, login);
router.post('/auth/logout', logout);
router.get('/auth/me', verifyAdminToken, getMe);

// Dashboard & Analytics
router.get('/dashboard', verifyAdminToken, getDashboard);

// Customers
router.get('/customers', verifyAdminToken, getCustomers);

// Email Logs
router.get('/email-logs', verifyAdminToken, getEmailLogs);
router.post('/email-logs/:id/retry', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ORDER_MANAGER]), retryEmailLog);

// Refunds List
router.get('/refunds', verifyAdminToken, getRefunds);

// Audit Logs (Super Admin only)
router.get('/audit-logs', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN]), getAuditLogs);

// Website Content Management
router.get('/content', verifyAdminToken, getContent);
router.patch('/content', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ORDER_MANAGER]), updateContent);

// User Management (Super Admin only)
router.get('/users', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN]), getAdminUsers);
router.post('/users', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN]), createAdminUser);
router.patch('/users/:id', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN]), updateAdminUser);

// Settings
router.get('/settings', verifyAdminToken, getSettings);
router.patch('/settings/:key', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN]), updateSetting);

export default router;
