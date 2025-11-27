import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    // Whether this item used print-on-demand configuration
    configured: { type: Boolean, default: false },
    // Selected print variant (if configured)
    variant: {
      paperQuality: { type: String, default: null },
      printSide: { type: String, default: null },
      paperSize: { type: String, default: null },
      colorMode: { type: String, default: null },
    },
    // Pricing breakdown for transparency and profit separation
    pricing: {
      contentPrice: { type: Number, default: null },
      printCost: { type: Number, default: null },
      margin: { type: Number, default: null },
      baseCost: { type: Number, default: null },
      finalPrice: { type: Number, default: null },
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    total_price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
