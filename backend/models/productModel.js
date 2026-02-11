import mongoose from "mongoose";

// Variant Schema - Each size+color combination
const variantSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [
        {
            url: { type: String },
            order: { type: Number }
        }
    ]
}, { _id: true });

const productSchema = new mongoose.Schema({
    // Basic Info
    title: { type: String, required: true },
    name: { type: String }, // Backward compatibility
    slug: { type: String, unique: true, required: true },
    description: { type: String, required: true },

    // Pricing - basePrice is the lowest variant price (for sorting/display)
    basePrice: { type: Number, required: true },
    price: { type: Number }, // Deprecated - kept for backward compatibility
    discountPrice: { type: Number },
    currency: { type: String, default: "INR" },

    // Media
    images: [
        {
            url: { type: String, required: true },
            order: { type: Number, required: true },
            color: { type: String, default: null } // Color-specific images, null = shown for all colors
        }
    ],

    // Categorization
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    brand: { type: String },

    // Variants - THE KEY CHANGE
    variants: [variantSchema],

    // Available Options
    sizes: { type: Array, default: [] },
    colors: { type: Array, default: [] },

    // Backward compatibility - deprecated
    stockByVariant: { type: Map, of: Number },

    // Flags
    bestseller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Timestamps
    createdAt: { type: Number, required: true, default: Date.now },
    updatedAt: { type: Number, required: true, default: Date.now }
});

// Auto-update updatedAt on save
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    if (this.isNew) {
        this.createdAt = Date.now();
    }
    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel