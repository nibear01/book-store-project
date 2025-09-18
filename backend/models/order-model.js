// server/models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true } // Price at time of order
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true }, // Generated pre-save
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'cash_on_delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: Date,
  trackingNumber: String, // For shipped/delivered status
  carrier: String        // For shipped/delivered status
}, { timestamps: true });

// Generate unique order number before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // Find the highest existing count for today's date prefix
      const todayPrefix = `ORD-${year}${month}${day}`;
      const lastOrder = await mongoose.model('Order')
        .findOne({ orderNumber: new RegExp(`^${todayPrefix}-`) })
        .sort({ orderNumber: -1 });

      let count = 1;
      if (lastOrder) {
         const lastCount = parseInt(lastOrder.orderNumber.split('-').pop(), 10);
         if (!isNaN(lastCount)) {
            count = lastCount + 1;
         }
      }

      this.orderNumber = `${todayPrefix}-${String(count).padStart(4, '0')}`;
    } catch (error) {
      return next(error); // Pass error to Express error handler
    }
  }
  next();
});

export default mongoose.model('Order', orderSchema);
