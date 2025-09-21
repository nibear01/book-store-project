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
  bulkUploadAssets,
} from "../controllers/book-controllers.js";
import { uploadBookAssets } from "../middlewares/upload-middleware.js";
import { uploadBulkAssets } from "../middlewares/upload-middleware.js";

const router = express.Router();

// Public

// GET /api/books
// Query: ?page=1&limit=10&search=term&genre=GenreName&author=AuthorName&language=Language&minPrice=0&maxPrice=100&sort=-created_at
router.get("/", getBooks);

// GET /api/books/featured
// Query: ?limit=10
router.get("/featured", getFeaturedBooks);

// GET /api/books/trending
// Query: ?limit=10&days=30
router.get("/trending", getTrendingBooks);

// GET /api/books/latest
// Query: ?limit=10
router.get("/latest", getLatestBooks);

// GET /api/books/on-sale
// Query: ?limit=10
router.get("/on-sale", getOnSaleBooks);

// GET /api/books/most-viewed
// Query: ?limit=10
router.get("/most-viewed", getMostViewedBooks);

// GET /api/books/deals
// Query: ?limit=10
router.get("/deals", getDealsOfTheWeek);

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
  bulkUploadAssets
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
