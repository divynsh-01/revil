import mongoose from 'mongoose';
import reviewModel from '../models/reviewModel.js';
import orderModel from '../models/orderModel.js';
import productModel from '../models/productModel.js';

/**
 * Recomputes avgRating and reviewCount for a product from the reviews collection
 * and atomically writes both to the product document.
 * Called after every create / update / delete of a review.
 */
const recomputeProductRating = async (productId) => {
    const agg = await reviewModel.aggregate([
        { $match: { productId: productId } },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                total: { $sum: '$rating' }
            }
        }
    ]);

    const count = agg[0]?.count ?? 0;
    const avg = count > 0 ? Math.round((agg[0].total / count) * 10) / 10 : 0;

    await productModel.findByIdAndUpdate(productId, {
        avgRating: avg,
        reviewCount: count
    });
};

/**
 * POST /api/review/submit
 * Creates or updates the calling user's review for a product.
 * Gate: user must have at least one "Delivered" order containing this productId.
 */
const submitReview = async (req, res) => {
    try {
        const { userId, productId, rating, title, body } = req.body;

        // --- Input validation ---
        if (!productId) return res.json({ success: false, message: 'productId is required' });
        if (!rating || rating < 1 || rating > 5) return res.json({ success: false, message: 'Rating must be between 1 and 5' });
        if (!body || body.trim().length < 5) return res.json({ success: false, message: 'Review body must be at least 5 characters' });

        // --- Verify product exists ---
        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        // --- Eligibility check: find a Delivered order containing this product ---
        const eligibleOrder = await orderModel.findOne({
            userId,
            orderStatus: 'Delivered',
            'items.productId': productId
        });

        if (!eligibleOrder) {
            return res.json({
                success: false,
                message: 'You can only review products from a delivered order',
                notEligible: true
            });
        }

        // --- Upsert: create or update the review ---
        const existing = await reviewModel.findOne({ productId, userId });

        if (existing) {
            // Update existing review
            existing.rating = Number(rating);
            existing.title = title?.trim() || '';
            existing.body = body.trim();
            existing.updatedAt = Date.now();
            await existing.save();
        } else {
            // Create new review
            const newReview = new reviewModel({
                productId,
                userId,
                verifiedOrderId: eligibleOrder.orderId,
                rating: Number(rating),
                title: title?.trim() || '',
                body: body.trim()
            });
            await newReview.save();
        }

        // --- Recompute product rating atomically ---
        await recomputeProductRating(productId);

        // --- Return the saved review with user info for immediate UI update ---
        const savedReview = await reviewModel
            .findOne({ productId, userId })
            .populate('userId', 'name');

        res.json({ success: true, message: 'Review submitted', review: savedReview });

    } catch (error) {
        // Mongoose duplicate key error (in case of a race condition on the unique index)
        if (error.code === 11000) {
            return res.json({ success: false, message: 'You have already submitted a review for this product' });
        }
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * GET /api/review/:productId
 * Public. Returns paginated reviews for a product, newest first.
 * Query params: page (default 1), limit (default 10)
 */
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            reviewModel
                .find({ productId })
                .populate('userId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            reviewModel.countDocuments({ productId })
        ]);

        // Rating breakdown: count of each star level (5 → 1)
        const breakdown = await reviewModel.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } }
        ]);


        const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        breakdown.forEach(b => { ratingBreakdown[b._id] = b.count; });

        res.json({
            success: true,
            reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            ratingBreakdown
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * GET /api/review/mine/:productId
 * Authenticated. Returns the calling user's own review for a product (if any),
 * AND whether they are eligible to review.
 */
const getMyReview = async (req, res) => {
    try {
        // userId is injected by authUser middleware into req.body
        const { userId } = req.body;
        const { productId } = req.params;

        const [review, eligibleOrder] = await Promise.all([
            reviewModel.findOne({ productId, userId }),
            orderModel.findOne({
                userId,
                orderStatus: 'Delivered',
                'items.productId': productId
            }, 'orderId')
        ]);

        res.json({
            success: true,
            review,             // null if not reviewed yet
            canReview: !!eligibleOrder   // true only if they have a Delivered order
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * DELETE /api/review/:reviewId
 * Admin only. Hard-deletes a review and recomputes the product rating.
 */
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await reviewModel.findById(reviewId);
        if (!review) return res.json({ success: false, message: 'Review not found' });

        const productId = review.productId;
        await reviewModel.findByIdAndDelete(reviewId);

        // Recompute rating after deletion
        await recomputeProductRating(productId);

        res.json({ success: true, message: 'Review deleted' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { submitReview, getProductReviews, getMyReview, deleteReview };
