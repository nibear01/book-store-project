import express from "express";
import {
  sendAuthorOtp,
  verifyAuthorOtp,
  submitAuthorRequest,
  listAuthorRequests,
  updateAuthorRequestStatus,
} from "../controllers/author-request-controllers.js";
import { protect as auth } from "../middlewares/auth-middleware.js";
import { isAdmin as adminOnly } from "../middlewares/admin-middleware.js";

const router = express.Router();

// Public endpoints for form OTP and submission
router.post("/otp/send", sendAuthorOtp);
router.post("/otp/verify", verifyAuthorOtp);
router.post("/submit", submitAuthorRequest);

// Admin endpoints
router.get("/", auth, adminOnly, listAuthorRequests);
router.patch("/:id/status", auth, adminOnly, updateAuthorRequestStatus);

export default router;
