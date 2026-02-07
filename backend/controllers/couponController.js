import couponModel from "../models/couponModel.js";

// Validate coupon code
const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal, cartItems } = req.body;

        // Find coupon
        const coupon = await couponModel.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid coupon code" });
        }

        // Check if active
        if (!coupon.isActive) {
            return res.json({ success: false, message: "This coupon is no longer active" });
        }

        // Check expiry
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.json({ success: false, message: "This coupon has expired" });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.json({ success: false, message: "This coupon has reached its usage limit" });
        }

        // Check minimum order value
        if (cartTotal < coupon.minOrderValue) {
            return res.json({
                success: false,
                message: `Minimum order value of $${coupon.minOrderValue} required`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (cartTotal * coupon.value) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        } else {
            discount = coupon.value;
        }

        // Ensure discount doesn't exceed cart total
        discount = Math.min(discount, cartTotal);

        res.json({
            success: true,
            message: "Coupon applied successfully",
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discount: discount
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Apply coupon (increment usage count)
const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const coupon = await couponModel.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.json({ success: false, message: "Invalid coupon code" });
        }

        // Increment usage count
        coupon.usedCount += 1;
        await coupon.save();

        res.json({ success: true, message: "Coupon applied" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Create new coupon (Admin)
const createCoupon = async (req, res) => {
    try {
        const {
            code, type, value, minOrderValue, maxDiscount,
            expiryDate, usageLimit, applicableCategories,
            applicableProducts, description
        } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.json({ success: false, message: "Coupon code already exists" });
        }

        const coupon = new couponModel({
            code: code.toUpperCase(),
            type,
            value,
            minOrderValue: minOrderValue || 0,
            maxDiscount: maxDiscount || null,
            expiryDate,
            usageLimit: usageLimit || null,
            applicableCategories: applicableCategories || [],
            applicableProducts: applicableProducts || [],
            description: description || ''
        });

        await coupon.save();

        res.json({ success: true, message: "Coupon created successfully", coupon });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get all coupons (Admin)
const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update coupon (Admin)
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const coupon = await couponModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        res.json({ success: true, message: "Coupon updated successfully", coupon });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete coupon (Admin)
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await couponModel.findByIdAndDelete(id);

        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        res.json({ success: true, message: "Coupon deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Toggle coupon active status (Admin)
const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await couponModel.findById(id);

        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({
            success: true,
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
            coupon
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
    validateCoupon,
    applyCoupon,
    createCoupon,
    listCoupons,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus
};
