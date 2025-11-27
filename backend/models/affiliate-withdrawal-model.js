import mongoose from "mongoose";

const affiliateWithdrawalSchema = new mongoose.Schema(
  {
    affiliate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
      index: true,
    },
    
    // Withdrawal Details
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"],
    },
    
    // Payment Method
    payment_method: {
      type: String,
      required: true,
      enum: ["bank_transfer", "mobile_banking", "paypal", "other"],
    },
    payment_details: {
      account_holder_name: { type: String, trim: true },
      account_number: { type: String, trim: true },
      bank_name: { type: String, trim: true },
      branch_name: { type: String, trim: true },
      mobile_number: { type: String, trim: true },
      paypal_email: { type: String, trim: true },
      other_details: { type: String, trim: true },
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    
    // Processing
    processed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processed_at: {
      type: Date,
      default: null,
    },
    
    // Payment tracking
    payment_reference: {
      type: String,
      trim: true,
    },
    transaction_id: {
      type: String,
      trim: true,
    },
    
    // Notes
    affiliate_note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },
    admin_note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },
    rejection_reason: {
      type: String,
      trim: true,
    },
    
    // Completion
    completed_at: {
      type: Date,
      default: null,
    },
    rejected_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
affiliateWithdrawalSchema.index({ affiliate: 1, status: 1, created_at: -1 });
affiliateWithdrawalSchema.index({ status: 1, created_at: -1 });

const AffiliateWithdrawal = mongoose.model("AffiliateWithdrawal", affiliateWithdrawalSchema);

export default AffiliateWithdrawal;
