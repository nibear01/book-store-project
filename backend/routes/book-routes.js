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

const router = express.Router();

// Public
router.get("/", getBooks);
router.get("/featured", getFeaturedBooks);
router.get("/trending", getTrendingBooks);
router.get("/latest", getLatestBooks);
router.get("/:id", getBookById);

// Admin-only
router.post("/", protect, isAdmin, createBook);
router.put("/:id", protect, isAdmin, updateBook);
router.delete("/:id", protect, isAdmin, deleteBook);

export default router;
