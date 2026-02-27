import Publisher from "../models/publisher-model.js";
import Book from "../models/book-model.js";
import mongoose from "mongoose";
import path from "path";
import fsp from "fs/promises";

// Local uploads root and safe deletion helpers
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

// Create Publisher
export const createPublisher = async (req, res) => {
  try {
    const { name, description, country, website, founded_year, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Publisher name is required" });
    }

    const logoPath = req.file?.filename 
      ? `uploads/images/publishers/${req.file.filename}` 
      : req.body.logo || "";

    // Parse founded_year
    let parsedYear = null;
    if (founded_year) {
      const year = Number(founded_year);
      if (Number.isInteger(year) && year > 0 && year <= new Date().getFullYear()) {
        parsedYear = year;
      }
    }

    // Parse is_active
    const active = is_active !== undefined 
      ? String(is_active).toLowerCase() === "true" || is_active === true 
      : true;

    const publisher = await Publisher.create({
      name: name.trim(),
      description: description || "",
      logo: logoPath,
      country: country || "",
      website: website || "",
      founded_year: parsedYear,
      is_active: active,
    });

    const populated = await Publisher.findById(publisher._id).populate("books");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all Publishers
export const getPublishers = async (req, res) => {
  try {
    const { status, q, country, limit, page, publisher_id } = req.query;
    
    const filter = {};
    
    // Filter by publisher_id if provided
    if (publisher_id && publisher_id.trim()) {
      filter.publisher_id = publisher_id.trim();
    }
    
    // Status filter (active/inactive/all)
    if (status) {
      const statusVal = String(status).toLowerCase();
      if (statusVal === "active") filter.is_active = true;
      else if (statusVal === "inactive") filter.is_active = false;
      // "all" means no filter
    } else {
      // Default: show only active publishers
      filter.is_active = true;
    }
    
    // Search by name or description
    if (q && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { name: regex },
        { description: regex },
      ];
    }
    
    // Filter by country
    if (country && country.trim()) {
      const escapedCountry = country.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.country = new RegExp(escapedCountry, "i");
    }

    // Pagination
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 50));

    const total = await Publisher.countDocuments(filter);
    const publishers = await Publisher.find(filter)
      .populate("books")
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    res.json({
      success: true,
      data: publishers,
      pagination: {
        total,
        page: p,
        pages: Math.ceil(total / l) || 1,
        limit: l,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Publisher by ID
export const getPublisherById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid publisher ID" });
    }

    const publisher = await Publisher.findById(id).populate("books");
    
    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }
    
    res.json({ success: true, data: publisher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Publisher by Slug
export const getPublisherBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ success: false, message: "Invalid publisher slug" });
    }

    const publisher = await Publisher.findOne({ slug }).populate("books");
    
    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }
    
    res.json({ success: true, data: publisher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update Publisher
export const updatePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid publisher ID" });
    }

    const { name, description, country, website, founded_year, is_active, logo } = req.body;

    // If a new file uploaded, delete the old file if any
    let newLogoPath;
    if (req.file?.filename) {
      newLogoPath = `uploads/images/publishers/${req.file.filename}`;
      try {
        const prev = await Publisher.findById(id).select("logo");
        if (prev?.logo) {
          await deleteLocalFileSafe(prev.logo);
        }
      } catch {
        // ignore cleanup errors
      }
    }

    // Build update object
    const set = {};
    
    if (name !== undefined && name.trim()) set.name = name.trim();
    if (description !== undefined) set.description = description;
    if (country !== undefined) set.country = country;
    if (website !== undefined) set.website = website;
    if (newLogoPath !== undefined || logo !== undefined) {
      set.logo = newLogoPath || logo || "";
    }
    
    if (founded_year !== undefined) {
      if (founded_year === null || founded_year === "") {
        set.founded_year = null;
      } else {
        const year = Number(founded_year);
        if (Number.isInteger(year) && year > 0 && year <= new Date().getFullYear()) {
          set.founded_year = year;
        }
      }
    }
    
    if (is_active !== undefined) {
      set.is_active = String(is_active).toLowerCase() === "true" || is_active === true;
    }

    const publisher = await Publisher.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: true }
    ).populate("books");
    
    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }
    
    res.json({ success: true, data: publisher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Publisher
export const deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid publisher ID" });
    }

    // Soft delete by default (?hard=true for permanent delete)
    const doHardDelete = String(hard ?? "false").toLowerCase() === "true";

    if (!doHardDelete) {
      // Soft delete: set is_active to false
      const updated = await Publisher.findByIdAndUpdate(
        id,
        { $set: { is_active: false } },
        { new: true, runValidators: true }
      ).populate("books");
      
      if (!updated) {
        return res.status(404).json({ success: false, message: "Publisher not found" });
      }
      
      return res.json({ success: true, message: "Publisher deactivated", data: updated });
    }

    // Hard delete: permanently remove from database
    const publisher = await Publisher.findByIdAndDelete(id);
    
    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }

    // Delete logo file if present
    if (publisher.logo) {
      await deleteLocalFileSafe(publisher.logo);
    }

    // Remove publisher reference from all books
    await Book.updateMany(
      { publisher_id: id },
      { $unset: { publisher_id: "" } }
    );

    res.json({ success: true, message: "Publisher permanently deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Add a book to publisher
export const addBookToPublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookId } = req.body;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid publisher ID" });
    }
    
    if (!bookId || !mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: "Valid bookId is required" });
    }

    // Check if book exists
    const existingBook = await Book.findById(bookId).select("_id");
    if (!existingBook) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Remove book from other publishers
    await Publisher.updateMany(
      { _id: { $ne: id }, books: bookId },
      { $pull: { books: bookId } }
    );

    // Add book to this publisher
    const publisher = await Publisher.findByIdAndUpdate(
      id,
      { $addToSet: { books: bookId } },
      { new: true }
    ).populate("books");
    
    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }

    // Update book's publisher field
    await Book.findByIdAndUpdate(
      bookId,
      { 
        $set: { 
          publisher: publisher.name,
          publisher_id: publisher._id
        } 
      }
    );

    res.json({ success: true, data: publisher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Remove a book from publisher
export const removeBookFromPublisher = async (req, res) => {
  try {
    const { id, bookId } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid publisher ID" });
    }
    
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: "Invalid book ID" });
    }

    const publisher = await Publisher.findByIdAndUpdate(
      id,
      { $pull: { books: bookId } },
      { new: true }
    ).populate("books");
    
    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }

    // Check if book is linked to any other publisher
    const stillLinked = await Publisher.exists({ books: bookId });
    if (!stillLinked) {
      // Clear publisher fields from book
      await Book.findByIdAndUpdate(
        bookId,
        { 
          $set: { publisher: "" },
          $unset: { publisher_id: "" }
        }
      );
    }

    res.json({ success: true, data: publisher });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get books by publisher (by ID, slug, or publisher_id)
