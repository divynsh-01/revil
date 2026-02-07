import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

    name: { type: String, required: true },
    phone: { type: String, required: true },

    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    isDefault: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now }
})

const addressModel = mongoose.models.address || mongoose.model('address', addressSchema);

export default addressModel
