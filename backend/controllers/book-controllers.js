import mongoose from "mongoose";
import { escapeRegex } from "../utils/escape-regex.js";
import path from "path";
import Book from "../models/book-model.js";
import { slugify } from "../utils/slugify.js";
import Publisher from "../models/publisher-model.js";
import Cart from "../models/cart-model.js";
import Wishlist from "../models/wishlist-model.js";

// NEW: fs/promises for renaming
import fs from "fs/promises";
import { BACKEND_ROOT } from "../utils/paths.js";

// Helper: safely parse number with default
const toNumber = (val, def) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
};

// ═══════════════════════════════════════════════════════════════════════════
// CURSOR-BASED PAGINATION HELPERS (Efficient for 10k+ books)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Encodes cursor object to base64 string for safe transmission
 * @param {Object} cursorObj - Object with cursor field values
 * @returns {string} Base64 encoded cursor
 */
const encodeCursor = (cursorObj) => {
  if (!cursorObj) return null;
  return Buffer.from(JSON.stringify(cursorObj)).toString("base64");
};

/**
 * Decodes base64 cursor string back to object
 * @param {string} cursorStr - Base64 encoded cursor
 * @returns {Object} Decoded cursor object
 */
const decodeCursor = (cursorStr) => {
  if (!cursorStr) return null;
  try {
    return JSON.parse(Buffer.from(cursorStr, "base64").toString());
  } catch {
    return null;
  }
};

/**
 * Builds MongoDB query condition for cursor-based pagination
 * Uses compound cursor to handle ties and prevent duplicates
 * @param {Object} cursor - Decoded cursor object with field values
 * @param {Array<string>} sortFields - Sort field names in order (e.g., ['created_at', '_id'])
 * @param {Object} sortSpec - Sort specification (e.g., {created_at: -1, _id: -1})
 * @returns {Object} MongoDB $and condition
 */
const buildCursorQuery = (cursor, sortFields, sortSpec) => {
  if (!cursor || !sortFields.length) return {};

  const conditions = [];

  for (let i = 0; i < sortFields.length; i++) {
    const field = sortFields[i];
    const direction = sortSpec[field];
    const value = cursor[field];

    // Build condition for this level of the compound cursor
    const cond = {};

    if (i === 0) {
      // First field: use comparison
      cond[field] = direction === -1 ? { $lt: value } : { $gt: value };
    } else {
      // Tie-breaker fields: all previous fields must be equal
      const $and = [];
      for (let j = 0; j < i; j++) {
        const prevField = sortFields[j];
        $and.push({ [prevField]: cursor[prevField] });
      }
      // And this field must be less/greater
      cond[field] = direction === -1 ? { $lt: value } : { $gt: value };
      $and.push(cond);
      conditions.push({ $and });
      continue;
    }

    conditions.push(cond);
  }

  return conditions.length ? { $or: conditions } : {};
};

/**
 * Execute paginated query using cursor-based pagination
 * @param {Object} query - MongoDB filter
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Results per page
 * @param {string} options.cursor - Base64 encoded cursor (optional)
 * @param {Array<string>} options.sortFields - Field names for sorting
 * @param {Object} options.sortSpec - Sort specification
 * @param {Object} options.projection - Field projection
 * @param {string} options.populatePath - Path to populate (optional)
 * @param {string} options.populateSelect - Fields to select from populated doc (optional)
 * @returns {Promise<{data, hasNextPage, nextCursor, previousCursor}>}
 */