export const getBooksByPublisher = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be ObjectId, slug, or publisher_id
    const { page, limit, status } = req.query;

    // Determine if identifier is an ObjectId, publisher_id (6-digit), or slug
    let publisher;
    if (mongoose.isValidObjectId(identifier)) {
      publisher = await Publisher.findById(identifier).select("_id name slug publisher_id");
    } else if (/^\d{6}$/.test(identifier)) {
      // 6-digit number - publisher_id
      publisher = await Publisher.findOne({ publisher_id: identifier }).select("_id name slug publisher_id");
    } else {
      // Assume it's a slug
      publisher = await Publisher.findOne({ slug: identifier }).select("_id name slug publisher_id");
    }

    if (!publisher) {
      return res.status(404).json({ success: false, message: "Publisher not found" });
    }

    // Build filter for books
    const filter = { publisher_id: publisher._id };
    
    // Status filter
    const statusVal = String(status || "active").toLowerCase();
    if (statusVal === "inactive") filter.is_active = false;
    else if (statusVal === "all") {
      // no is_active filter
    } else filter.is_active = true;

    // Pagination
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));

    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .populate("publisher_id", "name slug logo country website")
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    res.json({
      success: true,
      data: books,
      publisher: {
        _id: publisher._id,
        publisher_id: publisher.publisher_id,
        name: publisher.name,
        slug: publisher.slug,
      },
      pagination: {
        total,
        page: p,
        pages: Math.ceil(total / l) || 1,
        limit: l,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to find publisher by publisher_id (for CSV imports)
export const findPublisherByPublisherId = async (publisherId) => {
  if (!publisherId || typeof publisherId !== "string") return null;
  return await Publisher.findOne({ publisher_id: publisherId.trim(), is_active: true });
};
