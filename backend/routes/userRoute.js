import express from 'express';
import { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile, changePassword, promoteToAdmin, demoteFromAdmin, listUsers, getUserRole, createOwner } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import ownerAuth from '../middleware/ownerAuth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/create-owner', createOwner) // One-time owner creation

// Protected routes
userRouter.post('/profile', authUser, getUserProfile)
userRouter.post('/update-profile', authUser, updateUserProfile)
userRouter.post('/change-password', authUser, changePassword)
userRouter.post('/role', authUser, getUserRole)

// Owner-only routes
userRouter.post('/promote', ownerAuth, promoteToAdmin)
userRouter.post('/demote', ownerAuth, demoteFromAdmin)

// Admin/Owner routes
userRouter.get('/list', adminAuth, listUsers)

export default userRouter;