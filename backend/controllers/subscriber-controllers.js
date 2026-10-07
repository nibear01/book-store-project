import Subscriber from "../models/subscriber-model.js";
import { escapeRegex } from "../utils/escape-regex.js";
import { NewsletterSubject, EmailObserver } from "../utils/newsletter.js";
import { getNewsletterTemplate } from "../utils/email-templates.js";

// Small helpers
const normalizeEmail = (e) =>
  String(e || "")
    .trim()
    .toLowerCase();
const normalizeName = (n) => String(n || "").trim();
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || ""));

// POST /api/subscribers
export const subscribe = async (req, res) => {
  try {
    const rawEmail = normalizeEmail(req.body?.email);
    const rawName = normalizeName(req.body?.name);

    if (!rawName) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    if (!isEmail(rawEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid email is required" });
    }

    // Detect if already exists before upsert
    const existed = await Subscriber.findOne({ email: rawEmail })
      .select("_id")
      .lean();

    // Upsert subscriber: if exists, (re)activate and update name
    const subDoc = await Subscriber.findOneAndUpdate(
      { email: rawEmail },
      { $set: { name: rawName, active: true }, $unset: { unsubscribedAt: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const sub = subDoc?.toObject ? subDoc.toObject() : subDoc;

    const statusCode = existed ? 200 : 201;
    return res
      .status(statusCode)
      .json({ success: true, data: sub, meta: { alreadyExisted: !!existed } });
  } catch (err) {
    // Handle duplicate key gracefully
    if (err?.code === 11000) {
      return res
        .status(200)
        .json({ success: true, message: "Already subscribed" });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// GET /api/subscribers (admin)
export const listSubscribers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || "20", 10))
    );
    const search = String(req.query.search || "").trim();
    const q = {};
    if (search) {
      q.$or = [
        { email: { $regex: escapeRegex(search), $options: "i" } },
        { name: { $regex: escapeRegex(search), $options: "i" } },
      ];
    }
    const [items, total] = await Promise.all([
      Subscriber.find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Subscriber.countDocuments(q),
    ]);
    return res.json({ success: true, data: { items, total, page, limit } });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// DELETE /api/subscribers/:id (admin) - hard delete from database
export const removeSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const subDoc = await Subscriber.findByIdAndDelete(id);
    const sub = subDoc?.toObject ? subDoc.toObject() : subDoc;
    if (!sub)
      return res
        .status(404)
        .json({ success: false, message: "Subscriber not found" });
    return res.json({ success: true, data: sub });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// POST /api/subscribers/notify (admin) - broadcast to all active
export const notifyAllSubscribers = async (req, res) => {
  try {
    const { subject, text, html } = req.body || {};
    if (!subject || typeof subject !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Email subject is required" });
    }
    const activeSubs = await Subscriber.find({ active: true })
      .select("email name")
      .lean();
    const subjectSvc = new NewsletterSubject();
    activeSubs.forEach((s) =>
      subjectSvc.attach(new EmailObserver({ email: s.email, name: s.name }))
    );

    // Use beautiful email template
    const styledHtml = getNewsletterTemplate({
      subject,
      text: text || "",
      html: html || null,
      unsubscribeLink: null // Add unsubscribe link if needed
    });

    const summary = await subjectSvc.notify({ subject, text, html: styledHtml });
    return res.json({ success: true, data: summary });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

// POST /api/subscribers/:id/notify (admin) - send to one
export const notifySubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, text, html } = req.body || {};
    if (!subject || typeof subject !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Email subject is required" });
    }
    const sub = await Subscriber.findById(id).lean();
    if (!sub || !sub.active) {
      return res
        .status(404)
        .json({ success: false, message: "Active subscriber not found" });
    }
    const subjectSvc = new NewsletterSubject();
    subjectSvc.attach(new EmailObserver({ email: sub.email, name: sub.name }));
    
    // Use beautiful email template
    const styledHtml = getNewsletterTemplate({
      subject,
      text: text || "",
      html: html || null,
      unsubscribeLink: null
    });
    
    const summary = await subjectSvc.notify({ subject, text, html: styledHtml });
    return res.json({ success: true, data: summary });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export default {
  subscribe,
  listSubscribers,
  removeSubscriber,
  notifyAllSubscribers,
  notifySubscriber,
};
