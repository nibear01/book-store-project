import mongoose from "mongoose";

const AuthorRequestSchema = new mongoose.Schema(
  {
    // Applicant info
    fullName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    // Work info
    affiliation: String,
    title: { type: String, required: true },
    typeOfWork: { type: String, default: "Book" },
    abstract: { type: String, required: true },
    categoryType: { type: String, enum: ["English", "Bangla", "Bilingual", ""], default: "" },
    // Agreements
    rightsOriginal: { type: Boolean, required: true },
    rightsPublish: { type: Boolean, required: true },
    agreeEditorial: { type: Boolean, required: true },
    additionalRequests: String,
    signature: String,
    date: String,
    // Status workflow
    status: {
      type: String,
      enum: ["unverified", "pending", "verified", "cancelled"],
      default: "pending",
      index: true,
    },
    emailVerified: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
  },
  { timestamps: true }
);

const AuthorRequest = mongoose.model("AuthorRequest", AuthorRequestSchema);
export default AuthorRequest;
