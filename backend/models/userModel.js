import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, default: "User" },
    email: { type: String, default: "" }, // Optional for regular users, required for admins
    password: { type: String, default: "" }, // Optional for regular users, required for admins
    phone: { type: String, required: true, unique: true }, // Used for mobile OTP auth
    role: { type: String, enum: ['user', 'admin', 'owner'], default: 'user' },
    otp: { type: String, default: "" },
    otpExpiry: { type: Date },

    defaultAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'address', default: null },

    createdAt: { type: Date, default: Date.now },
    lastLoginAt: { type: Date, default: Date.now }
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel