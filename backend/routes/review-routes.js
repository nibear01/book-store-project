import express from "express";
import { protect } from "../middlewares/auth-middleware.js";
import { listReviews, createReview, updateReview, deleteReview } from "../controllers/review-controllers.js";

const router = express.Router();

// Public: list reviews for a book
router.get("/", listReviews); // GET /api/reviews?book=bookId&page=&limit=

// Authenticated: create/update/delete own review
router.post("/", protect, createReview); // POST /api/reviews
router.put("/:id", protect, updateReview); // PUT /api/reviews/:id
router.delete("/:id", protect, deleteReview); // DELETE /api/reviews/:id

export default router;
