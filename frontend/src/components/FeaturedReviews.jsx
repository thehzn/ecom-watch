import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import StarRating from './StarRating';

export default function FeaturedReviews() {
  const { get } = useApi();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await get('/apireview/getfeaturedreviews?limit=6');
        setReviews(data.reviews || []);
      } catch (err) {
        // Fail silently — this is a supplementary section, not critical to the page
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [get]);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="w-full py-16 px-6 border-t border-white/10">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 flex flex-col gap-3"
            >
              <StarRating value={r.rating} mode="display" size={14} />
              {r.title && <p className="text-sm font-bold text-white">{r.title}</p>}
              <p className="text-sm text-gray-300 line-clamp-4">{r.comment}</p>
              <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {r.user?.firstName} {r.user?.lastName}
                </span>
                {r.product?.modelName && (
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">
                    {r.product.modelName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}