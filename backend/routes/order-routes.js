// backend/routes/order-routes.js
import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  importOrdersFromCSV,
  deleteOrder,
  getOrderStats,
} from "../controllers/order-controllers.js";

import { protect, authorize, requireAnyAdminRole } from "../middlewares/auth-middleware.js";
import { upload } from "../middlewares/upload-middleware.js";

const router = express.Router();

// User Routes
router.post("/create", protect, createOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/details/:id", protect, getOrderById);

// Admin & Order Manager Routes
router.get("/admin/all", protect, authorize("admin", "order_manager"), getAllOrders);
// Dashboard stats should be visible to any non-"user" role (admin, managers, author)
router.get("/admin/stats", protect, requireAnyAdminRole, getOrderStats);
router.put(
  "/admin/:id/status",
  protect,
  authorize("admin", "order_manager"),
  updateOrderStatus
);
router.delete(
  "/admin/:id",
  protect,
  authorize("admin", "order_manager"),
  deleteOrder
); // allow order managers to delete
router.post(
  "/admin/import",
  protect,
  authorize("admin", "order_manager"),
  upload.fields([{ name: "file", maxCount: 1 }]),
  importOrdersFromCSV
);

export default router;
