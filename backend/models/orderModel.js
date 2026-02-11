import mongoose from 'mongoose'
import { ORDER_STATUS } from '../config/orderStatus.js'

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    title: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false })

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true }, // Custom ID like "ORD123"
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

    // Snapshot of items (prices won't change later)
    items: [orderItemSchema],

    // Pricing breakdown
    pricing: {
        subtotal: { type: Number, required: true },
        shipping: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        couponCode: { type: String, default: "" },
        couponDiscount: { type: Number, default: 0 },
        total: { type: Number, required: true }
    },

    // Payment information
    payment: {
        method: { type: String, required: true }, // razorpay, stripe, cod
        paymentId: { type: String, default: "" },
        orderId: { type: String, default: "" },
        status: { type: String, default: "pending" } // pending, paid, failed
    },

    // Snapshot of shipping address (won't change if user updates address)
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String, default: "" },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },

    // ... (previous code)

    // Order status workflow
    orderStatus: {
        type: String,
        required: true,
        default: ORDER_STATUS.ORDER_PLACED,
        enum: Object.values(ORDER_STATUS)
    },

    // Tracking information
    tracking: {
        courier: { type: String, default: "" },
        trackingId: { type: String, default: "" },
        trackingUrl: { type: String, default: "" }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

// Auto-update updatedAt on save
orderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)
export default orderModel;