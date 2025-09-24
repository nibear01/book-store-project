import mongoose from "mongoose";
import path from "path";
import Book from "../models/book-model.js";

// NEW: fs/promises for renaming
import fs from "fs/promises";

// Helper: safely parse number with default
const toNumber = (val, def) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
};

// Slug helpers
const slugify = (s = "") =>
  String(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const ensureUniqueSlug = async (baseSlug, excludeId) => {
  if (!baseSlug) return undefined;
  let slug = baseSlug;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Book.exists(query);
    if (!exists) return slug;
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
};

// Map Multer file.path to a web-friendly relative path
const toPublicPath = (file) => {
  if (!file?.path) return undefined;
  const rel = path.relative(process.cwd(), file.path).split(path.sep).join("/");
  return rel.startsWith("/") ? rel : `/${rel}`;
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
    "slug",
    "meta_title",
    "meta_description",
    "meta_keywords",
    "publisher",   // added
    "pages",       // added
    // NEW
    "is_on_sale",
    "sale_price",
    "views",
    "is_deal_of_the_week",
    "deal_start",
    "deal_end",
  ];
  const out = {};
  for (const k of allowed) {
    if (payload[k] !== undefined) out[k] = payload[k];
  }

  // Normalize genre -> array of strings
  if (out.genre !== undefined) {
    if (Array.isArray(out.genre)) {
      out.genre = out.genre
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean);
    } else if (typeof out.genre === "string") {
      // support comma-separated or single
      const parts = out.genre.includes(",") ? out.genre.split(",") : [out.genre];
      out.genre = parts.map((v) => v.trim()).filter(Boolean);
    } else {
      out.genre = [];
    }
  }

  // Normalize meta_keywords -> array of strings
  if (out.meta_keywords !== undefined) {
    if (Array.isArray(out.meta_keywords)) {
      out.meta_keywords = out.meta_keywords
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean);
    } else if (typeof out.meta_keywords === "string") {
      const parts = out.meta_keywords.includes(",")
        ? out.meta_keywords.split(",")
        : [out.meta_keywords];
      out.meta_keywords = parts.map((v) => v.trim()).filter(Boolean);
    } else {
      out.meta_keywords = [];
    }
  }

  // Normalize cover_image to array of strings
  if (out.cover_image !== undefined) {
    if (Array.isArray(out.cover_image)) {
      out.cover_image = out.cover_image
        .map((v) => (typeof v === "string" ? v : null))
        .filter((v) => typeof v === "string");
    } else if (typeof out.cover_image === "string") {
      out.cover_image = [out.cover_image];
    } else {
      out.cover_image = [];
    }
  }

  // Normalize slug
  if (out.slug !== undefined && typeof out.slug === "string") {
    out.slug = slugify(out.slug);
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
  if (out.pages !== undefined) {
    const pg = Number(out.pages);
    if (!Number.isInteger(pg) || pg < 0) throw new Error("Invalid pages");
    out.pages = pg;
  }

  // NEW: sale fields
  if (out.sale_price !== undefined) {
    const sp = Number(out.sale_price);
    if (!Number.isFinite(sp) || sp < 0) throw new Error("Invalid sale_price");
    out.sale_price = sp;
  }
  if (out.views !== undefined) {
    const v = Number(out.views);
    if (!Number.isInteger(v) || v < 0) throw new Error("Invalid views");
    out.views = v;
  }
  if (out.deal_start !== undefined && out.deal_start !== null) {
    const ds = new Date(out.deal_start);
    if (isNaN(ds.getTime())) throw new Error("Invalid deal_start");
    out.deal_start = ds;
  }
  if (out.deal_end !== undefined && out.deal_end !== null) {
    const de = new Date(out.deal_end);
    if (isNaN(de.getTime())) throw new Error("Invalid deal_end");
    out.deal_end = de;
  }
  if (out.deal_start && out.deal_end && out.deal_end < out.deal_start) {
    throw new Error("deal_end must be after deal_start");
  }
  if (out.price !== undefined && out.sale_price !== undefined && out.sale_price >= out.price) {
    throw new Error("sale_price must be less than price");
  }

  return out;
};

