import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: Date.now }
})

const categoryModel = mongoose.models.category || mongoose.model('category', categorySchema);

export default categoryModel
