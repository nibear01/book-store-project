import mongoose from "mongoose";

const affiliateCommissionSchema = new mongoose.Schema(
  {
    affiliate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      // unique index defined below via schema.index; omit field index to avoid duplicate
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    promo_code_used: {
      type: String,
      required: true,
      uppercase: true,
    },
    
    // Order Details
    order_number: {
      type: String,
      required: true,
    },
    order_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Commission Calculation
    commission_rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    commission_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Discount given to customer
    discount_percentage: {
      type: Number,
      default: 5, // 5% discount for customer
      min: 0,
      max: 100,
    },
    discount_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "cancelled"],
      default: "pending",
      index: true,
    },
    
    // Payment tracking
    paid_at: {
      type: Date,
      default: null,
    },
    payment_reference: {
      type: String,
      trim: true,
    },
    
    // Admin tracking
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approved_at: {
      type: Date,
      default: null,
    },
    
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound indexes
affiliateCommissionSchema.index({ affiliate: 1, status: 1, created_at: -1 });
affiliateCommissionSchema.index({ order: 1 }, { unique: true }); // One commission per order

const AffiliateCommission = mongoose.model("AffiliateCommission", affiliateCommissionSchema);

export default AffiliateCommission;
