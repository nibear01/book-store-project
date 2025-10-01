import mongoose from "mongoose";
import Review from "../models/review-model.js";
import Book from "../models/book-model.js";

// Helper: recompute and persist book rating and num_reviews from Review collection
const refreshBookStats = async (bookId) => {
  if (!mongoose.isValidObjectId(bookId)) return;
  const agg = await Review.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(bookId) } },
    { $group: { _id: "$book", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg || 0;
  const count = agg[0]?.count || 0;
  await Book.findByIdAndUpdate(bookId, { $set: { rating: Number(avg.toFixed(2)), num_reviews: count } });
};

// GET /api/reviews?book=<bookId>&page=1&limit=10
export const listReviews = async (req, res) => {
  try {
    const { book: bookId } = req.query;
    if (!bookId || !mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: "Valid book id is required" });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const filter = { book: bookId };
    const total = await Review.countDocuments(filter);
    const items = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name rating comment createdAt updatedAt user")
      .lean();

    // Compute average rating regardless of pagination
    const avgAgg = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(bookId) } },
      { $group: { _id: "$book", avg: { $avg: "$rating" } } },
    ]);
    const avgRating = avgAgg[0]?.avg ? Number(avgAgg[0].avg.toFixed(2)) : 0;

    return res.json({ success: true, data: items, pagination: { total, page, pages: Math.ceil(total / limit) || 1, limit }, meta: { avgRating } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch reviews", error: error.message });
  }
};

// POST /api/reviews  { book, rating, comment }
export const createReview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { book: bookId, rating, comment } = req.body || {};

    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }
    if (!Number.isFinite(Number(rating)) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }
    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ success: false, message: "Comment is required" });
    }

    const book = await Book.findById(bookId).select("_id is_active");
    if (!book || !book.is_active) {
      return res.status(404).json({ success: false, message: "Book not found or inactive" });
    }

    // Create or upsert user's single review per book
    const doc = await Review.findOneAndUpdate(
      { book: bookId, user: userId },
      { $set: { name: req.user?.name || "Anonymous", rating: Number(rating), comment: String(comment).trim() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await refreshBookStats(bookId);
    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already reviewed this book" });
    }
    return res.status(500).json({ success: false, message: "Failed to create review", error: error.message });
  }
};

// PUT /api/reviews/:id  { rating?, comment? }
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid review id" });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (String(review.user) !== String(req.user?._id) && !req.policy?.isAdmin) {
      return res.status(403).json({ success: false, message: "Not allowed to edit this review" });
    }

    const patch = {};
    if (req.body.rating !== undefined) {
      const r = Number(req.body.rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) return res.status(400).json({ success: false, message: "Invalid rating" });
      patch.rating = r;
    }
    if (req.body.comment !== undefined) {
      const c = String(req.body.comment).trim();
      if (!c) return res.status(400).json({ success: false, message: "Comment cannot be empty" });
      patch.comment = c;
    }

    const updated = await Review.findByIdAndUpdate(id, { $set: patch }, { new: true });
    await refreshBookStats(updated.book);
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update review", error: error.message });
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid review id" });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (String(review.user) !== String(req.user?._id) && !req.policy?.isAdmin) {
      return res.status(403).json({ success: false, message: "Not allowed to delete this review" });
    }

    await Review.findByIdAndDelete(id);
    await refreshBookStats(review.book);
    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete review", error: error.message });
  }
};

export default { listReviews, createReview, updateReview, deleteReview };