// GET /api/books
export const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 1000000,
      search,
      genre,
      author,
      language,
      minPrice,
      maxPrice,
      sort, // e.g. "-created_at", "price", "-rating"
      minRating,         // NEW: filter by minimum rating
      inStock,           // NEW: filter by stock availability ("true" | "false")
      onSale,            // NEW: filter on sale books
      deals,             // NEW: filter deals of the week
      minViews,          // NEW: filter by minimum views
      // NEW: control is_active filtering
      status, // "all" | "active" | "inactive"
    } = req.query;

    const p = Math.max(1, toNumber(page, 1));
    const l = Math.min(100, Math.max(1, toNumber(limit, 10)));

    // CHANGED: status-aware active filter
    const filter = {};
    const statusVal = String(status || "active").toLowerCase();
    if (statusVal === "inactive") filter.is_active = false;
    else if (statusVal === "all") {
      // no is_active filter
    } else filter.is_active = true;

    if (search && String(search).trim()) {
      const term = String(search).trim();
      filter.$or = [
        { title: { $regex: term, $options: "i" } },
        { author: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ];
    }
    // Works with array-field as well (matches any element)
    if (genre) filter.genre = { $regex: String(genre), $options: "i" };
    if (author) filter.author = { $regex: String(author), $options: "i" };
    if (language) filter.language = { $regex: String(language), $options: "i" };

    // NEW: rating filter
    const minR = Number(minRating);
    if (Number.isFinite(minR) && minR >= 0) {
      filter.rating = { $gte: minR };
    }

    // NEW: stock availability
    if (typeof inStock !== "undefined") {
      const v = String(inStock).toLowerCase();
      if (v === "true") filter.stock = { $gt: 0 };
      else if (v === "false") filter.stock = 0;
    }

    // NEW: on sale filter
    if (typeof onSale !== "undefined" && String(onSale).toLowerCase() === "true") {
      filter.is_on_sale = true;
    }

    // NEW: deals filter
    if (typeof deals !== "undefined" && String(deals).toLowerCase() === "true") {
      filter.is_deal_of_the_week = true;
    }

    // NEW: min views filter
    const mv = Number(minViews);
    if (Number.isFinite(mv) && mv >= 0) {
      filter.views = { $gte: mv };
    }

    const priceFilter = {};
    const minP = Number(minPrice);
    const maxP = Number(maxPrice);
    if (Number.isFinite(minP)) priceFilter.$gte = minP;
    if (Number.isFinite(maxP)) priceFilter.$lte = maxP;
    if (Object.keys(priceFilter).length) filter.price = priceFilter;

    const sortable = new Set([
      "created_at",
      "updated_at",
      "price",
      "rating",
      "num_reviews",
      "stock",
      "published_date",
      "title",
      "is_featured", // NEW
      // NEW
      "views",
      "sale_price",
      "is_on_sale",
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

// GET /api/books/:slug
export const getBookById = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ success: false, message: "Invalid book slug" });
    }

    // NEW: increment views on detail fetch
    const book = await Book.findOneAndUpdate(
      { slug, is_active: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!book) {
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
    const { title, author, price, meta_title } = req.body || {};
    if (!title || !author) {
      return res.status(400).json({ success: false, message: "Title and author are required" });
    }
    if (price === undefined) {
      return res.status(400).json({ success: false, message: "Price is required" });
    }
    if (!meta_title) {
      return res.status(400).json({ success: false, message: "Meta title is required" });
    }

    const payload = pickUpdatableFields(req.body);

    // Derive slug if missing
    if (!payload.slug && payload.meta_title) {
      payload.slug = slugify(payload.meta_title);
    }
    payload.slug = await ensureUniqueSlug(payload.slug);

    // NEW: enforce sale logic on create
    if (payload.is_on_sale) {
      if (payload.sale_price === undefined) {
        return res.status(400).json({ success: false, message: "sale_price is required when is_on_sale is true" });
      }
      if (!(payload.sale_price < payload.price)) {
        return res.status(400).json({ success: false, message: "sale_price must be less than price" });
      }
    }

    // Merge URL-based cover images from body (CSV import support)
    const body = req.body || {};
    const coverUrlSet = new Set(
      Array.isArray(payload.cover_image) ? payload.cover_image.filter(Boolean) : []
    );

    if (typeof body.cover_image === "string" && body.cover_image.trim()) {
      // If a single URL was provided in 'cover_image' as text (CSV), use it as-is
      if (isAbsoluteUrl(body.cover_image.trim())) coverUrlSet.add(body.cover_image.trim());
    }
    if (typeof body.cover_image_url === "string" && body.cover_image_url.trim()) {
      coverUrlSet.add(body.cover_image_url.trim());
    }
    if (typeof body.cover_image_urls === "string" && body.cover_image_urls.trim()) {
      // Try JSON parse first, otherwise split by common separators
      let list = [];
      try {
        const parsed = JSON.parse(body.cover_image_urls);
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        list = body.cover_image_urls.split(/[|,\n]/).map((s) => s.trim()).filter(Boolean);
      }
      for (const u of list) if (isAbsoluteUrl(u)) coverUrlSet.add(u);
    }

    if (coverUrlSet.size) {
      payload.cover_image = Array.from(coverUrlSet);
    }

    // Merge uploaded files
    const uploadedImages = Array.isArray(req.files?.cover_image) ? req.files.cover_image : [];
    const uploadedBookFile = Array.isArray(req.files?.file_url) ? req.files.file_url[0] : undefined;

    if (uploadedImages.length) {
      const files = uploadedImages.map((f) => toPublicPath(f)).filter(Boolean);
      payload.cover_image = [...(payload.cover_image || []), ...files];
    }
    if (uploadedBookFile) {
      payload.file_url = toPublicPath(uploadedBookFile);
    }

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

    // If slug provided, ensure uniqueness
    if (payload.slug) {
      payload.slug = await ensureUniqueSlug(payload.slug, id);
    }

    // NEW: enforce sale logic when both are provided
    if (payload.is_on_sale && payload.sale_price !== undefined && payload.price !== undefined) {
      if (!(payload.sale_price < payload.price)) {
        return res.status(400).json({ success: false, message: "sale_price must be less than price" });
      }
    }

    // Merge URL-based cover images from body (CSV/automation support)
    const body = req.body || {};
    const coverUrlSet = new Set(
      Array.isArray(payload.cover_image) ? payload.cover_image.filter(Boolean) : []
    );

    if (typeof body.cover_image === "string" && body.cover_image.trim()) {
      if (isAbsoluteUrl(body.cover_image.trim())) coverUrlSet.add(body.cover_image.trim());
    }
    if (typeof body.cover_image_url === "string" && body.cover_image_url.trim()) {
      coverUrlSet.add(body.cover_image_url.trim());
    }
    if (typeof body.cover_image_urls === "string" && body.cover_image_urls.trim()) {
      let list = [];
      try {
        const parsed = JSON.parse(body.cover_image_urls);
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        list = body.cover_image_urls.split(/[|,\n]/).map((s) => s.trim()).filter(Boolean);
      }
      for (const u of list) if (isAbsoluteUrl(u)) coverUrlSet.add(u);
    }

    if (coverUrlSet.size) {
      payload.cover_image = Array.from(coverUrlSet);
    }

    // Merge uploaded files
    const uploadedImages = Array.isArray(req.files?.cover_image) ? req.files.cover_image : [];
    const uploadedBookFile = Array.isArray(req.files?.file_url) ? req.files.file_url[0] : undefined;

    if (uploadedImages.length) {
      const files = uploadedImages.map((f) => toPublicPath(f)).filter(Boolean);
      payload.cover_image = [...(payload.cover_image || []), ...files];
    }
    if (uploadedBookFile) {
      payload.file_url = toPublicPath(uploadedBookFile);
    }

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
// Permanently deletes by default. Soft delete only if ?hard=false.
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    const doHardDelete = String(hard ?? "true").toLowerCase() !== "false";

    if (doHardDelete) {
      const deleted = await Book.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: "Book not found" });
      return res.json({ success: true, message: "Book permanently deleted" });
    }

    // Fallback: soft delete when explicitly requested with hard=false
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

