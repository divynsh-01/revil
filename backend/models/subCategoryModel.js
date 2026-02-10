import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    subCategoryId: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true }, // Links to Category
    name: { type: String, required: true },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
})

const subCategoryModel = mongoose.models.subCategory || mongoose.model('subCategory', subCategorySchema);

export default subCategoryModel
