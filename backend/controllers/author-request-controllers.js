import AuthorRequest from "../models/author-request-model.js";
import EmailOtp from "../models/email-otp-model.js";
import { sendVerificationEmail } from "../middlewares/email-verify.js";

const OTP_EXPIRE_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// Public: send OTP to arbitrary email for author request
export const sendAuthorOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
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

    await sendVerificationEmail({ to: email, code });
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
    const updated = await AuthorRequest.findByIdAndUpdate(
      id,
      { status, reviewNote, reviewedBy: req.user?._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Request not found" });
    return res.status(200).json({ success: true, data: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
