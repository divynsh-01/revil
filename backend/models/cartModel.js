import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false })

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },

    items: [cartItemSchema],

    updatedAt: { type: Date, default: Date.now }
})

// Auto-update updatedAt on save
cartSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const cartModel = mongoose.models.cart || mongoose.model('cart', cartSchema);

export default cartModel
