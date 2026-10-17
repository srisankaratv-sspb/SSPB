import express from 'express';
import {
  verifyPayment,
  handleWebhook,
  getAdminPayments,
  reconcilePayment,
  refundPayment
} from '../controllers/paymentController.js';
import { verifyAdminToken, requireRole } from '../middleware/auth.js';
import { ADMIN_ROLES } from '../config/constants.js';

const router = express.Router();

// Public endpoints
router.post('/verify', verifyPayment);
router.post('/webhook', handleWebhook);

// Admin endpoints
router.get('/admin/list', verifyAdminToken, getAdminPayments);
router.post('/admin/:id/reconcile', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ORDER_MANAGER]), reconcilePayment);
router.post('/admin/:id/refund', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN]), refundPayment);

export default router;
