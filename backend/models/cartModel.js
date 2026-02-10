import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product' },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Optional for backward compatibility

    // Denormalized data for performance (snapshot at time of add)
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    size: { type: String, required: true },
    color: { type: String, default: null }, // Optional - some products may not have colors

    quantity: { type: Number, required: true, default: 1 }
});

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    items: [cartItemSchema]
}, { timestamps: true });

// Force model recreation - delete existing model if present
if (mongoose.models.cart) {
    delete mongoose.models.cart;
}

const cartModel = mongoose.model('cart', cartSchema);

export default cartModel;
