import express from 'express';
import { getPublicProduct, getAdminProducts, updateProduct } from '../controllers/productController.js';
import { verifyAdminToken, requireRole } from '../middleware/auth.js';
import { ADMIN_ROLES } from '../config/constants.js';

const router = express.Router();

// Public route
router.get('/', getPublicProduct);
router.get('/:slug', getPublicProduct);

// Protected Admin routes
router.get('/admin/all', verifyAdminToken, getAdminProducts);
router.patch('/admin/:id', verifyAdminToken, requireRole([ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ORDER_MANAGER]), updateProduct);

export default router;
