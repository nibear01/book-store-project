import User from "../models/user-model.js";
import nodemailer from "nodemailer";
import { sendVerificationEmail } from "../middlewares/email-verify.js";

// Generate a 6-digit code
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const sendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body || {};
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // If already verified, short-circuit and don't send a new code
    if (user.isVerified) {
      return res
        .status(200)
        .json({ success: true, message: "Email already verified" });
    }

    const code = generateCode();

    if (email) {
      // Enforce resend cooldown (60s)
      const now = new Date();
      if (
        user.verifiedCodeSentAt &&
        now - user.verifiedCodeSentAt < 60 * 1000
      ) {
        const wait = Math.ceil(
          (60 * 1000 - (now - user.verifiedCodeSentAt)) / 1000
        );
        return res.status(429).json({
          success: false,
          message: `Please wait ${wait}s before resending`,
        });
      }
      // store code on user and send mail with expiry (10 min)
      user.verifiedCode = code;
      user.verifiedCodeSentAt = now;
      user.verifiedCodeExpires = new Date(now.getTime() + 10 * 60 * 1000);
      await user.save();

      let info;
      try {
        info = await sendVerificationEmail({ to: email, code });
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: `Failed to send email: ${e.message}`,
        });
      }

      // Ethereal preview URL available in info (when using ethereal)
      return res.status(200).json({
        success: true,
        message: "OTP sent to email",
        preview: nodemailer.getTestMessageUrl?.(info),
      });
    }

    if (phone) {
      const now = new Date();
      if (
        user.verifiedCodeSentAt &&
        now - user.verifiedCodeSentAt < 60 * 1000
      ) {
        const wait = Math.ceil(
          (60 * 1000 - (now - user.verifiedCodeSentAt)) / 1000
        );
        return res.status(429).json({
          success: false,
          message: `Please wait ${wait}s before resending`,
        });
      }
      // For now: pretend to send SMS (could integrate later)
      user.verifiedCode = code;
      user.verifiedCodeSentAt = now;
      user.verifiedCodeExpires = new Date(now.getTime() + 10 * 60 * 1000);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "OTP sent to phone (mock)", code });
    }

    return res
      .status(400)
      .json({ success: false, message: "Email or phone is required" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, phone, code } = req.body || {};
    const userId = req.user?._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    // If already verified, return success idempotently
    const already = await User.findById(userId);
    if (already?.isVerified) {
      return res.status(200).json({ success: true, message: "Already verified" });
    }
    if (!code)
      return res
        .status(400)
        .json({ success: false, message: "Code is required" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.verifiedCode || user.verifiedCode !== String(code).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }
    if (user.verifiedCodeExpires && user.verifiedCodeExpires < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired" });
    }

    // Mark verified
    user.isVerified = true;
    user.verifiedCode = null;
    user.verifiedCodeSentAt = null;
    user.verifiedCodeExpires = null;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Verification successful" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};
