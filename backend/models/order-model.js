// backend/models/order-model.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    order_number: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    total_amount: {
        type: Number,
        required: true
    },
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
        method: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: 'pending'
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Order', orderSchema);