import express from "express";
import {
  createAuthor,
  getAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  addBookToAuthor,
  removeBookFromAuthor,
  getAuthorBySlug,
  setAuthorStatus,
  reviewAuthor,
} from "../controllers/author-controller.js";
import { protect } from "../middlewares/auth-middleware.js";
import { isAdmin } from "../middlewares/admin-middleware.js";
import { uploadAuthorPhoto } from "../middlewares/upload-middleware.js";

const router = express.Router();

// CRUD
router.get("/", getAuthors);
router.get("/slug/:slug", getAuthorBySlug);
router.get("/:id", getAuthorById);
router.post("/", protect, isAdmin, uploadAuthorPhoto, createAuthor);
router.put("/:id", protect, isAdmin, uploadAuthorPhoto, updateAuthor);
router.delete("/:id", protect, isAdmin, deleteAuthor);

// Manage books in an author
router.post("/:id/books", protect, isAdmin, addBookToAuthor);
router.delete("/:id/books/:bookId", protect, isAdmin, removeBookFromAuthor);

// Workflow endpoints
router.patch("/:id/status", protect, isAdmin, setAuthorStatus);
router.patch("/:id/review", protect, isAdmin, reviewAuthor);

export default router;
