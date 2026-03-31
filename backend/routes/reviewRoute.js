import express from 'express';
import { submitReview, getProductReviews, getMyReview, deleteReview } from '../controllers/reviewController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const reviewRouter = express.Router();

// Public: get all reviews for a product (paginated)
reviewRouter.get('/:productId', getProductReviews);

// Authenticated: get the current user's review + eligibility for a product
// NOTE: must be declared BEFORE /:productId so "mine" isn't treated as a productId param
reviewRouter.post('/mine/:productId', authUser, getMyReview);

// Authenticated: submit (create or update) a review
reviewRouter.post('/submit', authUser, submitReview);

// Admin: delete any review
reviewRouter.delete('/:reviewId', adminAuth, deleteReview);

export default reviewRouter;
