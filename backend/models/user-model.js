import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
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
    roles: {
      type: [String],
      enum: [
        "user",
        "admin",
        "author",
        "book_manager",
        "order_manager",
        "printing_manager",
        "delivery_manager",
        "finance_manager",
        "customer_support",
        "marketing_manager",
      ],
      default: ["user"],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
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
    resetPasswordToken: {
      type: String,
      default: null,
      index: true,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      index: true,
    },
    profile_image: {
      type: String,
      default: null,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedCode: {
      type: String,
      default: null,
    },
    verifiedCodeSentAt: {
      type: Date,
      default: null,
    },
    verifiedCodeExpires: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const User = mongoose.model("User", userSchema);

export default User;
