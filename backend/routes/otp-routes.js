import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import { sendOtp, verifyOtp } from "../controllers/otp-controllers.js";

const router = express.Router();

// Send OTP for email or phone
router.post("/send", protect, sendOtp);

// Verify OTP for email or phone
router.post("/verify", protect, verifyOtp);

export default router;
