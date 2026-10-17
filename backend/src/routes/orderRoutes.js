import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createOrder,
  getOrderStatus,
  getCustomerOrders,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  deleteAdminOrder,
  exportOrdersCSV
} from '../controllers/orderController.js';
import { verifyAdminToken, requireRole } from '../middleware/auth.js';
import { verifyCustomerToken, optionalCustomerToken } from '../middleware/customerAuth.js';
import { ADMIN_ROLES } from '../config/constants.js';

const router = express.Router();

const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // max 30 orders per 15 min per IP
  message: { success: false, message: 'Too many order requests. Please try again later.' }
});

// Customer Public Endpoints
router.post('/', orderCreationLimiter, optionalCustomerToken, createOrder);
router.get('/customer/my-orders', getCustomerOrders);
router.get('/:orderNumber/status', getOrderStatus);

// Admin endpoints
router.get('/admin/list', verifyAdminToken, getAdminOrders);
router.get('/admin/export-csv', verifyAdminToken, exportOrdersCSV);
router.get('/admin/:id', verifyAdminToken, getAdminOrderById);
router.patch('/admin/:id/status', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ORDER_MANAGER]), updateOrderStatus);
router.delete('/admin/:id', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ORDER_MANAGER]), deleteAdminOrder);

export default router;
