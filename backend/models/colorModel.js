import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    hexCode: { type: String, default: "" }, // Optional for now
    createdAt: { type: Date, default: Date.now }
})

const colorModel = mongoose.models.color || mongoose.model('color', colorSchema);

export default colorModel;
