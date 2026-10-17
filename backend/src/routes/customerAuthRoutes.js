import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getMe,
  getMyOrders
} from '../controllers/customerAuthController.js';
import { verifyCustomerToken } from '../middleware/customerAuth.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // max 30 attempts per 15 min per IP
  message: { success: false, message: 'Too many authentication attempts. Please try again after a few minutes.' }
});

router.post('/register', authLimiter, registerCustomer);
router.post('/login', authLimiter, loginCustomer);
router.post('/logout', logoutCustomer);
router.get('/me', verifyCustomerToken, getMe);
router.get('/my-orders', verifyCustomerToken, getMyOrders);

export default router;
