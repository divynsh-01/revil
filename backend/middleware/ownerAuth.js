import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const ownerAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "Not Authorized - Login Required" })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from token
        const user = await userModel.findById(token_decode.id).select('-password');

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        // Check if user is owner
        if (user.role !== 'owner') {
            return res.json({ success: false, message: "Access Denied - Owner privileges required" })
        }

        // Attach user to request
        req.user = user;
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default ownerAuth