// NEW: GET /api/books/on-sale
export const getOnSaleBooks = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const books = await Book.find({ is_active: true, is_on_sale: true })
      .sort({ updated_at: -1 })
      .limit(limit)
      .lean();
    return res.json({ success: true, data: books, meta: { limit } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch on sale books", error: error.message });
  }
};

// NEW: GET /api/books/most-viewed
export const getMostViewedBooks = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const books = await Book.find({ is_active: true })
      .sort({ views: -1, updated_at: -1 })
      .limit(limit)
      .lean();
    return res.json({ success: true, data: books, meta: { limit } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch most viewed books", error: error.message });
  }
};

// NEW: GET /api/books/deals
export const getDealsOfTheWeek = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const books = await Book.find({ is_active: true, is_deal_of_the_week: true })
      .sort({ updated_at: -1 })
      .limit(limit)
      .lean();
    return res.json({ success: true, data: books, meta: { limit } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch deals of the week", error: error.message });
  }
};

// NEW: helper to sanitize/normalize filenames
const sanitizeBaseName = (name = "") =>
  String(name)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "")
    .replace(/-+/g, "-");

// NEW: ensure unique destination filename
const ensureUniquePath = async (dir, base) => {
  const ext = path.extname(base);
  const name = path.basename(base, ext);
  let candidate = base;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await fs.access(path.join(dir, candidate));
      // exists -> try next
      candidate = `${name}-${i}${ext}`;
      i += 1;
    } catch {
      // not exists
      return candidate;
    }
  }
};

