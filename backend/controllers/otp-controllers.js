import User from "../models/user-model.js";
import EmailOtp from "../models/email-otp-model.js";
import nodemailer from "nodemailer";
import { sendVerificationEmail } from "../middlewares/email-verify.js";

// Generate a 6-digit code
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// Cached transporter (uses real SMTP if provided, otherwise Ethereal for dev)
let cachedTransporter = null;
let cachedIsTest = false;
const getMailer = async () => {
  if (cachedTransporter) return { transporter: cachedTransporter, isTest: cachedIsTest };

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE = "false",
  } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    cachedIsTest = false;
    return { transporter: cachedTransporter, isTest: cachedIsTest };
  }

  // Fallback to Ethereal for dev/testing
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  cachedIsTest = true;
  return { transporter: cachedTransporter, isTest: cachedIsTest };
};

import { getWelcomeEmailTemplate } from "../utils/email-templates.js";

// Send a simple welcome email (real SMTP if configured, else Ethereal preview)
const sendWelcomeEmail = async ({ to, name }) => {
  const { transporter } = await getMailer();
  const from = process.env.SMTP_FROM || '"BoiBilash" <no-reply@bookstop.app>';
  const html = getWelcomeEmailTemplate({ name: name || 'Reader', lang: 'en' });

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Welcome to BoiBilash! 🎉",
    html,
  });

  return info;
};

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
      // Create OTP document
      const otpDoc = new EmailOtp({
        email,
        code,
        sentAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      });
      await otpDoc.save();

      // Update user sent time
      user.verifiedCodeSentAt = now;
      await user.save();

      let info;
      try {
        info = await sendVerificationEmail({ to: email, code, name: user.name });
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
        .json({ success: true, message: "OTP sent to phone (mock)" });
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

    if (email) {
      // Verify email OTP
      const otpDoc = await EmailOtp.findOne({ email, code });
      if (!otpDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid verification code" });
      }
      if (otpDoc.expiresAt < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Verification code expired" });
      }
      // Delete OTP data
      await EmailOtp.deleteOne({ _id: otpDoc._id });
      // Mark verified
      user.isVerified = true;
      await user.save();
    } else if (phone) {
      // Verify phone OTP (stored on user)
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
      // Mark verified and clear OTP data
      user.isVerified = true;
      user.verifiedCode = null;
      user.verifiedCodeSentAt = null;
      user.verifiedCodeExpires = null;
      await user.save();
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Email or phone is required" });
    }

    // Try sending welcome email (non-blocking for verification flow)
    let welcomePreview;
    const toEmail = (user.email || req.body?.email || "").trim();
    if (toEmail) {
      try {
        const info = await sendWelcomeEmail({ to: toEmail });
        welcomePreview = nodemailer.getTestMessageUrl?.(info) || undefined;
      } catch (e) {
        // Silently ignore email errors; verification already succeeded
      }
    }

    return res.status(200).json({
      success: true,
      message: "Verification successful",
      ...(welcomePreview ? { welcomePreview } : {}),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};
