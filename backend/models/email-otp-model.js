import mongoose from "mongoose";

const EmailOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null }, // set when the code is confirmed (author requests)
  },
  { timestamps: true }
);

// Note: Avoid duplicate index declarations. Field-level index on `email` is sufficient.

const EmailOtp = mongoose.model("EmailOtp", EmailOtpSchema);
export default EmailOtp;
