import express from "express";
import {
  createPublisher,
  getPublishers,
  getPublisherById,
  getPublisherBySlug,
  updatePublisher,
  deletePublisher,
  addBookToPublisher,
  removeBookFromPublisher,
  getBooksByPublisher,
} from "../controllers/publisher-controller.js";
import { protect } from "../middlewares/auth-middleware.js";
import { isAdmin } from "../middlewares/admin-middleware.js";
import { uploadPublisherLogo } from "../middlewares/upload-middleware.js";

const router = express.Router();

// Public routes
router.get("/", getPublishers);
router.get("/slug/:slug", getPublisherBySlug);
router.get("/:identifier/books", getBooksByPublisher); // Get books by publisher (ID or slug)
router.get("/:id", getPublisherById);

// Admin-only routes
router.post("/", protect, isAdmin, uploadPublisherLogo, createPublisher);
router.put("/:id", protect, isAdmin, uploadPublisherLogo, updatePublisher);
router.delete("/:id", protect, isAdmin, deletePublisher);

// Manage books in a publisher
router.post("/:id/books", protect, isAdmin, addBookToPublisher);
router.delete("/:id/books/:bookId", protect, isAdmin, removeBookFromPublisher);

export default router;
