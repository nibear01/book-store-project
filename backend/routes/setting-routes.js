import express from "express";
import { protect, authorize, requireAnyAdminRole } from "../middlewares/auth-middleware.js";
import { 
  getPriceRange, 
  updatePriceRange, 
  getPrintConfig, 
  updatePrintConfig, 
  getDeliveryCost, 
  updateDeliveryCost,
  getProfileSettings,
  updateProfileSettings
} from "../controllers/setting-controllers.js";

const router = express.Router();

// Profile settings - accessible to all admin roles
router.get("/profile", protect, requireAnyAdminRole, getProfileSettings);
router.put("/profile", protect, requireAnyAdminRole, updateProfileSettings);

// Price range - accessible to admin and book_manager
router.get("/price-range", getPriceRange);
router.put("/price-range", protect, authorize("admin", "book_manager"), updatePriceRange);

// Print pricing configuration - accessible to admin and book_manager
router.get("/print-config", getPrintConfig);
router.put("/print-config", protect, authorize("admin", "book_manager"), updatePrintConfig);

// Delivery cost configuration - accessible to admin and book_manager
router.get("/delivery-cost", getDeliveryCost);
router.put("/delivery-cost", protect, authorize("admin", "book_manager"), updateDeliveryCost);

export default router;
