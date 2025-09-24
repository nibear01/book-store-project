import mongoose from "mongoose";
import Category from "../models/category-model.js";
import Book from "../models/book-model.js";

// Lightweight slugify (ensure consistent with model if manual slug provided)
const slugify = (s = "") =>
  String(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

// GET /api/categories
// Query params: ?includeEmpty=true|false&status=all|active|inactive
// Returns list with book counts for each category (matching active books only by default)
export const getCategories = async (req, res) => {
  try {
    const includeEmpty = String(req.query.includeEmpty || "false").toLowerCase() === "true";
    const status = String(req.query.status || "active").toLowerCase();

    const filter = {};
    if (status === "active") filter.is_active = true;
    else if (status === "inactive") filter.is_active = false;
    // status=all => no filter

    // Base categories
    const categories = await Category.find(filter).sort({ order: 1, name: 1 }).lean();
    if (!categories.length) {
      return res.json({ success: true, data: [], total: 0 });
    }

    // Count books per category by matching any genre element (case-insensitive)
    const names = categories.map((c) => c.name);
    const lowerNameSet = new Set(names.map((n) => n.toLowerCase()));
    const bookCounts = await Book.aggregate([
      { $match: { is_active: true, genre: { $exists: true, $ne: [] } } },
      { $unwind: "$genre" },
      { $addFields: { genre_lc: { $toLower: "$genre" } } },
      { $match: { genre_lc: { $in: Array.from(lowerNameSet) } } },
      { $group: { _id: "$genre_lc", count: { $sum: 1 } } },
    ]);

    const countMap = Object.create(null);
    for (const bc of bookCounts) countMap[bc._id] = bc.count;

    let result = categories.map((c) => ({
      ...c,
      book_count: countMap[c.name.toLowerCase()] || 0,
    }));

    if (!includeEmpty) {
      result = result.filter((c) => c.book_count > 0);
    }

    return res.json({ success: true, data: result, total: result.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch categories", error: error.message });
  }
};

// GET /api/categories/:slug
export const getCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ success: false, message: "Invalid category slug" });
    const category = await Category.findOne({ slug }).lean();
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    return res.json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch category", error: error.message });
  }
};

// POST /api/categories
// Body: { name, description?, image?, synonyms?, order?, slug? }
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const payload = sanitizeCategoryPayload(req.body, true);

    // If slug provided manually, ensure uniqueness; else model pre-save handles it
    if (payload.slug) {
      payload.slug = await ensureUniqueSlug(payload.slug);
    }

    const created = await Category.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    const code = error.message && error.message.startsWith("Invalid") ? 400 : 500;
    return res.status(code).json({ success: false, message: "Failed to create category", error: error.message });
  }
};

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid category id" });

    const payload = sanitizeCategoryPayload(req.body, false);

    if (payload.slug) {
      payload.slug = await ensureUniqueSlug(payload.slug, id);
    }

    const updated = await Category.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Category not found" });
    return res.json({ success: true, data: updated });
  } catch (error) {
    const code = error.message && error.message.startsWith("Invalid") ? 400 : 500;
    return res.status(code).json({ success: false, message: "Failed to update category", error: error.message });
  }
};

// DELETE /api/categories/:id (hard delete or soft via ?hard=false)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid category id" });

    const doHardDelete = String(hard ?? "true").toLowerCase() !== "false";
    if (doHardDelete) {
      const deleted = await Category.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });
      return res.json({ success: true, message: "Category permanently deleted" });
    }

    const updated = await Category.findByIdAndUpdate(id, { $set: { is_active: false } }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Category not found" });
    return res.json({ success: true, message: "Category deactivated", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete category", error: error.message });
  }
};

// Helpers
const sanitizeCategoryPayload = (body = {}, isCreate = false) => {
  const allowed = ["name", "slug", "description", "image", "synonyms", "is_active", "order"];
  const out = {};
  for (const k of allowed) if (body[k] !== undefined) out[k] = body[k];

  if (out.name !== undefined) {
    out.name = String(out.name).trim();
    if (!out.name) throw new Error("Invalid name");
  } else if (isCreate) {
    throw new Error("Invalid name");
  }

  if (out.slug !== undefined) {
    out.slug = slugify(String(out.slug));
  }

  if (out.synonyms !== undefined) {
    if (Array.isArray(out.synonyms)) {
      out.synonyms = out.synonyms.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof out.synonyms === "string") {
      out.synonyms = out.synonyms
        .split(/[,|]/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      out.synonyms = [];
    }
  }

  if (out.order !== undefined) {
    const o = Number(out.order);
    if (!Number.isInteger(o) || o < 0) throw new Error("Invalid order");
    out.order = o;
  }

  if (out.is_active !== undefined) {
    out.is_active = Boolean(out.is_active);
  }
  return out;
};

const ensureUniqueSlug = async (slug, excludeId) => {
  if (!slug) return undefined;
  let candidate = slug;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Category.exists(query);
    if (!exists) return candidate;
    candidate = `${slug}-${i}`;
    i += 1;
  }
};

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
