import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },

    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product' }],

    updatedAt: { type: Date, default: Date.now }
})

// Auto-update updatedAt on save
wishlistSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const wishlistModel = mongoose.models.wishlist || mongoose.model('wishlist', wishlistSchema);

export default wishlistModel
