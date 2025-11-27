import express from "express";
import {
  createBookRequest,
  listBookRequests,
  updateBookRequestStatus,
  validateCreate,
  checkEmailVerification,
} from "../controllers/book-request-controllers.js";
import { protect, authorize } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public: check if email is already verified
router.get("/check-email", checkEmailVerification);

// Public: submit a book request (optionally authenticated)
router.post("/submit", validateCreate(), createBookRequest);

// Admin: list and update
router.get("/", protect, authorize("admin"), listBookRequests);
router.patch("/:id/status", protect, authorize("admin"), updateBookRequestStatus);

export default router;
