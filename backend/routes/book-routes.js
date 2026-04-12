import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import { isAdmin } from "../middlewares/admin-middleware.js";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getFeaturedBooks,
  getTrendingBooks,
  getLatestBooks,
  getOnSaleBooks,
  getMostViewedBooks,
  getDealsOfTheWeek,
  getBooksCount,
  bulkUploadAssets,
} from "../controllers/book-controllers.js";
import { uploadBookAssets } from "../middlewares/upload-middleware.js";
import { uploadBulkAssets } from "../middlewares/upload-middleware.js";

const router = express.Router();

// Public

// GET /api/books (CURSOR-BASED PAGINATION)
// Query: ?limit=20&cursor=<base64>&search=term&genre=GenreName&sort=-created_at&...
// Cursor params: limit (max 5000, default 20), cursor (base64 encoded, from nextCursor)
// Filter params: search, genre, author, language, minPrice, maxPrice, sort, minRating, inStock, onSale, deals, minViews, status
// DEPRECATED: page param (fallback supported for legacy clients)
router.get("/", getBooks);

// GET /api/books/featured (CURSOR-BASED PAGINATION)
// Query: ?limit=10&cursor=<base64>
router.get("/featured", getFeaturedBooks);

// GET /api/books/trending (CURSOR-BASED PAGINATION)
// Query: ?limit=10&cursor=<base64>&days=30
router.get("/trending", getTrendingBooks);

// GET /api/books/latest (CURSOR-BASED PAGINATION)
// Query: ?limit=10&cursor=<base64>
router.get("/latest", getLatestBooks);

// GET /api/books/on-sale (CURSOR-BASED PAGINATION)
// Query: ?limit=10&cursor=<base64>
router.get("/on-sale", getOnSaleBooks);

// GET /api/books/most-viewed (CURSOR-BASED PAGINATION)
// Query: ?limit=10&cursor=<base64>
router.get("/most-viewed", getMostViewedBooks);

// GET /api/books/deals (CURSOR-BASED PAGINATION)
// Query: ?limit=10&cursor=<base64>
router.get("/deals", getDealsOfTheWeek);

// GET /api/books/count
router.get("/count", getBooksCount);

// GET /api/books/:slug
// Path: /api/books/:slug
router.get("/:slug", getBookById);

// Admin-only (with uploads)

// POST /api/books
// FormData: { title, author, price, meta_title, ... } + files: cover_image[], file_url
router.post("/", protect, isAdmin, uploadBookAssets, createBook);

// NEW: POST /api/books/bulk-upload
// FormData: bulk_images[], bulk_files[]; optional fields: renameMap (JSON), imagesNames (JSON), filesNames (JSON)
router.post(
  "/bulk-upload",
  protect,
  isAdmin,
  uploadBulkAssets,
  bulkUploadAssets,
);

// PUT /api/books/:id
// FormData: { ...fields } + files: cover_image[], file_url
router.put("/:id", protect, isAdmin, uploadBookAssets, updateBook);

// DELETE /api/books/:id
// Query: ?hard=true (for permanent delete)
router.delete("/:id", protect, isAdmin, deleteBook);

export default router;
//   upload.fields([
//     { name: "cover_image", maxCount: 5 },
//     { name: "file_url", maxCount: 1 },
//   ]),
//   updateBook
// );
// router.delete("/:id", protect, isAdmin, deleteBook);

// export default router;
