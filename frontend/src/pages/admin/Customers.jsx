
import { useEffect, useState, useMemo } from 'react';
import { Search, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'subscribed', label: 'Subscribed' },
];

export default function Customers() {
  const { get, del, loading, error } = useApi();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Initial full list
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await get('/apicustomers/allcustomers');
        setCustomers(data.customers || []);
      } catch (err) {
        // error already captured by useApi
      }
    };
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced server-side search — falls back to the full list when cleared
  useEffect(() => {
    const query = search.trim();

    const timer = setTimeout(async () => {
      try {
        if (!query) {
          const data = await get('/apicustomers/allcustomers');
          setCustomers(data.customers || []);
        } else {
          const data = await get(`/apicustomers/searchcustomers?search=${encodeURIComponent(query)}`);
          setCustomers(data.customers || []);
        }
        setPage(1);
      } catch (err) {
        // error already captured by useApi
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply the All / Subscribed filter on top of whatever the search returned
  const filteredCustomers = useMemo(() => {
    if (filter === 'subscribed') {
      return customers.filter((c) => c.isSubscribed);
    }
    return customers;
  }, [customers, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));

  // Keep page state clamped whenever the underlying (filtered) list shrinks or grows,
  // so `page` is always the single source of truth for both slicing and the buttons.
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginatedCustomers = useMemo(
    () => filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredCustomers, page]
  );

  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this customer account? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await del(`/apicustomers/deletecustomer/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      // error already captured by useApi
    } finally {
      setDeletingId(null);
    }
  };

  const SubscribedBadge = () => (
    <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#1A1C1C] text-white shrink-0">
      Subscribed
    </span>
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
              Customers
            </h1>
            <p className="text-sm text-[#5E5E5E] opacity-60">
              Manage registered customer accounts
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
              placeholder="Search customers..."
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
          <p className="py-12 text-center text-sm text-[#5E5E5E]">Loading customers...</p>
        )}

        {!loading && error && (
          <p className="py-12 text-center text-sm text-[#BA1A1A]">{error}</p>
        )}

        {!loading && !error && paginatedCustomers.length === 0 && (
          <p className="py-12 text-center text-sm text-[#5E5E5E]">
            {filter === 'subscribed' ? 'No subscribed customers found.' : 'No customers found.'}
          </p>
        )}

        {!loading && !error && paginatedCustomers.length > 0 && (
          <>
            {/* Mobile card list (below sm breakpoint) */}
            <div className="sm:hidden space-y-4">
              {paginatedCustomers.map((c) => (
                <div
                  key={c._id}
                  className="border-b border-[#EEEEEE] pb-4 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-[#1A1C1C]">
                        {c.firstName} {c.lastName}
                      </p>
                      {c.isSubscribed && <SubscribedBadge />}
                    </div>
                    <p className="text-xs text-[#4C4546] break-all mt-1">{c.email}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deletingId === c._id}
                    className="text-[#5E5E5E] hover:text-[#BA1A1A] transition-colors duration-200 disabled:opacity-40 shrink-0 mt-0.5"
                    aria-label="Delete customer"
                  >
                    <Trash2 size={16} />
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
                      Customer Name
                    </th>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal whitespace-nowrap">
                      Email Address
                    </th>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal whitespace-nowrap">
                      Subscription
                    </th>
                    <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal text-right whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-[#EEEEEE] transition-colors duration-300 hover:bg-[#F9F9F9]"
                    >
                      {/* Name */}
                      <td className="py-5 pr-4">
                        <div className="flex items-center gap-4 text-sm text-[#1A1C1C] whitespace-nowrap">
                          {c.firstName} {c.lastName}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-5 pr-4 text-sm text-[#4C4546] break-all">
                        {c.email}
                      </td>

                      {/* Subscription */}
                      <td className="py-5 pr-4">
                        {c.isSubscribed ? (
                          <SubscribedBadge />
                        ) : (
                          <span className="text-xs text-[#B8B8B8]">—</span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td className="py-5 text-right">
                        <button
                          onClick={() => handleDelete(c._id)}
                          disabled={deletingId === c._id}
                          className="text-[#5E5E5E] hover:text-[#BA1A1A] transition-colors duration-200 disabled:opacity-40"
                          aria-label="Delete customer"
                        >
                          <Trash2 size={16} />
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
            {filteredCustomers.length === 0
              ? 'Showing 0 customers'
              : `Showing ${paginatedCustomers.length} of ${filteredCustomers.length.toLocaleString()} customers`}
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