import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Update last login time
            await userModel.findByIdAndUpdate(user._id, { lastLoginAt: Date.now() });

            const token = createToken(user._id)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {

        const { name, email, password, phone } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phone: phone || ""
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        // Find user in database
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }

        // Check if user has admin or owner role
        if (user.role !== 'admin' && user.role !== 'owner') {
            return res.json({ success: false, message: "Access Denied - Not an admin" })
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Update last login time
            await userModel.findByIdAndUpdate(user._id, { lastLoginAt: Date.now() });

            const token = createToken(user._id)
            res.json({ success: true, token, role: user.role })
        } else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


// Route to get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId, name, email, phone } = req.body;

        // Validate email if provided
        if (email && !validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' });
        }

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await userModel.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.json({ success: false, message: 'Email already in use' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;

        const user = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', user });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to change password
const changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        // Validate new password
        if (newPassword.length < 8) {
            return res.json({ success: false, message: 'New password must be at least 8 characters' });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to promote user to admin (Owner only)
const promoteToAdmin = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.role === 'owner') {
            return res.json({ success: false, message: 'Cannot modify owner role' });
        }

        if (user.role === 'admin') {
            return res.json({ success: false, message: 'User is already an admin' });
        }

        await userModel.findByIdAndUpdate(userId, { role: 'admin' });

        res.json({ success: true, message: `${user.name} has been promoted to admin` });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to demote admin to user (Owner only)
const demoteFromAdmin = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.role === 'owner') {
            return res.json({ success: false, message: 'Cannot modify owner role' });
        }

        if (user.role === 'user') {
            return res.json({ success: false, message: 'User is not an admin' });
        }

        await userModel.findByIdAndUpdate(userId, { role: 'user' });

        res.json({ success: true, message: `${user.name} has been demoted to user` });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to list all users (Admin/Owner)
const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password').sort({ createdAt: -1 });

        res.json({ success: true, users });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to get current user's role
const getUserRole = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId).select('role');

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, role: user.role });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to create first owner account (Public - one-time use)
const createOwner = async (req, res) => {
    try {
        // Check if owner already exists
        const existingOwner = await userModel.findOne({ role: 'owner' });
        if (existingOwner) {
            return res.json({
                success: false,
                message: 'Owner account already exists. Only one owner allowed per system.'
            });
        }

        const { name, email, password, phone } = req.body;

        // Validate inputs
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Name, email, and password are required' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Please enter a valid email' });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters' });
        }

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'A user with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create owner
        const owner = new userModel({
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            role: 'owner'
        });

        await owner.save();

        const token = createToken(owner._id);

        res.json({
            success: true,
            message: 'Owner account created successfully',
            token,
            owner: {
                name: owner.name,
                email: owner.email,
                role: owner.role
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, changePassword, promoteToAdmin, demoteFromAdmin, listUsers, getUserRole, createOwner }