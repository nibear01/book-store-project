import mongoose from "mongoose";

const affiliateSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    
    // Affiliate Specific Details
    promo_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    commission_rate: {
      type: Number,
      default: 10, // 10% commission by default
      min: 0,
      max: 100,
    },
    
    // Status & Verification
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "rejected"],
      default: "pending",
      index: true,
    },
    
    // Financial Information
    total_earnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    available_balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    withdrawn_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Payment Details
    payment_method: {
      type: String,
      enum: ["bank_transfer", "mobile_banking", "paypal", "other"],
      default: "bank_transfer",
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
    
    // Statistics
    total_referrals: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_orders: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_sales_value: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Profile
    profile_image: {
      type: String,
      default: null,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    
    // Password Reset
    resetPasswordToken: {
      type: String,
      default: null,
      index: true,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    
    // Admin Notes
    admin_notes: {
      type: String,
      trim: true,
    },
    
    // Approval
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approved_at: {
      type: Date,
      default: null,
    },
    rejected_at: {
      type: Date,
      default: null,
    },
    rejection_reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Index for faster queries
affiliateSchema.index({ status: 1, created_at: -1 });

const Affiliate = mongoose.model("Affiliate", affiliateSchema);

export default Affiliate;