const paginateCursor = async (
  query,
  {
    limit = 20,
    cursor = null,
    sortFields = ["created_at", "_id"],
    sortSpec = { created_at: -1, _id: -1 },
    projection = {},
    populatePath = null,
    populateSelect = null,
  },
) => {
  const l = Math.min(5000, Math.max(1, limit));

  // Build cursor condition
  const decodedCursor = decodeCursor(cursor);
  const cursorCondition = buildCursorQuery(decodedCursor, sortFields, sortSpec);

  // Merge cursor condition with base query
  // Combine with $and: spreading would let the cursor's $or overwrite a search $or in the filter
  const finalQuery = cursorCondition.$or ? { $and: [query, cursorCondition] } : query;

  // Fetch l+1 to detect if there's a next page
  let queryBuilder = Book.find(finalQuery);

  if (Object.keys(projection).length) {
    queryBuilder = queryBuilder.select(projection);
  }

  queryBuilder = queryBuilder
    .sort(sortSpec)
    .limit(l + 1)
    .lean();

  if (populatePath) {
    queryBuilder = queryBuilder.populate(
      populatePath,
      populateSelect || "name slug",
    );
  }

  const results = await queryBuilder;

  // Check if there's a next page
  const hasNextPage = results.length > l;
  const data = hasNextPage ? results.slice(0, l) : results;

  // Build next cursor from last document
  let nextCursor = null;
  if (hasNextPage && data.length > 0) {
    const lastDoc = data[data.length - 1];
    const cursorObj = {};
    for (const field of sortFields) {
      cursorObj[field] = lastDoc[field];
    }
    nextCursor = encodeCursor(cursorObj);
  }

  // Build previous cursor from first document
  let previousCursor = null;
  if (decodedCursor && data.length > 0) {
    const firstDoc = data[0];
    const cursorObj = {};
    for (const field of sortFields) {
      cursorObj[field] = firstDoc[field];
    }
    previousCursor = encodeCursor(cursorObj);
  }

  return {
    data,
    hasNextPage,
    nextCursor,
    previousCursor,
  };
};

// Slug helpers (slugify keeps Bangla and other scripts; see utils/slugify.js)

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
  const rel = path.relative(BACKEND_ROOT, file.path).split(path.sep).join("/");
  return rel.startsWith("/") ? rel : `/${rel}`;
};

// NEW: local uploads root and safe deletion helpers
const uploadsRoot = path.resolve(BACKEND_ROOT, "uploads");
const toAbsoluteIfLocal = (p) => {
  if (!p || isAbsoluteUrl(p)) return null; // skip remote URLs
  const rel = String(p).replace(/^\/+/, ""); // strip leading slash
  const abs = path.resolve(BACKEND_ROOT, rel);
  if (!abs.startsWith(uploadsRoot)) return null; // safety: only within uploads
  return abs;
};
const deleteLocalFilesSafe = async (paths = []) => {
  for (const p of Array.from(new Set(paths.filter(Boolean)))) {
    const abs = toAbsoluteIfLocal(p);
    if (!abs) continue;
    try {
      await fs.unlink(abs);
    } catch {
      // ignore missing files or fs errors
    }
  }
};