// NEW: POST /api/books/bulk-upload
// FormData: bulk_images[] (images), bulk_files[] (pdf/epub)
// Optional fields:
//   - renameMap: JSON string mapping original file name -> desired filename (with or without extension)
//   - imagesNames: JSON string array of desired basenames by index for bulk_images[]
//   - filesNames: JSON string array of desired basenames by index for bulk_files[]
export const bulkUploadAssets = async (req, res) => {
  try {
    const files = req.files || {};
    const images = Array.isArray(files.bulk_images) ? files.bulk_images : [];
    const bookFiles = Array.isArray(files.bulk_files) ? files.bulk_files : [];

    // parse optional rename inputs
    let renameMap = {};
    let imagesNames = [];
    let filesNames = [];
    try {
      if (req.body?.renameMap) renameMap = JSON.parse(req.body.renameMap);
    } catch {}
    try {
      if (req.body?.imagesNames) imagesNames = JSON.parse(req.body.imagesNames);
    } catch {}
    try {
      if (req.body?.filesNames) filesNames = JSON.parse(req.body.filesNames);
    } catch {}

    const toPublic = (abs) => {
      const rel = path.relative(process.cwd(), abs).split(path.sep).join("/");
      return rel.startsWith("/") ? `/${rel}` : `/${rel}`;
    };

    const processBatch = async (arr, namesByIndex) => {
      const results = [];
      for (let i = 0; i < arr.length; i += 1) {
        const f = arr[i];
        const dir = path.dirname(f.path);
        const origExt = path.extname(f.originalname) || path.extname(f.filename) || "";
        const provided = renameMap[f.originalname] ?? namesByIndex[i];

        let desiredBase = provided ? sanitizeBaseName(String(provided)) : null;
        if (desiredBase) {
          // Ensure extension present; if provided already has an extension, keep it
          if (!path.extname(desiredBase)) {
            desiredBase = `${desiredBase}${origExt}`;
          }
        }

        // If no desired name -> keep current stored name
        let finalFilename = desiredBase || path.basename(f.path);
        // If different -> rename and ensure uniqueness
        if (finalFilename !== path.basename(f.path)) {
          finalFilename = await ensureUniquePath(dir, finalFilename);
          const dst = path.join(dir, finalFilename);
          await fs.rename(f.path, dst);
        } else {
          // Still ensure uniqueness in case of manual clashes (rare)
          const unique = await ensureUniquePath(dir, finalFilename);
          if (unique !== finalFilename) {
            const dst = path.join(dir, unique);
            await fs.rename(f.path, dst);
            finalFilename = unique;
          }
        }

        const abs = path.join(dir, finalFilename);
        results.push({
          original: f.originalname,
          filename: finalFilename,
          url: toPublic(abs),
        });
      }
      return results;
    };

    const imagesOut = await processBatch(images, imagesNames);
    const filesOut = await processBatch(bookFiles, filesNames);

    return res.status(201).json({
      success: true,
      data: {
        images: imagesOut,
        files: filesOut,
      },
      message: "Bulk assets uploaded successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload bulk assets",
      error: error.message,
    });
  }
};

// helper: detect absolute URL
const isAbsoluteUrl = (s) => typeof s === "string" && /^https?:\/\//i.test(s);
