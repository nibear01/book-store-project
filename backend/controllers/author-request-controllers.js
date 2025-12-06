import AuthorRequest from "../models/author-request-model.js";
import Author from "../models/author-model.js";
import EmailOtp from "../models/email-otp-model.js";
import nodemailer from "nodemailer";
import { getOtpEmailTemplate, getAuthorWelcomeTemplate } from "../utils/email-templates.js";

const OTP_EXPIRE_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// NEW: cached transporter with env-based SMTP (fallback to Ethereal)
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

// Send author OTP verification email
const sendAuthorVerificationEmail = async ({ to, code }) => {
  const { transporter } = await getMailer();
  const from = process.env.SMTP_FROM || '"BoiBilash" <no-reply@bookstop.app>';
  const html = getOtpEmailTemplate({ code, name: 'Author', lang: 'en' });
  return transporter.sendMail({ from, to, subject: "Verify Your Email - BoiBilash", html });
};

// Author welcome email
const sendAuthorWelcomeEmail = async ({ to, name }) => {
  const { transporter } = await getMailer();
  const from = process.env.SMTP_FROM || '"BoiBilash" <no-reply@bookstop.app>';
  const html = getAuthorWelcomeTemplate({ name: name || "Author", lang: 'en' });
  return transporter.sendMail({ from, to, subject: "Welcome to BoiBilash Authors - Your Request Approved! 🎉", html });
};

// Public: send OTP to arbitrary email for author request
export const sendAuthorOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    const emailExist = await AuthorRequest.findOne({ email, status: { $in: ["pending", "verified"] } });
    if (emailExist) {
      return res.status(400).json({ success: false, message: "Email already used in an existing request" });
    }
    if (!email) return res.status(400).json({ success: false, message: "Email required" });
    // Enforce cooldown by last sent record
    const last = await EmailOtp.findOne({ email }).sort({ sentAt: -1 });
    const now = new Date();
    if (last && now - last.sentAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - last.sentAt)) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${wait}s before resending` });
    }

    const code = generateCode();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRE_MS);
    await EmailOtp.create({ email, code, sentAt: now, expiresAt });

    await sendAuthorVerificationEmail({ to: email, code });
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// Public: verify OTP for author request
export const verifyAuthorOtp = async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ success: false, message: "Email and code required" });
    const rec = await EmailOtp.findOne({ email }).sort({ sentAt: -1 });
    if (!rec) return res.status(400).json({ success: false, message: "No code sent" });
    if (rec.expiresAt < new Date()) return res.status(400).json({ success: false, message: "Code expired" });
    if (rec.code !== String(code).trim()) return res.status(400).json({ success: false, message: "Invalid code" });
    return res.status(200).json({ success: true, verified: true });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// Public: submit author request (requires verified email client-side)
export const submitAuthorRequest = async (req, res) => {
  try {
    const payload = req.body || {};
    // Basic server-side checks
    if (!payload.fullName || !payload.email || !payload.title || !payload.abstract) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const doc = await AuthorRequest.create({
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      address: {
        street: payload.addressStreet,
        city: payload.addressCity,
        state: payload.addressState,
        zip: payload.addressZip,
        country: payload.addressCountry,
      },
      affiliation: payload.affiliation,
      title: payload.title,
      typeOfWork: payload.typeOfWork,
      abstract: payload.abstract,
      categoryType: payload.categoryType,
      rightsOriginal: !!payload.rightsOriginal,
      rightsPublish: !!payload.rightsPublish,
      agreeEditorial: !!payload.agreeEditorial,
      additionalRequests: payload.additionalRequests,
      signature: payload.signature,
      date: payload.date,
      status: "pending",
      emailVerified: !!payload.emailVerified,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// Admin: list requests with filters
export const listAuthorRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const q = status ? { status } : {};
    const list = await AuthorRequest.find(q).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// Admin: update status and add review note
export const updateAuthorRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body || {};
    if (!id || !status) return res.status(400).json({ success: false, message: "Missing id or status" });
    const allowed = ["unverified", "pending", "verified", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    // NEW: detect transition to "verified"
    const existing = await AuthorRequest.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Request not found" });
    const willVerify = existing.status !== "verified" && status === "verified";

    const updated = await AuthorRequest.findByIdAndUpdate(
      id,
      { status, reviewNote, reviewedBy: req.user?._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Request not found" });

    // NEW: send welcome email on transition
    let welcomePreview;
    if (willVerify && updated.email) {
      try {
        const info = await sendAuthorWelcomeEmail({ to: updated.email, name: updated.fullName });
        welcomePreview = nodemailer.getTestMessageUrl?.(info);
      } catch (e) {
        // Do not block; optionally log
      }
    }

    return res.status(200).json({
      success: true,
      data: updated,
      ...(welcomePreview ? { welcomePreview } : {}),
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// Admin: convert an author request into an Author and remove the request
export const convertAuthorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqDoc = await AuthorRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ success: false, message: "Request not found" });

    // Map request fields to Author
    const authorPayload = {
      name: reqDoc.fullName,
      title: reqDoc.title || "Author",
      bio: reqDoc.abstract || "",
      status: "verified",
    };

    const created = await Author.create(authorPayload);

    // Remove request after successful author creation
    await AuthorRequest.findByIdAndDelete(reqDoc._id);

    return res.status(201).json({ success: true, data: created, removedRequestId: String(reqDoc._id) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// Admin: delete an author request
export const deleteAuthorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await AuthorRequest.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Request not found" });
    return res.status(200).json({ success: true, deleted: true, data: { _id: String(id) } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
