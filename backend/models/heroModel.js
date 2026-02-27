import mongoose from "mongoose";

const heroSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    link: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const heroModel = mongoose.models.hero || mongoose.model("hero", heroSchema);

export default heroModel;
