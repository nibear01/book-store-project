import express from "express";
import {
  registerAffiliate,
  loginAffiliate,
  getAffiliateProfile,
  updateAffiliateProfile,
  getAffiliateDashboard,
  getAffiliateCommissions,
  requestWithdrawal,
  getAffiliateWithdrawals,
  validatePromoCode,
} from "../controllers/affiliate-controller.js";
import { protectAffiliate, checkAffiliateStatus } from "../middlewares/affiliate-middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerAffiliate);
router.post("/login", loginAffiliate);
router.post("/validate-promo", validatePromoCode);

// Protected affiliate routes
router.get("/me", protectAffiliate, getAffiliateProfile);
router.put("/profile", protectAffiliate, checkAffiliateStatus, updateAffiliateProfile);
router.get("/dashboard", protectAffiliate, checkAffiliateStatus, getAffiliateDashboard);
router.get("/commissions", protectAffiliate, checkAffiliateStatus, getAffiliateCommissions);
router.post("/withdrawals", protectAffiliate, checkAffiliateStatus, requestWithdrawal);
router.get("/withdrawals", protectAffiliate, checkAffiliateStatus, getAffiliateWithdrawals);

export default router;
