import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: String,
    genre: [{ type: String, trim: true }], // was: String
    language: String,
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    meta_title: { type: String, trim: true },
    meta_description: { type: String, trim: true },
    meta_keywords: [{ type: String, trim: true }],
    isbn: String,
    cover_image: [{ type: String }],
    file_url: { type: String, default: null },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    published_date: Date,
    rating: { type: Number, default: 0 },
    num_reviews: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;
