import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },

    defaultAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'address', default: null },

    createdAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date, default: Date.now }
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel