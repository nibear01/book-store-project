import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: String,
    genre: [{ type: String, trim: true }],
    language: String,
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    meta_title: { type: String, trim: true, required: true },
    meta_description: { type: String, trim: true },
    meta_keywords: [{ type: String, trim: true }],
    isbn: { type: String, trim: true, unique: true, sparse: true },
    cover_image: [{ type: String }],
    file_url: { type: String, default: null },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    published_date: Date,
    rating: { type: Number, default: 0 },
    num_reviews: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    publisher: { type: String, trim: true },
    publisher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Publisher" }, // added (reference to Publisher model)
    pages: { type: Number, default: 0 }, // added
    isPrintOnDemand: { type: Boolean, default: false }, // added

    // On sale / most viewed / deals of the week
    is_on_sale: { type: Boolean, default: false },
    sale_price: { type: Number, default: null }, // when on sale, must be >= 0 and < price (validated in controller)
    views: { type: Number, default: 0 }, // incremented on detail view
    is_deal_of_the_week: { type: Boolean, default: false },
    deal_start: { type: Date, default: null }, // optional
    deal_end: { type: Date, default: null },   // optional
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// ── Performance indexes ──────────────────────────────────────────────

// Primary listing: active books sorted by newest
bookSchema.index({ is_active: 1, created_at: -1 });

// Featured books
bookSchema.index({ is_active: 1, is_featured: 1, updated_at: -1 });

// On-sale books
bookSchema.index({ is_active: 1, is_on_sale: 1, updated_at: -1 });

// Deals of the week
bookSchema.index({ is_active: 1, is_deal_of_the_week: 1, updated_at: -1 });

// Most viewed
bookSchema.index({ is_active: 1, views: -1 });

// Trending (rating + reviews)
bookSchema.index({ is_active: 1, updated_at: -1, rating: -1, num_reviews: -1 });

// Price range filtering + sort
bookSchema.index({ is_active: 1, price: 1 });

// Genre filtering
bookSchema.index({ is_active: 1, genre: 1 });

// Text search on title, author, description (much faster than $regex)
bookSchema.index(
  { title: "text", author: "text", description: "text", isbn: "text" },
  { weights: { title: 10, author: 5, isbn: 3, description: 1 }, name: "book_text_search" }
);

// Slug lookup (already unique/sparse but compound with is_active for detail page)
bookSchema.index({ slug: 1, is_active: 1 });

// Publisher reference
bookSchema.index({ publisher_id: 1 });

const Book = mongoose.model("Book", bookSchema);
export default Book;
