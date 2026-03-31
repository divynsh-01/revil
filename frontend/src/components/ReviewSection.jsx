import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

/* ─── helpers ──────────────────────────────────────────── */
const StarIcon = ({ filled, half, size = 16, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled || half ? 'none' : 'none'}
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{ cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }}
  >
    <defs>
      {half && (
        <linearGradient id={`half-${size}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#111827" />
          <stop offset="50%" stopColor="#D1D5DB" />
        </linearGradient>
      )}
    </defs>
    <polygon
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      fill={half ? `url(#half-${size})` : filled ? '#111827' : '#D1D5DB'}
      stroke={filled || half ? '#111827' : '#D1D5DB'}
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const StarDisplay = ({ rating, size = 16 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<StarIcon key={i} filled size={size} />);
    } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
      stars.push(<StarIcon key={i} half size={size} />);
    } else {
      stars.push(<StarIcon key={i} size={size} />);
    }
  }
  return <div style={{ display: 'flex', gap: 2 }}>{stars}</div>;
};

const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <StarIcon
          key={star}
          filled={star <= (hover || value)}
          size={28}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        />
      ))}
    </div>
  );
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/* ─── main component ────────────────────────────────────── */
const ReviewSection = ({ productId, avgRating, reviewCount: initialReviewCount, onRatingLoaded }) => {
  const { backendUrl, token } = useContext(ShopContext);

  // Reviews list state
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(initialReviewCount || 0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [ratingBreakdown, setRatingBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [listLoading, setListLoading] = useState(true);

  // Live avg (updates after a review is submitted without page refresh)
  const [liveAvg, setLiveAvg] = useState(avgRating || 0);
  const [liveCount, setLiveCount] = useState(initialReviewCount || 0);

  // Eligibility + user's existing review
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const formRef = useRef(null);

  /* ── fetch reviews list ── */
  const fetchReviews = async (p = 1) => {
    setListLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/review/${productId}?page=${p}&limit=5`);
      if (res.data.success) {
        setReviews(res.data.reviews);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setPage(p);
        setRatingBreakdown(res.data.ratingBreakdown);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setListLoading(false);
    }
  };

  /* ── fetch eligibility + my review ── */
  const fetchMyStatus = async () => {
    if (!token) return;
    setEligibilityLoading(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/review/mine/${productId}`,
        {},
        { headers: { token } }
      );
      if (res.data.success) {
        setCanReview(res.data.canReview);
        setMyReview(res.data.review);
        if (res.data.review) {
          setFormRating(res.data.review.rating);
          setFormTitle(res.data.review.title || '');
          setFormBody(res.data.review.body);
        }
      }
    } catch (err) {
      console.error('Failed to fetch review status', err);
    } finally {
      setEligibilityLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews(1);
      fetchMyStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, token]);

  /* ── sync live avg from product prop changes (initial load) ── */
  useEffect(() => {
    setLiveAvg(avgRating || 0);
    setLiveCount(initialReviewCount || 0);
  }, [avgRating, initialReviewCount]);

  /* ── keep liveAvg/liveCount in sync with ratingBreakdown after every review fetch ── */
  useEffect(() => {
    const totalReviews = Object.values(ratingBreakdown).reduce((s, c) => s + c, 0);
    if (totalReviews === 0) {
      setLiveAvg(0);
      setLiveCount(0);
      onRatingLoaded?.(0, 0);
      return;
    }
    const weightedSum = Object.entries(ratingBreakdown).reduce(
      (s, [star, count]) => s + Number(star) * count, 0
    );
    const avg = Math.round((weightedSum / totalReviews) * 10) / 10;
    setLiveAvg(avg);
    setLiveCount(totalReviews);
    // Notify parent so the header stars stay in sync
    onRatingLoaded?.(avg, totalReviews);
  }, [ratingBreakdown]);

  /* ── submit review ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formRating) return setFormError('Please select a star rating');
    if (!formBody.trim() || formBody.trim().length < 5) return setFormError('Review must be at least 5 characters');

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/review/submit`,
        { productId, rating: formRating, title: formTitle, body: formBody },
        { headers: { token } }
      );
      if (res.data.success) {
        setFormSuccess(myReview ? 'Your review has been updated!' : 'Thank you for your review!');
        setMyReview(res.data.review);
        // Refresh the list (back to page 1 so the new/edited review is visible)
        // fetchReviews also updates ratingBreakdown, total, etc.
        await fetchReviews(1);
        // Recompute live avg locally from the fresh review list state
        // (the effect inside fetchReviews already sets total & ratingBreakdown,
        //  but we need the updated avg — derive it from the breakdown counts)
        setShowForm(false);

      } else {
        setFormError(res.data.message || 'Failed to submit review');
      }
    } catch (err) {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = () => {
    setFormError('');
    setFormSuccess('');
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  /* ── rating bar widths ── */
  const barWidth = (count) => total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';

  /* ─────── RENDER ─────── */
  return (
    <div className="mt-2">

      {/* ── Summary Row ── */}
      <div className="flex flex-col sm:flex-row gap-8 py-6 border-b">

        {/* Left: Overall score */}
        <div className="flex flex-col items-center justify-center min-w-[120px]">
          <span className="text-5xl font-light text-gray-900">
            {liveAvg > 0 ? liveAvg.toFixed(1) : '—'}
          </span>
          <StarDisplay rating={liveAvg} size={18} />
          <span className="text-xs text-gray-400 mt-1">{liveCount} {liveCount === 1 ? 'review' : 'reviews'}</span>
        </div>

        {/* Right: Breakdown bars */}
        <div className="flex-1 flex flex-col gap-1.5 justify-center">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right text-gray-600 shrink-0">{star}</span>
              <StarIcon filled size={12} />
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gray-800 h-2 rounded-full transition-all duration-500"
                  style={{ width: barWidth(ratingBreakdown[star] || 0) }}
                />
              </div>
              <span className="w-6 text-gray-400 text-xs shrink-0">{ratingBreakdown[star] || 0}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center justify-center gap-2 min-w-[160px]">
          {!token ? (
            <p className="text-sm text-gray-500 text-center">
              <a href="/login" className="underline font-medium">Log in</a> to write a review
            </p>
          ) : eligibilityLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          ) : canReview ? (
            <button
              onClick={openForm}
              className="bg-black text-white text-sm px-6 py-2.5 hover:bg-gray-800 transition-colors tracking-wide"
            >
              {myReview ? 'Edit Your Review' : 'Write a Review'}
            </button>
          ) : (
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Only verified purchasers with a <span className="font-medium text-gray-600">Delivered</span> order can review this product.
            </p>
          )}
        </div>
      </div>

      {/* ── Review Form ── */}
      {showForm && (
        <div ref={formRef} className="border border-gray-200 p-6 mt-4 bg-gray-50">
          <h3 className="text-sm font-semibold tracking-wider uppercase mb-4">
            {myReview ? 'Update Your Review' : 'Write a Review'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Your Rating *</label>
              <StarPicker value={formRating} onChange={setFormRating} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Title (optional)</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={100}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Review *</label>
              <textarea
                value={formBody}
                onChange={e => setFormBody(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                maxLength={1000}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{formBody.length}/1000</p>
            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            {formSuccess && <p className="text-green-600 text-sm">{formSuccess}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="bg-black text-white text-sm px-8 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); }}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-4"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Individual reviews ── */}
      <div className="mt-4">
        {listLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No reviews yet. Be the first to review!</p>
        ) : (
          <>
            <div className="divide-y">
              {reviews.map(review => (
                <div key={review._id} className="py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StarDisplay rating={review.rating} size={14} />
                        {review.title && (
                          <span className="font-semibold text-sm text-gray-800">{review.title}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mt-1">{review.body}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-gray-700">
                        {review.userId?.name?.split(' ')[0] || 'Verified Buyer'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(review.createdAt)}</p>
                      <span className="inline-block mt-1 text-xs text-green-600 font-medium">✓ Verified Purchase</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 border-t">
                <button
                  onClick={() => fetchReviews(page - 1)}
                  disabled={page <= 1}
                  className="text-sm px-3 py-1 border border-gray-300 disabled:opacity-30 hover:border-gray-500 transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => fetchReviews(page + 1)}
                  disabled={page >= totalPages}
                  className="text-sm px-3 py-1 border border-gray-300 disabled:opacity-30 hover:border-gray-500 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
