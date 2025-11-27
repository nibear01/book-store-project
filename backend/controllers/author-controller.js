import Author from "../models/author-model.js";
import fs from "fs";
import path from "path";
import Book from "../models/book-model.js";
// NEW: fs/promises for cleanup
import fsp from "fs/promises";
// NEW: id validation
import mongoose from "mongoose";

// Create
export const createAuthor = async (req, res) => {
  try {
    const {
      name,
      bio,
      photo,
      books = [],
      title,
      status,
      dob,
    } = req.body;

    if (!name || !title) {
      return res.status(400).json({ message: "name and title are required" });
    }

    const effectiveStatus = status || "verified";
    const photoPath = req.file?.filename ? `uploads/images/authors/${req.file.filename}` : photo;

    // safe dob parse
    let parsedDob = null;
    if (dob) {
      const d = new Date(dob);
      if (!isNaN(d.getTime())) parsedDob = d;
    }

    const author = await Author.create({
      name,
      title,
      bio,
      photo: photoPath,
      books,
      status: effectiveStatus,
      ...(parsedDob && { dob: parsedDob }),
    });
    const populated = await author.populate("books");
    res.status(201).json(populated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Read all
export const getAuthors = async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { title: regex }];
    }
    const authors = await Author.find(filter).populate("books");
    res.json(authors);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Read one
export const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id).populate("books");
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Read one by slug
export const getAuthorBySlug = async (req, res) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug }).populate("books");
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Update
export const updateAuthor = async (req, res) => {
  try {
    const { name, bio, photo, books, title, status, dob } = req.body;

    // If a new file uploaded, delete the old file if any
    let newPhotoPath;
    if (req.file?.filename) {
      newPhotoPath = `uploads/images/authors/${req.file.filename}`;
      try {
        const prev = await Author.findById(req.params.id).select("photo");
        if (prev?.photo) {
          // CHANGED: use safe local deletion
          await deleteLocalFileSafe(prev.photo);
        }
      } catch {
        // ignore cleanup errors
      }
    }

    const set = {
      ...(name !== undefined && { name }),
      ...(title !== undefined && { title }),
      ...(bio !== undefined && { bio }),
      ...(books !== undefined && { books }),
      ...((newPhotoPath ?? photo) !== undefined && { photo: newPhotoPath ?? photo }),
      ...(status !== undefined && { status }),
      ...(dob !== undefined && (() => {
        if (!dob) return { dob: null };
        const d = new Date(dob);
        return isNaN(d.getTime()) ? {} : { dob: d };
      })()),
    };

    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { $set: set },
      { new: true, runValidators: true }
    ).populate("books");
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Delete
export const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    // NEW: validate id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid author id" });
    }

    // NEW: soft delete support (?hard=false)
    const doHardDelete = String(hard ?? "true").toLowerCase() !== "false";

    if (!doHardDelete) {
      const updated = await Author.findByIdAndUpdate(
        id,
        { $set: { status: "cancelled" } },
        { new: true, runValidators: true }
      ).populate("books");
      if (!updated) return res.status(404).json({ message: "Author not found" });
      return res.json({ message: "Author deactivated", data: updated });
    }

    // Hard delete + cleanup
    const author = await Author.findByIdAndDelete(id);
    if (!author) return res.status(404).json({ message: "Author not found" });

    // delete local photo file if present
    if (author.photo) {
      await deleteLocalFileSafe(author.photo);
    }

    res.json({ message: "Author permanently deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Add a book to author
export const addBookToAuthor = async (req, res) => {
  try {
    const { bookId } = req.body;
    const authorId = req.params.id;
    if (!bookId) return res.status(400).json({ message: "bookId is required" });

    const existingBook = await Book.findById(bookId).select("_id");
    if (!existingBook) return res.status(404).json({ message: "Book not found" });

    await Author.updateMany({ _id: { $ne: authorId }, books: bookId }, { $pull: { books: bookId } });

    const author = await Author.findByIdAndUpdate(
      authorId,
      { $addToSet: { books: bookId } },
      { new: true }
    ).populate("books");
    if (!author) return res.status(404).json({ message: "Author not found" });

    await Book.findByIdAndUpdate(bookId, { $set: { author: author.name } }, { new: true });

    res.json(author);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Remove a book from author
export const removeBookFromAuthor = async (req, res) => {
  try {
    const { bookId } = req.params;
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { $pull: { books: bookId } },
      { new: true }
    ).populate("books");
    if (!author) return res.status(404).json({ message: "Author not found" });

    // If the book is no longer linked to any author, clear its author field
    const stillLinked = await Author.exists({ books: bookId });
    if (!stillLinked) {
      await Book.findByIdAndUpdate(bookId, { $set: { author: "" } });
    }

    res.json(author);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Keep status endpoint (email verification removed with simplified model)
export const setAuthorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["unverified", "pending", "verified", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowed.join(", ")}` });
    }
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate("books");
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// NEW: Verify/toggle author email
export const verifyAuthorEmail = async (req, res) => {
  try {
    const { emailVerified = true } = req.body;
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { $set: { emailVerified: !!emailVerified } },
      { new: true, runValidators: true }
    ).populate("books");
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// NEW: Add/update review details
export const reviewAuthor = async (req, res) => {
  try {
    const { reviewNote, reviewedAt } = req.body;
    const set = {
      ...(reviewNote !== undefined && { reviewNote }),
      reviewedBy: req.user?._id,
      reviewedAt: reviewedAt ? new Date(reviewedAt) : new Date(),
    };
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { $set: set },
      { new: true, runValidators: true }
    ).populate("books");
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// NEW: local uploads root and safe deletion helpers
const uploadsRoot = path.resolve(process.cwd(), "uploads");
const isHttpUrl = (s) => typeof s === "string" && /^https?:\/\//i.test(s);
const toAbsoluteIfLocal = (p) => {
  if (!p || isHttpUrl(p)) return null;
  const rel = String(p).replace(/^\/+/, "");
  const abs = path.resolve(process.cwd(), rel);
  if (!abs.startsWith(uploadsRoot)) return null;
  return abs;
};
const deleteLocalFileSafe = async (p) => {
  const abs = toAbsoluteIfLocal(p);
  if (!abs) return;
  try {
    await fsp.unlink(abs);
  } catch {
    // ignore
  }
};
