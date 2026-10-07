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
  listWorkflowOrders,
  getWorkflowOrder,
  advanceWorkflowStage,
  getNextWorkflowStages,
} from "../controllers/order-controllers.js";

import { protect, authorize, requireAnyAdminRole } from "../middlewares/auth-middleware.js";
import { uploadCsv } from "../middlewares/upload-middleware.js";

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
  uploadCsv,
  importOrdersFromCSV
);

// Workflow-specific routes (restricted visibility)
router.get(
  "/workflow",
  protect,
  authorize(
    "admin",
    "order_manager",
    "customer_support",
    "finance_manager",
    "printing_manager",
    "delivery_manager"
  ),
  listWorkflowOrders
);
router.get(
  "/workflow/:id",
  protect,
  authorize(
    "admin",
    "order_manager",
    "customer_support",
    "finance_manager",
    "printing_manager",
    "delivery_manager"
  ),
  getWorkflowOrder
);
router.get(
  "/workflow/:id/next-stages",
  protect,
  authorize(
    "admin",
    "order_manager",
    "customer_support",
    "finance_manager",
    "printing_manager",
    "delivery_manager"
  ),
  getNextWorkflowStages
);
router.patch(
  "/workflow/:id/advance",
  protect,
  authorize(
    "admin",
    "order_manager",
    "customer_support",
    "finance_manager",
    "printing_manager",
    "delivery_manager"
  ),
  advanceWorkflowStage
);

export default router;
