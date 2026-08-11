import { useEffect, useState, useMemo } from 'react';
import { Search, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export default function Customers() {
  const { get, del, loading, error } = useApi();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
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

  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedCustomers = useMemo(
    () => customers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [customers, currentPage]
  );

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

  return (
    <main
      className="min-h-screen max-w-[1440px] mx-auto px-10 pt-16 pb-32 bg-white text-[#1A1C1C]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-16">
          <div>
            <h1
              className="text-[48px] leading-[56px] font-normal text-black mb-2"
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
            className={`flex items-center gap-2 w-64 border-b pb-2 transition-colors duration-200 ${
              searchFocused ? 'border-black' : 'border-[#CFC4C5]'
            }`}
          >
            <Search size={16} className="text-[#5E5E5E]" />
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

        {/* Customer Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal">
                  Customer Name
                </th>
                <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal">
                  Email Address
                </th>
                <th className="text-[11px] uppercase tracking-wide text-[#5E5E5E] border-b border-[#CFC4C5] pb-4 font-normal text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-sm text-[#5E5E5E]">
                    Loading customers...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-sm text-[#BA1A1A]">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-sm text-[#5E5E5E]">
                    No customers found.
                  </td>
                </tr>
              )}

              {!loading && !error && paginatedCustomers.map((c) => (
                <tr
                  key={c._id}
                  className="border-b border-[#EEEEEE] transition-colors duration-300 hover:bg-[#F9F9F9]"
                >
                  {/* Name */}
                  <td className="py-5">
                    <div className="flex items-center gap-4 text-sm text-[#1A1C1C]">
                      {c.firstName} {c.lastName}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-5 text-sm text-[#4C4546]">
                    {c.email}
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

        {/* Pagination Footer */}
        <div className="flex justify-between items-center mt-12">
          <span className="text-xs text-[#838484]">
            {customers.length === 0
              ? 'Showing 0 customers'
              : `Showing ${paginatedCustomers.length} of ${customers.length.toLocaleString()} customers`}
          </span>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="group flex items-center gap-1 text-[11px] uppercase text-[#5E5E5E] hover:text-black transition-colors duration-200 disabled:opacity-40"
            >
              <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
              Previous
            </button>

            <div className="w-px h-4 bg-[#CFC4C5]" />

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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