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

const Book = mongoose.model("Book", bookSchema);
export default Book;
