import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: null  // Only for percentage type
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usedCount: {
        type: Number,
        default: 0
    },
    perUserLimit: {
        type: Number,
        default: null // null = unlimited per user
    },
    usesByUser: {
        type: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
                count: { type: Number, default: 0 }
            }
        ],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCategories: {
        type: [String],
        default: []  // Empty = all categories
    },
    applicableProducts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'product',
        default: []  // Empty = all products
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const couponModel = mongoose.models.coupon || mongoose.model('coupon', couponSchema);

export default couponModel;
