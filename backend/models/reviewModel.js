import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    // The orderId (custom string like "ORD123") of a Delivered order that grants eligibility
    verifiedOrderId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// One review per user per product — enforced at DB level
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Auto-update updatedAt on save
reviewSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema);

export default reviewModel;
