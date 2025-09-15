import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getSalesStats
} from "../controllers/order-controllers.js";
import { protect } from "../middlewares/auth-middleware.js";
import { isAdmin } from "../middlewares/admin-middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Customer routes
router.post("/", createOrder);                    // POST /api/orders - Create new order
router.get("/", getUserOrders);                   // GET /api/orders - Get user's orders
router.get("/:id", getOrderById);                 // GET /api/orders/:id - Get order by ID

// Admin routes
router.get("/admin/all", isAdmin, getAllOrders);              // GET /api/orders/admin/all - Get all orders (admin)
router.get("/admin/stats", isAdmin, getSalesStats);           // GET /api/orders/admin/stats - Get sales stats (admin)
router.put("/:id/status", isAdmin, updateOrderStatus);        // PUT /api/orders/:id/status - Update order status (admin)
router.put("/:id/payment", isAdmin, updatePaymentStatus);     // PUT /api/orders/:id/payment - Update payment status (admin)

export default router;