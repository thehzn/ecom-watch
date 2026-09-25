import { useEffect, useState, useMemo } from 'react';
import { Search, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'featured', label: 'Featured' },
  { key: 'unfeatured', label: 'Not Featured' },
];

export default function AdminReviewList() {
  const { get, patch, loading, error } = useApi();

  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Initial full list — fetch a high limit so search/filter/pagination
  // below can run client-side, same pattern as the Customers page.
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await get('/apireview/getallreviews?page=1&limit=1000');
        setReviews(data.reviews || []);
      } catch (err) {
        // error already captured by useApi
      }
    };
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced client-side search across customer name, product, and comment
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Apply search + featured filter on top of the fetched list
  const filteredReviews = useMemo(() => {
    let list = reviews;

    if (filter === 'featured') {
      list = list.filter((r) => r.featured);
    } else if (filter === 'unfeatured') {
      list = list.filter((r) => !r.featured);
    }

    if (debouncedSearch) {
      list = list.filter((r) => {
        const name = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
        const product = (r.product?.modelName || '').toLowerCase();
        const comment = (r.comment || '').toLowerCase();
        return (
          name.includes(debouncedSearch) ||
          product.includes(debouncedSearch) ||
          comment.includes(debouncedSearch)
        );
      });
    }

    return list;
  }, [reviews, filter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));

  // Keep page state clamped whenever the underlying (filtered) list shrinks or grows,
  // so `page` is always the single source of truth for both slicing and the buttons.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginatedReviews = useMemo(
    () => filteredReviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredReviews, page]
  );

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  const handleToggleFeatured = async (id) => {
    const currentReview = reviews.find((r) => r._id === id);
    const willFeature = !currentReview?.featured;

    setTogglingId(id);
    try {
      await patch(`/apireview/togglefeatured/${id}`);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, featured: !r.featured } : r))
      );
      toast.success(
        willFeature ? 'Review featured on storefront' : 'Review unfeatured'
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update review status');
    } finally {
      setTogglingId(null);
    }
  };

  const FeaturedBadge = () => (
    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#1A1C1C] text-white shrink-0">
      Featured
    </span>
  );

  const RatingStars = ({ value }) => (
    <div className="flex items-center gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          className={star <= value ? 'fill-[#1A1C1C] text-[#1A1C1C]' : 'text-[#D9D9D9]'}
        />
      ))}
    </div>
  );

  return (
    <main
      className="min-h-screen max-w-[1440px] mx-auto px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24 lg:px-10 lg:pt-16 lg:pb-32 bg-white text-[#1A1C1C]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8">
          <div>
            <h1
              className="text-[32px] leading-10 sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] font-normal text-black mb-2"
              style={{ fontFamily: "'Libre Caslon Text', serif" }}
            >
              Reviews
            </h1>
            <p className="text-sm text-[#5E5E5E] opacity-60">
              Manage customer reviews and control which appear as featured
            </p>
          </div>

          {/* Search */}
          <div
            className={`flex items-center gap-2 w-full sm:w-64 border-b pb-2 transition-colors duration-200 ${
              searchFocused ? 'border-black' : 'border-[#CFC4C5]'
            }`}
          >
            <Search size={16} className="text-[#5E5E5E] flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search reviews..."
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-[#5E5E5E]"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-10 sm:mb-12 lg:mb-16">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`text-[11px] uppercase tracking-wide px-4 py-2 rounded-full border transition-colors duration-200 ${
                filter === key
                  ? 'bg-[#1A1C1C] text-white border-[#1A1C1C]'
                  : 'bg-white text-[#5E5E5E] border-[#CFC4C5] hover:border-[#1A1C1C] hover:text-[#1A1C1C]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading / error / empty states shared by both layouts */}
        {loading && (
          <p className="py-12 text-center text-sm text-[#5E5E5E]">Loading reviews...</p>
        )}

        {!loading && error && (
          <p className="py-12 text-center text-sm text-[#BA1A1A]">{error}</p>
        )}

        {!loading && !error && paginatedReviews.length === 0 && (
          <p className="py-12 text-center text-sm text-[#5E5E5E]">
            {filter === 'featured'
              ? 'No featured reviews found.'
              : filter === 'unfeatured'
              ? 'No non-featured reviews found.'
              : 'No reviews found.'}
          </p>
        )}

        {!loading && !error && paginatedReviews.length > 0 && (
          <>
            {/* Mobile card list (below sm breakpoint) */}
            <div className="sm:hidden space-y-4">
              {paginatedReviews.map((r) => (
                <div
                  key={r._id}
                  className="border-b border-[#EEEEEE] pb-4 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm text-[#1A1C1C]">
                        {r.user?.firstName} {r.user?.lastName}
                      </p>
                      {r.featured && <FeaturedBadge />}
                    </div>
                    <RatingStars value={r.rating} />
                    {r.title && <p className="text-sm text-[#1A1C1C] mt-1">{r.title}</p>}
                    <p className="text-xs text-[#4C4546] mt-1 line-clamp-2">{r.comment}</p>
                    <p className="text-xs text-[#B8B8B8] mt-1">{r.product?.modelName}</p>
                  </div>

                  <button
                    onClick={() => handleToggleFeatured(r._id)}
                    disabled={togglingId === r._id}
                    className="text-[11px] uppercase tracking-wide text-[#5E5E5E] hover:text-black transition-colors duration-200 disabled:opacity-40 shrink-0 mt-0.5 whitespace-nowrap"
                  >
                    {togglingId === r._id ? '...' : r.featured ? 'Unfeature' : 'Feature'}
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop/tablet table (sm and up) */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal whitespace-nowrap">
                      Customer
                    </th>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal whitespace-nowrap">
                      Rating
                    </th>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal">
                      Review
                    </th>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal whitespace-nowrap">
                      Product
                    </th>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal whitespace-nowrap">
                      Status
                    </th>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal text-right whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReviews.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b border-[#EEEEEE] transition-colors duration-300 hover:bg-[#F9F9F9]"
                    >
                      {/* Customer */}
                      <td className="py-5 pr-4">
                        <div className="text-sm text-[#1A1C1C] whitespace-nowrap">
                          {r.user?.firstName} {r.user?.lastName}
                        </div>
                        <div className="text-xs text-[#B8B8B8] break-all">{r.user?.email}</div>
                      </td>

                      {/* Rating */}
                      <td className="py-5 pr-4">
                        <RatingStars value={r.rating} />
                      </td>

                      {/* Review */}
                      <td className="py-5 pr-4 max-w-[320px]">
                        {r.title && (
                          <p className="text-sm text-[#1A1C1C] mb-0.5">{r.title}</p>
                        )}
                        <p className="text-xs text-[#4C4546] line-clamp-2">{r.comment}</p>
                      </td>

                      {/* Product */}
                      <td className="py-5 pr-4 text-sm text-[#4C4546] whitespace-nowrap">
                        {r.product?.modelName || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-5 pr-4">
                        {r.featured ? (
                          <FeaturedBadge />
                        ) : (
                          <span className="text-xs text-[#B8B8B8]">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-5 text-right">
                        <button
                          onClick={() => handleToggleFeatured(r._id)}
                          disabled={togglingId === r._id}
                          className="text-[11px] uppercase tracking-wide text-[#5E5E5E] hover:text-black transition-colors duration-200 disabled:opacity-40 whitespace-nowrap"
                        >
                          {togglingId === r._id
                            ? 'Updating...'
                            : r.featured
                            ? 'Unfeature'
                            : 'Feature'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-10 sm:mt-12">
          <span className="text-xs text-[#838484]">
            {filteredReviews.length === 0
              ? 'Showing 0 reviews'
              : `Showing ${paginatedReviews.length} of ${filteredReviews.length.toLocaleString()} reviews`}
          </span>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="group flex items-center gap-1 text-[11px] uppercase text-[#5E5E5E] hover:text-black transition-colors duration-200 disabled:opacity-40"
            >
              <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
              Previous
            </button>

            <div className="w-px h-4 bg-[#CFC4C5]" />

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="group flex items-center gap-1 text-[11px] uppercase text-[#5E5E5E] hover:text-black transition-colors duration-200 disabled:opacity-40"
            >
              Next
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}