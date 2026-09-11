import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useApi } from '../hooks/useApi';
import StarRating from './StarRating';

const LIMIT = 5;

export default function ProductReviews({ productId }) {
  const { get, post } = useApi();
  const token = useSelector((state) => state.auth.token);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = useCallback(
    async (pageNum) => {
      setLoading(true);
      setFetchError('');
      try {
        const data = await get(
          `/apireview/getproductreviews/${productId}?page=${pageNum}&limit=${LIMIT}`
        );
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setNumReviews(data.numReviews || 0);
        setTotalPages(data.totalPages || 1);
        setPage(pageNum);
      } catch (err) {
        setFetchError('Unable to load reviews right now.');
      } finally {
        setLoading(false);
      }
    },
    [get, productId]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!token) {
      setSubmitError('Please sign in to leave a review.');
      return;
    }
    if (rating < 1) {
      setSubmitError('Please select a star rating.');
      return;
    }
    if (!comment.trim()) {
      setSubmitError('Please write a comment.');
      return;
    }

    setSubmitting(true);
    try {
      await post(`/apireview/addreview/${productId}`, { rating, title, comment });
      setSubmitted(true);
      setRating(0);
      setTitle('');
      setComment('');
      fetchReviews(1); // refresh list + average from the top
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setSubmitError(err?.message || 'Something went wrong submitting your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full flex flex-col gap-10">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>
        {numReviews > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={averageRating} mode="display" />
            <span className="text-sm text-gray-400">
              {averageRating.toFixed(1)} ({numReviews} review{numReviews !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* Review submission form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
      >
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Write a Review</h3>

        {!token && (
          <p className="text-xs text-gray-400">
            You'll need to sign in before submitting a review.
          </p>
        )}

        <div>
          <label className="block text-xs text-gray-400 mb-2">Your Rating</label>
          <StarRating value={rating} onChange={setRating} mode="input" size={22} />
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          maxLength={100}
          className="bg-[#141720] border border-white/15 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-white transition-colors"
        />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts on this timepiece..."
          rows={4}
          maxLength={1000}
          className="bg-[#141720] border border-white/15 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-white transition-colors resize-none"
        />

        {submitError && <p className="text-xs text-red-400">{submitError}</p>}
        {submitted && (
          <p className="text-xs text-green-400">Thank you — your review has been posted.</p>
        )}

        <button
          type="submit"
          disabled={submitting || !token}
          className="self-start bg-white text-black text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Review list */}
      {loading && <p className="text-sm text-gray-400">Loading reviews…</p>}
      {!loading && fetchError && <p className="text-sm text-red-400">{fetchError}</p>}
      {!loading && !fetchError && reviews.length === 0 && (
        <p className="text-sm text-gray-400">No reviews yet — be the first to share your thoughts.</p>
      )}

      {!loading && !fetchError && reviews.length > 0 && (
        <div className="flex flex-col gap-6">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-white/10 pb-6 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <StarRating value={r.rating} mode="display" size={14} />
                  <span className="text-sm font-semibold text-white">
                    {r.user?.firstName} {r.user?.lastName}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {r.title && <p className="text-sm font-bold text-white mb-1">{r.title}</p>}
              <p className="text-sm text-gray-300">{r.comment}</p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => fetchReviews(page - 1)}
                disabled={page === 1}
                className="text-xs uppercase tracking-wider text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => fetchReviews(page + 1)}
                disabled={page === totalPages}
                className="text-xs uppercase tracking-wider text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}