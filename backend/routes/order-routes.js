// backend/routes/order-routes.js
import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  importOrdersFromCSV
} from '../controllers/order-controllers.js';

import { protect } from '../middlewares/auth-middleware.js';
import { isAdmin } from '../middlewares/admin-middleware.js';

import { upload } from '../middlewares/upload-middleware.js';

const router = express.Router();

// User Routes
router.post('/create', protect, createOrder);
router.get('/my-orders', protect, getUserOrders);
router.get('/details/:id', protect, getOrderById);

// Admin Routes
router.get('/admin/all', protect, isAdmin, getAllOrders);
router.put('/admin/:id/status', protect, isAdmin, updateOrderStatus);
router.post('/admin/import', protect, isAdmin, upload.fields([{ name: 'file', maxCount: 1 }]), importOrdersFromCSV);

// --- ENSURE DEFAULT EXPORT ---
export default router;