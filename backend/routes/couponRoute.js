import express from 'express';
import {
    validateCoupon,
    applyCoupon,
    listAvailableCoupons,
    createCoupon,
    listCoupons,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus
} from '../controllers/couponController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const couponRouter = express.Router();

// User routes
couponRouter.post('/validate', authUser, validateCoupon);
couponRouter.post('/apply', authUser, applyCoupon);
couponRouter.get('/available', authUser, listAvailableCoupons);

// Admin routes
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.get('/list', adminAuth, listCoupons);
couponRouter.put('/update/:id', adminAuth, updateCoupon);
couponRouter.delete('/delete/:id', adminAuth, deleteCoupon);
couponRouter.put('/toggle/:id', adminAuth, toggleCouponStatus);

export default couponRouter;
