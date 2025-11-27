import mongoose from "mongoose";

// Subscriber model
// - Follows a simple contract to represent a person who opted in to receive promotional emails
// - Only active subscribers will be notified
// - Email is unique (case-insensitive) and trimmed
const SubscriberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Subscriber = mongoose.model("Subscriber", SubscriberSchema);

export default Subscriber;
