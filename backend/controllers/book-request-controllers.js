import BookRequest from "../models/book-request-model.js";
import { body, validationResult } from "express-validator";

export const validateCreate = () => [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").trim().isEmail().withMessage("valid email is required"),
  body("title").trim().notEmpty().withMessage("title is required"),
  body("author").optional().isString(),
  body("isbn").optional().isString(),
  body("publisher").optional().isString(),
  body("notes").optional().isString(),
];

export const createBookRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, title, author, isbn, publisher, notes } = req.body || {};
    if (!name || !email || !title) {
      return res
        .status(400)
        .json({ success: false, message: "name, email and title are required" });
    }

    const doc = await BookRequest.create({
      user: req.user?._id || undefined,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      title: String(title).trim(),
      author: author ? String(author).trim() : undefined,
      isbn: isbn ? String(isbn).trim() : undefined,
      publisher: publisher ? String(publisher).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
      status: "pending",
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const listBookRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const q = status ? { status } : {};
    const list = await BookRequest.find(q).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

export const updateBookRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body || {};
    if (!id || !status) return res.status(400).json({ success: false, message: "Missing id or status" });
    const allowed = ["pending", "approved", "rejected", "fulfilled"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const updated = await BookRequest.findByIdAndUpdate(
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
