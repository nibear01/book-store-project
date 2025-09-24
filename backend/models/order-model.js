// backend/models/order-model.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  order_number: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    book_title: { type: String, required: true },
    book_cover: { type: String, default: null }, // snapshot of first cover image at purchase time
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true } // unit price at time of purchase
  }],
  // Pricing breakdown
  subtotal_amount: { type: Number, required: true }, // sum of (price * qty) before discounts/shipping
  discount_amount: { type: Number, default: 0 },
  discount_label: { type: String, default: '' },
  shipping_amount: { type: Number, default: 0 },
  grand_total: { type: Number, required: true }, // subtotal - discount + shipping (never < 0)
  // Backward compatibility: keep total_amount (mirrors grand_total)
  total_amount: { type: Number, required: true },
  order_status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shipping_address: {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  payment_info: {
    method: { type: String, required: true },
    status: { type: String, default: 'pending' }
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);