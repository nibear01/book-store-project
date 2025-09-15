import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: true,
    unique: true,
    default: () => `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      title: String,
      quantity: Number,
      price: Number,
      cover_image: String
    }
  ],
  subtotal: Number,
  tax: Number,
  shipping_cost: Number,
  total_amount: Number,
  shipping_address: { type: Object, required: true },
  payment_method: { type: String, required: true },
  payment_status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
  order_status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  tracking_number: String,
  carrier: String,
  cancellation_reason: String,
  cancelled_at: Date,
  delivered_at: Date
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default mongoose.model("Order", orderSchema);
