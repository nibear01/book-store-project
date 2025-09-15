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
} from "../controllers/book-controllers.js";
import { uploadBookAssets } from "../middlewares/upload-middleware.js";

const router = express.Router();

// Public
router.get("/", getBooks);
router.get("/featured", getFeaturedBooks);
router.get("/trending", getTrendingBooks);
router.get("/latest", getLatestBooks);
router.get("/:slug", getBookById);

// Admin-only (with uploads)
router.post("/", protect, isAdmin, uploadBookAssets, createBook);
router.put("/:id", protect, isAdmin, uploadBookAssets, updateBook);
router.delete("/:id", protect, isAdmin, deleteBook);

export default router;
//     return cb(null, uploadRoot);
//   },
//   filename: (req, file, cb) => {
//     const ts = Date.now();
//     const safe = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
//     cb(null, `${ts}-${safe}`);
//   },
// });
// const fileFilter = (req, file, cb) => {
//   if (file.fieldname === "cover_image") {
//     if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
//     return cb(new Error("Invalid image file type"), false);
//   }
//   if (file.fieldname === "file_url") {
//     const allowed = new Set(["application/pdf", "application/epub+zip"]);
//     if (allowed.has(file.mimetype)) return cb(null, true);
//     return cb(new Error("Invalid book file type"), false);
//   }
//   cb(null, false);
// };
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 25 * 1024 * 1024, // 25MB per file
//     files: 6, // 5 images + 1 book file
//   },
// });

// // Public
// router.get("/", getBooks);
// router.get("/featured", getFeaturedBooks);
// router.get("/trending", getTrendingBooks);
// router.get("/latest", getLatestBooks);
// router.get("/:id", getBookById);

// // Admin-only (with uploads)
// router.post(
//   "/",
//   protect,
//   isAdmin,
//   upload.fields([
//     { name: "cover_image", maxCount: 5 },
//     { name: "file_url", maxCount: 1 },
//   ]),
//   createBook
// );
// router.put(
//   "/:id",
//   protect,
//   isAdmin,
//   upload.fields([
//     { name: "cover_image", maxCount: 5 },
//     { name: "file_url", maxCount: 1 },
//   ]),
//   updateBook
// );
// router.delete("/:id", protect, isAdmin, deleteBook);

// export default router;
