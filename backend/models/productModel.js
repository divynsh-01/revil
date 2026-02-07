import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    // Basic Information
    title: { type: String, required: true },
    name: { type: String }, // Backward compatibility (optional)
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },

    // Pricing
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: null },
    currency: { type: String, default: "INR" },

    // Categorization
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    brand: { type: String, default: "" },

    // Media
    images: [
        {
            url: { type: String, required: true },
            order: { type: Number, required: true }
        }
    ],

    // Variants
    sizes: { type: [String], required: true },
    colors: { type: [String], default: [] },

    // Stock Management
    stockByVariant: {
        type: Map,
        of: Number,
        default: {}
    },

    // Status Flags
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

// Auto-update updatedAt on save
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel