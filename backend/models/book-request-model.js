import mongoose from "mongoose";

const BookRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    isbn: { type: String, trim: true },
    publisher: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "fulfilled"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

BookRequestSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model("BookRequest", BookRequestSchema);