// Helper: auto-assign publisher based on name, ID, or publisher_id (6-digit)
const assignPublisher = async (bookData) => {
  // Priority 1: If publisher_id is an ObjectId, use it directly
  if (
    bookData.publisher_id &&
    mongoose.isValidObjectId(bookData.publisher_id)
  ) {
    const pub = await Publisher.findById(bookData.publisher_id);
    if (pub) {
      bookData.publisher = pub.name;
      bookData.publisher_id = pub._id;
      return;
    }
  }

  // Priority 2: If publisher_id is a 6-digit string, search by publisher_id field
  if (
    bookData.publisher_id &&
    /^\d{6}$/.test(String(bookData.publisher_id).trim())
  ) {
    const pub = await Publisher.findOne({
      publisher_id: String(bookData.publisher_id).trim(),
      is_active: true,
    });

    if (pub) {
      bookData.publisher = pub.name;
      bookData.publisher_id = pub._id;
      return;
    }
  }

  // Priority 3: If publisher string looks like a 6-digit ID, search by publisher_id field
  if (bookData.publisher && typeof bookData.publisher === "string") {
    const publisherStr = bookData.publisher.trim();

    // Check if it's a 6-digit publisher_id
    if (/^\d{6}$/.test(publisherStr)) {
      const pub = await Publisher.findOne({
        publisher_id: publisherStr,
        is_active: true,
      });

      if (pub) {
        bookData.publisher = pub.name;
        bookData.publisher_id = pub._id;
        return;
      }
    }

    // Priority 4: Try to find by publisher name
    const pub = await Publisher.findOne({
      name: {
        $regex: new RegExp(
          `^${publisherStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
      is_active: true,
    });

    if (pub) {
      bookData.publisher = pub.name;
      bookData.publisher_id = pub._id;
    } else {
      // Publisher name/id provided but not found in DB - keep the string, clear the reference
      bookData.publisher = publisherStr;
      delete bookData.publisher_id;
    }
  }
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
    "publisher", // added (legacy string field)
    "publisher_id", // added (reference to Publisher model)
    "pages", // added
    "isPrintOnDemand", // added
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
      const parts = out.genre.includes(",")
        ? out.genre.split(",")
        : [out.genre];
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

  // Normalize boolean flags from string/number to actual booleans
  const toBool = (v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    const s = String(v ?? "")
      .trim()
      .toLowerCase();
    if (!s) return false;
    if (s === "true" || s === "1" || s === "yes" || s === "y") return true;
    if (s === "false" || s === "0" || s === "no" || s === "n") return false;
    return Boolean(v);
  };
  [
    "is_active",
    "is_featured",
    "is_on_sale",
    "is_deal_of_the_week",
    "isPrintOnDemand", // added
  ].forEach((k) => {
    if (out[k] !== undefined) out[k] = toBool(out[k]);
  });

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

  // Validate publisher_id - allow ObjectId OR 6-digit publisher ID string
  if (out.publisher_id !== undefined && out.publisher_id) {
    const isObjectId = mongoose.isValidObjectId(out.publisher_id);
    const is6DigitId = /^\d{6}$/.test(String(out.publisher_id).trim());

    if (!isObjectId && !is6DigitId) {
      throw new Error(
        "Invalid publisher_id: must be a valid ObjectId or 6-digit publisher ID",
      );
    }
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
    if (!Number.isFinite(r) || r < 0 || r > 5)
      throw new Error("Invalid rating (0-5)");
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
  if (
    out.is_on_sale &&
    out.price !== undefined &&
    out.sale_price !== undefined &&
    !(out.sale_price < out.price)
  ) {
    throw new Error("sale_price must be less than price");
  }

  return out;
};

// GET /api/books (CURSOR-BASED PAGINATION)
// Query params:
//   - limit: Results per page (default 20, max 5000)
//   - cursor: Base64 encoded cursor for pagination (from nextCursor of previous response)
//   - sort: Sort field & direction (e.g., "-created_at", "price", "-rating") - changes cursor key!
//   - search, genre, author, language, minPrice, maxPrice, minRating, inStock, onSale, deals, minViews
//   - status: "active" | "inactive" | "all" (default: "active")
//   - (DEPRECATED) page, limit: Use cursor instead for better performance
export const getBooks = async (req, res) => {
  try {
    const {
      limit,
      cursor,
      search,
      genre,
      author,
      language,
      minPrice,
      maxPrice,
      sort, // e.g. "-created_at", "price", "-rating"
      minRating,
      inStock,
      onSale,
      deals,
      minViews,
      status,
      isbn: isbnQuery,
      // DEPRECATED: offset-based params (fallback to cursor pagination)
      page,
    } = req.query;

    const l = Math.min(5000, Math.max(1, toNumber(limit, 20)));

    // Build filter
    const filter = {};
    const statusVal = String(status || "active").toLowerCase();
    if (statusVal === "inactive") filter.is_active = false;
    else if (statusVal === "all") {
      // no is_active filter
    } else filter.is_active = true;

    if (search && String(search).trim()) {
      const term = String(search).trim();
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { author: { $regex: escaped, $options: "i" } },
        { isbn: { $regex: escaped, $options: "i" } },
      ];
    }
    if (genre) filter.genre = { $regex: escapeRegex(genre), $options: "i" };
    if (author) filter.author = { $regex: escapeRegex(author), $options: "i" };
    if (language) filter.language = { $regex: escapeRegex(language), $options: "i" };

    if (isbnQuery && String(isbnQuery).trim()) {
      filter.isbn = { $regex: escapeRegex(String(isbnQuery).trim()), $options: "i" };
    }

    const minR = Number(minRating);
    if (Number.isFinite(minR) && minR >= 0) {
      filter.rating = { $gte: minR };
    }

    if (typeof inStock !== "undefined") {
      const v = String(inStock).toLowerCase();
      if (v === "true") filter.stock = { $gt: 0 };
      else if (v === "false") filter.stock = 0;
    }

    if (
      typeof onSale !== "undefined" &&
      String(onSale).toLowerCase() === "true"
    ) {
      filter.is_on_sale = true;
    }

    if (
      typeof deals !== "undefined" &&
      String(deals).toLowerCase() === "true"
    ) {
      filter.is_deal_of_the_week = true;
    }

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

    // Determine sort & cursor fields
    const sortable = new Set([
      "created_at",
      "updated_at",
      "price",
      "rating",
      "num_reviews",
      "stock",
      "published_date",
      "title",
      "is_featured",
      "views",
      "is_on_sale",
    ]);

    let sortSpec = { created_at: -1, _id: -1 }; // Default with _id tiebreaker
    let sortFields = ["created_at", "_id"];

    if (sort && typeof sort === "string") {
      const s = String(sort);
      const desc = s.startsWith("-");
      const field = desc ? s.slice(1) : s;
      if (sortable.has(field)) {
        sortSpec = { [field]: desc ? -1 : 1, _id: -1 };
        sortFields = [field, "_id"];
      }
    }

    // Light projection
    const listProjection = {
      description: 0,
      meta_description: 0,
      meta_keywords: 0,
      file_url: 0,
    };

    // Use cursor pagination (or fallback to skip/limit if page param exists)
    if (page && !cursor) {
      // DEPRECATED PATH: Fallback for old clients using page param
      const p = Math.max(1, toNumber(page, 1));
      const [total, books] = await Promise.all([
        Book.countDocuments(filter),
        Book.find(filter)
          .select(listProjection)
          .sort(sortSpec)
          .skip((p - 1) * l)
          .limit(l)
          .populate("publisher_id", "name slug logo country website")
          .lean(),
      ]);

      return res.json({
        success: true,
        data: books,
        pagination: {
          total,
          page: p,
          pages: Math.ceil(total / l) || 1,
          limit: l,
          _note:
            "Using deprecated offset pagination. Use 'cursor' param instead for better performance.",
        },
      });
    }

    // CURSOR-BASED PATH (preferred)
    const {
      data: books,
      hasNextPage,
      nextCursor,
      previousCursor,
    } = await paginateCursor(filter, {
      limit: l,
      cursor,
      sortFields,
      sortSpec,
      projection: listProjection,
      populatePath: "publisher_id",
      populateSelect: "name slug logo country website",
    });

    return res.json({
      success: true,
      data: books,
      pagination: {
        limit: l,
        hasNextPage,
        hasPreviousPage: !!previousCursor,
        nextCursor: nextCursor || null,
        previousCursor: previousCursor || null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch books",
        error: error.message,
      });
  }
};

// GET /api/books/:slug
export const getBookById = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || typeof slug !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid book slug" });
    }

    // Build query: if the param looks like a Mongo ObjectId, search by _id too
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isObjectId
      ? { $or: [{ slug }, { _id: slug }], is_active: true }
      : { slug, is_active: true };

    // Fetch book first, then fire-and-forget the views increment (don't block response)
    const book = await Book.findOne(query)
      .populate("publisher_id", "name slug logo country website")
      .lean();

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    // Increment views in the background — non-blocking
    Book.updateOne({ _id: book._id }, { $inc: { views: 1 } }).catch(() => {});

    return res.json({ success: true, data: book });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch book",
        error: error.message,
      });
  }
};

// POST /api/books
export const createBook = async (req, res) => {
  try {
    const { title, author, price, meta_title } = req.body || {};
    if (!title || !author) {
      return res
        .status(400)
        .json({ success: false, message: "Title and author are required" });
    }
    if (price === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Price is required" });
    }
    if (!meta_title) {
      return res
        .status(400)
        .json({ success: false, message: "Meta title is required" });
    }

    const payload = pickUpdatableFields(req.body);

    // Check for duplicate ISBN if provided
    if (payload.isbn && payload.isbn.trim()) {
      const existingBook = await Book.findOne({ isbn: payload.isbn.trim() });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: `A book with ISBN "${payload.isbn.trim()}" already exists`,
        });
      }
    }

    // Derive slug if missing. Every book must get one: links to the book page are built from it.
    if (!payload.slug) payload.slug = slugify(payload.meta_title) || slugify(payload.title);
    if (!payload.slug) payload.slug = `book-${Date.now().toString(36)}`;
    payload.slug = await ensureUniqueSlug(payload.slug);

    // NEW: enforce sale logic on create
    if (payload.is_on_sale) {
      if (payload.sale_price === undefined) {
        return res
          .status(400)
          .json({
            success: false,
            message: "sale_price is required when is_on_sale is true",
          });
      }
      if (!(payload.sale_price < payload.price)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "sale_price must be less than price",
          });
      }
    }

    // Merge URL-based cover images from body (CSV import support)
    const body = req.body || {};
    const coverUrlSet = new Set(
      Array.isArray(payload.cover_image)
        ? payload.cover_image.filter(Boolean)
        : [],
    );

    if (typeof body.cover_image === "string" && body.cover_image.trim()) {
      // If a single URL was provided in 'cover_image' as text (CSV), use it as-is
      if (isAbsoluteUrl(body.cover_image.trim()))
        coverUrlSet.add(body.cover_image.trim());
    }
    if (
      typeof body.cover_image_url === "string" &&
      body.cover_image_url.trim()
    ) {
      coverUrlSet.add(body.cover_image_url.trim());
    }
    if (
      typeof body.cover_image_urls === "string" &&
      body.cover_image_urls.trim()
    ) {
      // Try JSON parse first, otherwise split by common separators
      let list = [];
      try {
        const parsed = JSON.parse(body.cover_image_urls);
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        list = body.cover_image_urls
          .split(/[|,\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      for (const u of list) if (isAbsoluteUrl(u)) coverUrlSet.add(u);
    }

    if (coverUrlSet.size) {
      payload.cover_image = Array.from(coverUrlSet);
    }

    // Merge uploaded files
    const uploadedImages = Array.isArray(req.files?.cover_image)
      ? req.files.cover_image
      : [];
    const uploadedBookFile = Array.isArray(req.files?.file_url)
      ? req.files.file_url[0]
      : undefined;

    if (uploadedImages.length) {
      const files = uploadedImages.map((f) => toPublicPath(f)).filter(Boolean);
      payload.cover_image = [...(payload.cover_image || []), ...files];
    }
    if (uploadedBookFile) {
      payload.file_url = toPublicPath(uploadedBookFile);
    }

    // Auto-assign publisher based on name or ID
    await assignPublisher(payload);

    const book = await Book.create({
      ...payload,
    });

    // Add book to publisher's books array if publisher_id exists
    if (book.publisher_id) {
      await Publisher.findByIdAndUpdate(book.publisher_id, {
        $addToSet: { books: book._id },
      });
    }

    const populated = await Book.findById(book._id)
      .populate("publisher_id", "name slug logo country website")
      .lean();

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    const code =
      error.message && error.message.startsWith("Invalid") ? 400 : 500;
    return res
      .status(code)
      .json({
        success: false,
        message: "Failed to create book",
        error: error.message,
      });
  }
};

// PUT /api/books/:id
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid book id" });
    }

    const payload = pickUpdatableFields(req.body);

    // Check for duplicate ISBN if provided (excluding current book)
    if (payload.isbn && payload.isbn.trim()) {
      const existingBook = await Book.findOne({
        isbn: payload.isbn.trim(),
        _id: { $ne: id },
      });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: `A book with ISBN "${payload.isbn.trim()}" already exists`,
        });
      }
    }

    // Keep the book reachable: an emptied slug, or a book that never had one,
    // gets a slug rebuilt from its title
    const current = await Book.findById(id).select("slug title meta_title").lean();
    if (payload.slug === "" || (payload.slug === undefined && current && !current.slug)) {
      payload.slug =
        slugify(payload.meta_title || current?.meta_title || "") ||
        slugify(payload.title || current?.title || "") ||
        `book-${id}`;
    }
    if (payload.slug) {
      payload.slug = await ensureUniqueSlug(payload.slug, id);
    }

    // NEW: enforce sale logic when both are provided
    if (
      payload.is_on_sale &&
      payload.sale_price !== undefined &&
      payload.price !== undefined
    ) {
      if (!(payload.sale_price < payload.price)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "sale_price must be less than price",
          });
      }
    }

    // Merge URL-based cover images from body (CSV/automation support)
    const body = req.body || {};
    const coverUrlSet = new Set(
      Array.isArray(payload.cover_image)
        ? payload.cover_image.filter(Boolean)
        : [],
    );

    if (typeof body.cover_image === "string" && body.cover_image.trim()) {
      if (isAbsoluteUrl(body.cover_image.trim()))
        coverUrlSet.add(body.cover_image.trim());
    }
    if (
      typeof body.cover_image_url === "string" &&
      body.cover_image_url.trim()
    ) {
      coverUrlSet.add(body.cover_image_url.trim());
    }
    if (
      typeof body.cover_image_urls === "string" &&
      body.cover_image_urls.trim()
    ) {
      let list = [];
      try {
        const parsed = JSON.parse(body.cover_image_urls);
        if (Array.isArray(parsed)) list = parsed;
      } catch {
        list = body.cover_image_urls
          .split(/[|,\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      for (const u of list) if (isAbsoluteUrl(u)) coverUrlSet.add(u);
    }

    if (coverUrlSet.size) {
      payload.cover_image = Array.from(coverUrlSet);
    }

    // Merge uploaded files
    const uploadedImages = Array.isArray(req.files?.cover_image)
      ? req.files.cover_image
      : [];
    const uploadedBookFile = Array.isArray(req.files?.file_url)
      ? req.files.file_url[0]
      : undefined;

    if (uploadedImages.length) {
      const files = uploadedImages.map((f) => toPublicPath(f)).filter(Boolean);
      payload.cover_image = [...(payload.cover_image || []), ...files];
    }
    if (uploadedBookFile) {
      payload.file_url = toPublicPath(uploadedBookFile);
    }

    // Get the old book data before update
    const oldBook = await Book.findById(id).select("publisher_id").lean();
    const oldPublisherId = oldBook?.publisher_id?.toString();

    // Auto-assign publisher based on name or ID
    await assignPublisher(payload);

    const updated = await Book.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true },
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    // Update publisher's books array if publisher changed
    const newPublisherId = updated.publisher_id?.toString();

    if (oldPublisherId !== newPublisherId) {
      // Remove from old publisher
      if (oldPublisherId) {
        await Publisher.findByIdAndUpdate(oldPublisherId, {
          $pull: { books: id },
        });
      }

      // Add to new publisher
      if (newPublisherId) {
        await Publisher.findByIdAndUpdate(newPublisherId, {
          $addToSet: { books: id },
        });
      }
    }

    const populated = await Book.findById(id)
      .populate("publisher_id", "name slug logo country website")
      .lean();

    return res.json({ success: true, data: populated });
  } catch (error) {
    const code =
      error.message && error.message.startsWith("Invalid") ? 400 : 500;
    return res
      .status(code)
      .json({
        success: false,
        message: "Failed to update book",
        error: error.message,
      });
  }
};

// DELETE /api/books/:id
// Permanently deletes by default. Soft delete only if ?hard=false.
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid book id" });
    }

    // Soft delete unless ?hard=true is passed explicitly
    const doHardDelete = String(hard ?? "false").toLowerCase() === "true";

    if (doHardDelete) {
      // Fetch doc first so we can delete assets
      const doc = await Book.findById(id).lean();
      if (!doc)
        return res
          .status(404)
          .json({ success: false, message: "Book not found" });

      // Collect asset paths (only local ones will be deleted)
      const assets = [];
      if (Array.isArray(doc.cover_image)) assets.push(...doc.cover_image);
      else if (typeof doc.cover_image === "string")
        assets.push(doc.cover_image);
      if (doc.file_url) assets.push(doc.file_url);

      await deleteLocalFilesSafe(assets);

      // Remove book from publisher's books array
      if (doc.publisher_id) {
        await Publisher.findByIdAndUpdate(doc.publisher_id, {
          $pull: { books: id },
        });
      }

      await Book.findByIdAndDelete(id);

      // Remove the book from every cart and wishlist that still holds it
      await Cart.updateMany({ "items.book": id }, { $pull: { items: { book: id } } });
      await Wishlist.updateMany({ "items.book": id }, { $pull: { items: { book: id } } });

      return res.json({ success: true, message: "Book permanently deleted" });
    }

    // Fallback: soft delete when explicitly requested with hard=false
    const updated = await Book.findByIdAndUpdate(
      id,
      { $set: { is_active: false } },
      { new: true },
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    return res.json({
      success: true,
      message: "Book deactivated",
      data: updated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete book",
        error: error.message,
      });
  }
};

// GET /api/books/featured (CURSOR-BASED)
// Query params: limit (max 5000), cursor
export const getFeaturedBooks = async (req, res) => {
  try {
    const limit = toNumber(req.query.limit, 10);
    const cursor = req.query.cursor || null;

    const filter = { is_active: true, is_featured: true };
    const sortSpec = { updated_at: -1, _id: -1 };
    const sortFields = ["updated_at", "_id"];

    const {
      data: books,
      hasNextPage,
      nextCursor,
      previousCursor,
    } = await paginateCursor(filter, {
      limit,
      cursor,
      sortFields,
      sortSpec,
      projection: {
        description: 0,
        meta_description: 0,
        meta_keywords: 0,
        file_url: 0,
      },
      populatePath: "publisher_id",
      populateSelect: "name slug logo country website",
    });

    return res.json({
      success: true,
      data: books,
      pagination: {
        limit,
        hasNextPage,
        hasPreviousPage: !!previousCursor,
        nextCursor: nextCursor || null,
        previousCursor: previousCursor || null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch featured books",
        error: error.message,
      });
  }
};

// GET /api/books/trending (CURSOR-BASED)
// Query params: limit (max 5000), cursor, days (default 30)
export const getTrendingBooks = async (req, res) => {
  try {
    const limit = toNumber(req.query.limit, 10);
    const cursor = req.query.cursor || null;
    const days = Number(req.query.days);

    const filter = { is_active: true };

    if (Number.isFinite(days) && days > 0) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filter.updated_at = { $gte: since };
    } else {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filter.updated_at = { $gte: since };
    }

    const sortSpec = { rating: -1, num_reviews: -1, updated_at: -1, _id: -1 };
    const sortFields = ["rating", "num_reviews", "updated_at", "_id"];

    const {
      data: books,
      hasNextPage,
      nextCursor,
      previousCursor,
    } = await paginateCursor(filter, {
      limit,
      cursor,
      sortFields,
      sortSpec,
      projection: {
        description: 0,
        meta_description: 0,
        meta_keywords: 0,
        file_url: 0,
      },
      populatePath: "publisher_id",
      populateSelect: "name slug logo country website",
    });

    return res.json({
      success: true,
      data: books,
      pagination: {
        limit,
        hasNextPage,
        hasPreviousPage: !!previousCursor,
        nextCursor: nextCursor || null,
        previousCursor: previousCursor || null,
      },
      meta: { days: Number.isFinite(days) && days > 0 ? days : 30 },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch trending books",
        error: error.message,
      });
  }
};

// GET /api/books/latest (CURSOR-BASED)
// Query params: limit (max 5000), cursor
export const getLatestBooks = async (req, res) => {
  try {
    const limit = toNumber(req.query.limit, 10);
    const cursor = req.query.cursor || null;

    const filter = { is_active: true };
    const sortSpec = { created_at: -1, _id: -1 };
    const sortFields = ["created_at", "_id"];

    const {
      data: books,
      hasNextPage,
      nextCursor,
      previousCursor,
    } = await paginateCursor(filter, {
      limit,
      cursor,
      sortFields,
      sortSpec,
      projection: {
        description: 0,
        meta_description: 0,
        meta_keywords: 0,
        file_url: 0,
      },
      populatePath: "publisher_id",
      populateSelect: "name slug logo country website",
    });

    return res.json({
      success: true,
      data: books,
      pagination: {
        limit,
        hasNextPage,
        hasPreviousPage: !!previousCursor,
        nextCursor: nextCursor || null,
        previousCursor: previousCursor || null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch latest books",
        error: error.message,
      });
  }
};

// GET /api/books/on-sale (CURSOR-BASED)
// Query params: limit (max 5000), cursor
export const getOnSaleBooks = async (req, res) => {
  try {
    const limit = toNumber(req.query.limit, 10);
    const cursor = req.query.cursor || null;

    const filter = { is_active: true, is_on_sale: true };
    const sortSpec = { updated_at: -1, _id: -1 };
    const sortFields = ["updated_at", "_id"];

    const {
      data: books,
      hasNextPage,
      nextCursor,
      previousCursor,
    } = await paginateCursor(filter, {
      limit,
      cursor,
      sortFields,
      sortSpec,
      projection: {
        description: 0,
        meta_description: 0,
        meta_keywords: 0,
        file_url: 0,
      },
      populatePath: "publisher_id",
      populateSelect: "name slug logo country website",
    });

    return res.json({
      success: true,
      data: books,
      pagination: {
        limit,
        hasNextPage,
        hasPreviousPage: !!previousCursor,
        nextCursor: nextCursor || null,
        previousCursor: previousCursor || null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch on sale books",
        error: error.message,
      });
  }
};

// GET /api/books/most-viewed (CURSOR-BASED)
// Query params: limit (max 5000), cursor
export const getMostViewedBooks = async (req, res) => {
  try {
    const limit = toNumber(req.query.limit, 10);
    const cursor = req.query.cursor || null;

    const filter = { is_active: true };
    const sortSpec = { views: -1, updated_at: -1, _id: -1 };
    const sortFields = ["views", "updated_at", "_id"];

    const {
      data: books,
      hasNextPage,
      nextCursor,
      previousCursor,
    } = await paginateCursor(filter, {
      limit,
      cursor,
      sortFields,
      sortSpec,
      projection: {
        description: 0,
        meta_description: 0,
        meta_keywords: 0,
        file_url: 0,
      },
      populatePath: "publisher_id",
      populateSelect: "name slug logo country website",
    });

    return res.json({
      success: true,
      data: books,
      pagination: {
        limit,
        hasNextPage,
        hasPreviousPage: !!previousCursor,
        nextCursor: nextCursor || null,
        previousCursor: previousCursor || null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch most viewed books",
        error: error.message,
      });
  }
};

// GET /api/books/deals (CURSOR-BASED)
// Query params: limit (max 5000), cursor
export const getDealsOfTheWeek = async (req, res) => {
  try {
    const limit = toNumber(req.query.limit, 10);
    const cursor = req.query.cursor || null;

    const filter = { is_active: true, is_deal_of_the_week: true };
    const sortSpec = { updated_at: -1, _id: -1 };
    const sortFields = ["updated_at", "_id"];

    const {
      data: books,
      hasNextPage,
      nextCursor,
      previousCursor,
    } = await paginateCursor(filter, {
      limit,
      cursor,
      sortFields,
      sortSpec,
      projection: {
        description: 0,
        meta_description: 0,
        meta_keywords: 0,
        file_url: 0,
      },
      populatePath: "publisher_id",
      populateSelect: "name slug logo country website",
    });

    return res.json({
      success: true,
      data: books,
      pagination: {
        limit,
        hasNextPage,
        hasPreviousPage: !!previousCursor,
        nextCursor: nextCursor || null,
        previousCursor: previousCursor || null,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch deals of the week",
        error: error.message,
      });
  }
};

// NEW: GET /api/books/count
// Returns total number of books and active count
export const getBooksCount = async (req, res) => {
  try {
    const [total, active] = await Promise.all([
      Book.countDocuments({}),
      Book.countDocuments({ is_active: true }),
    ]);
    return res.json({ success: true, data: { total, active } });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch books count",
        error: error.message,
      });
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
      const rel = path.relative(BACKEND_ROOT, abs).split(path.sep).join("/");
      return rel.startsWith("/") ? `/${rel}` : `/${rel}`;
    };

    const processBatch = async (arr, namesByIndex) => {
      const results = [];
      for (let i = 0; i < arr.length; i += 1) {
        const f = arr[i];
        const dir = path.dirname(f.path);
        const origExt =
          path.extname(f.originalname) || path.extname(f.filename) || "";
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
