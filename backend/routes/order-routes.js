// server/routes/orderRoutes.js
import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  importOrdersFromCSV
} from '../controllers/orderController.js';
import { auth, adminAuth } from '../middleware/auth.js'; // Import middleware
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure Multer for CSV upload (adjust destination as needed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});
const upload = multer({ storage: storage, fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Only CSV files are allowed!'), false);
    }
}});

// User Routes
router.post('/', auth, createOrder); // Create new order
router.get('/my-orders', auth, getUserOrders); // Get user's orders
router.get('/:id', auth, getOrderById); // Get specific order (user or admin)

// Admin Routes
router.get('/', adminAuth, getAllOrders); // Get all orders with filters
router.put('/:id/status', adminAuth, updateOrderStatus); // Update order status
router.post('/import', adminAuth, upload.single('csvFile'), importOrdersFromCSV); // Import from CSV

export default router;
