import express from 'express';
import {
    validateCoupon,
    applyCoupon,
    createCoupon,
    listCoupons,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus
} from '../controllers/couponController.js';
import adminAuth from '../middleware/adminAuth.js';

const couponRouter = express.Router();

// User routes
couponRouter.post('/validate', validateCoupon);
couponRouter.post('/apply', applyCoupon);

// Admin routes
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.get('/list', adminAuth, listCoupons);
couponRouter.put('/update/:id', adminAuth, updateCoupon);
couponRouter.delete('/delete/:id', adminAuth, deleteCoupon);
couponRouter.put('/toggle/:id', adminAuth, toggleCouponStatus);

export default couponRouter;
