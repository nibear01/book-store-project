import express from "express";
import {
  getAllAffiliates,
  getAffiliateById,
  approveAffiliate,
  rejectAffiliate,
  suspendAffiliate,
  updateCommissionRate,
  getAllWithdrawals,
  processWithdrawal,
  getAllCommissions,
  getAffiliateStats,
} from "../controllers/affiliate-admin-controller.js";
import { protect } from "../middlewares/auth-middleware.js";
import { isAdmin } from "../middlewares/admin-middleware.js";

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(isAdmin);

// Stats route (must come before /:id)
router.get("/stats", getAffiliateStats);

// Withdrawal management (must come before /:id)
router.get("/withdrawals", getAllWithdrawals);
router.put("/withdrawals/:id/process", processWithdrawal);

// Commission management (must come before /:id)
router.get("/commissions", getAllCommissions);

// Affiliate management
router.get("/", getAllAffiliates);
router.get("/:id", getAffiliateById);
router.put("/:id/approve", approveAffiliate);
router.put("/:id/reject", rejectAffiliate);
router.put("/:id/suspend", suspendAffiliate);
router.put("/:id/commission-rate", updateCommissionRate);

export default router;
