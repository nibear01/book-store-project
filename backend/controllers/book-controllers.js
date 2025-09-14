import mongoose from "mongoose";
import Book from "../models/book-model.js";

// Helper: safely parse number with default
const toNumber = (val, def) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
};

// Helper: sanitize updatable fields
const pickUpdatableFields = (payload = {}) => {
  const allowed = [
    "title",
    "author",
    "description",
    "genre",
    "language",
    "isbn",
    "cover_image",
    "file_url",
    "price",
    "stock",
    "published_date",
    "is_active",
    "rating",
    "num_reviews",
    "is_featured",
  ];
  const out = {};
  for (const k of allowed) {
    if (payload[k] !== undefined) out[k] = payload[k];
  }
  // Normalize cover_image to array of strings
  if (out.cover_image !== undefined) {
    if (Array.isArray(out.cover_image)) {
      out.cover_image = out.cover_image.filter((v) => typeof v === "string");
    } else if (typeof out.cover_image === "string") {
      out.cover_image = [out.cover_image];
    } else {
      out.cover_image = [];
    }
  }
  // Normalize published_date
  if (out.published_date !== undefined) {
    const d = new Date(out.published_date);
    if (isNaN(d.getTime())) {
      throw new Error("Invalid published_date");
    }
    out.published_date = d;
  }
  // Validate numeric fields
  if (out.price !== undefined) {
    const p = Number(out.price);
    if (!Number.isFinite(p) || p < 0) throw new Error("Invalid price");
    out.price = p;
  }
  if (out.stock !== undefined) {
    const s = Number(out.stock);
    if (!Number.isInteger(s) || s < 0) throw new Error("Invalid stock");
    out.stock = s;
  }
  if (out.rating !== undefined) {
    const r = Number(out.rating);
    if (!Number.isFinite(r) || r < 0 || r > 5) throw new Error("Invalid rating (0-5)");
    out.rating = r;
  }
  if (out.num_reviews !== undefined) {
    const nr = Number(out.num_reviews);
    if (!Number.isInteger(nr) || nr < 0) throw new Error("Invalid num_reviews");
    out.num_reviews = nr;
  }
  return out;
};

// GET /api/books
export const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      genre,
      author,
      language,
      minPrice,
      maxPrice,
      sort, // e.g. "-created_at", "price", "-rating"
    } = req.query;

    const p = Math.max(1, toNumber(page, 1));
    const l = Math.min(100, Math.max(1, toNumber(limit, 10)));

    const filter = { is_active: true };

    if (search && String(search).trim()) {
      const term = String(search).trim();
      filter.$or = [
        { title: { $regex: term, $options: "i" } },
        { author: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ];
    }
    if (genre) filter.genre = { $regex: String(genre), $options: "i" };
    if (author) filter.author = { $regex: String(author), $options: "i" };
    if (language) filter.language = { $regex: String(language), $options: "i" };

    const priceFilter = {};
    const minP = Number(minPrice);
    const maxP = Number(maxPrice);
    if (Number.isFinite(minP)) priceFilter.$gte = minP;
    if (Number.isFinite(maxP)) priceFilter.$lte = maxP;
    if (Object.keys(priceFilter).length) filter.price = priceFilter;

    // Sorting whitelist
    const sortable = new Set([
      "created_at",
      "updated_at",
      "price",
      "rating",
      "num_reviews",
      "stock",
      "published_date",
      "title",
    ]);
    let sortSpec = { created_at: -1 };
    if (sort && typeof sort === "string") {
      const s = String(sort);
      const desc = s.startsWith("-");
      const field = desc ? s.slice(1) : s;
      if (sortable.has(field)) {
        sortSpec = { [field]: desc ? -1 : 1 };
      }
    }

    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .sort(sortSpec)
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    return res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page: p,
        pages: Math.ceil(total / l) || 1,
        limit: l,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch books", error: error.message });
  }
};

// GET /api/books/:id
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    const book = await Book.findById(id).lean();
    if (!book || !book.is_active) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    return res.json({ success: true, data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch book", error: error.message });
  }
};

// POST /api/books
export const createBook = async (req, res) => {
  try {
    const { title, author, price } = req.body || {};
    if (!title || !author) {
      return res.status(400).json({ success: false, message: "Title and author are required" });
    }
    if (price === undefined) {
      return res.status(400).json({ success: false, message: "Price is required" });
    }

    const payload = pickUpdatableFields(req.body);

    const book = await Book.create({
      ...payload,
    });

    return res.status(201).json({ success: true, data: book });
  } catch (error) {
    const code = error.message && error.message.startsWith("Invalid") ? 400 : 500;
    return res.status(code).json({ success: false, message: "Failed to create book", error: error.message });
  }
};

// PUT /api/books/:id
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    const payload = pickUpdatableFields(req.body);

    const updated = await Book.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    const code = error.message && error.message.startsWith("Invalid") ? 400 : 500;
    return res.status(code).json({ success: false, message: "Failed to update book", error: error.message });
  }
};

// DELETE /api/books/:id
// Soft delete by default (sets is_active=false). Hard delete if ?hard=true.
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    if (String(hard).toLowerCase() === "true") {
      const deleted = await Book.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: "Book not found" });
      return res.json({ success: true, message: "Book permanently deleted" });
    }

    const updated = await Book.findByIdAndUpdate(id, { $set: { is_active: false } }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Book not found" });

    return res.json({ success: true, message: "Book deactivated", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete book", error: error.message });
  }
};

// GET /api/books/featured
export const getFeaturedBooks = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const books = await Book.find({ is_active: true, is_featured: true })
      .sort({ updated_at: -1 })
      .limit(limit)
      .lean();

    return res.json({ success: true, data: books, meta: { limit } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch featured books", error: error.message });
  }
};

// GET /api/books/trending
export const getTrendingBooks = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const days = Number(req.query.days);
    const filter = { is_active: true };

    if (Number.isFinite(days) && days > 0) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filter.updated_at = { $gte: since };
    } else {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filter.updated_at = { $gte: since };
    }

    const books = await Book.find(filter)
      .sort({ rating: -1, num_reviews: -1, updated_at: -1 })
      .limit(limit)
      .lean();

    return res.json({ success: true, data: books, meta: { limit, days: Number.isFinite(days) && days >= 0 ? days : 30 } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch trending books", error: error.message });
  }
};

// Force listing by upload date (newest first)
export const getLatestBooks = async (req, res) => {
  try {
    req.query.sort = "-created_at";
    return getBooks(req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch latest books", error: error.message });
  }
};
