import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const PAGE_SIZE = 5;

const STATUS_STYLES = {
  Pending: { bg: '#FAEEDA', color: '#854F0B' },
  Shipped: { bg: '#DDEAF6', color: '#1D4E76' },
  Delivered: { bg: '#EAF3DE', color: '#3B6D11' },
  Cancelled: { bg: '#F3F3F4', color: '#5E5E5E' },
};

function StatusBadge({ status }) {
  const { bg, color } = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: bg, color }}
    >
      {status}
    </span>
  );
}

function customerName(order) {
  if (order.user?.firstName) {
    return `${order.user.firstName} ${order.user.lastName || ''}`.trim();
  }
  return `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim();
}

function addressLine(order) {
  const a = order.shippingAddress;
  if (!a) return '';
  return `${a.address}, ${a.city}, ${a.state} ${a.pincode}`;
}

export default function OrderDetails() {
  const navigate = useNavigate();
  const { get, loading, error } = useApi();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Fetch once — pagination and search both happen client-side below
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await get('/apiorders/getallorders');
        setOrders(data.orders || []);
      } catch (err) {
        // error already captured by useApi
      }
    };
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((o) => {
      const productName = o.items?.[0]?.product?.modelName;
      const sku = o.items?.[0]?.product?.sku;
      const name = o.user?.firstName
        ? `${o.user.firstName} ${o.user.lastName || ''}`
        : `${o.shippingAddress?.firstName || ''} ${o.shippingAddress?.lastName || ''}`;
      const address = `${o.shippingAddress?.address || ''} ${o.shippingAddress?.city || ''} ${o.shippingAddress?.state || ''} ${o.shippingAddress?.pincode || ''}`;
      return [productName, sku, name, address, o.orderStatus]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query));
    });
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <main
      className="min-h-screen max-w-[1440px] mx-auto px-10 py-16 bg-[#F9F9F9] text-[#1A1C1C]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      <div className="w-full max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5E5E5E]">
            Order Management
          </span>
          <h1
            className="text-[48px] leading-[56px] font-normal text-black"
            style={{ fontFamily: "'Libre Caslon Text', serif" }}
          >
            Order Details
          </h1>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between gap-6 border-b border-[#CFC4C5] pb-8 mb-8">
          <div className="relative w-full sm:w-[384px]">
            <Search
              size={20}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-[#5E5E5E]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search orders..."
              className="w-full pl-8 pr-4 py-2 border-0 border-b border-[#7E7576] bg-transparent uppercase text-[11px] placeholder:text-[#5E5E5E] focus:outline-none"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            />
          </div>
        </div>

        {/* Order Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#7E7576]">
                <th className="text-left py-6 pr-4 text-[11px] uppercase tracking-[0.15em] text-[#5E5E5E] font-normal">
                  Product
                </th>
                <th className="text-center py-6 px-4 text-[11px] uppercase tracking-[0.15em] text-[#5E5E5E] font-normal">
                  Qty
                </th>
                <th className="text-left py-6 px-4 text-[11px] uppercase tracking-[0.15em] text-[#5E5E5E] font-normal">
                  Customer
                </th>
                <th className="text-left py-6 px-4 text-[11px] uppercase tracking-[0.15em] text-[#5E5E5E] font-normal">
                  Shipping Address
                </th>
                <th className="text-left py-6 px-4 text-[11px] uppercase tracking-[0.15em] text-[#5E5E5E] font-normal">
                  Order Date
                </th>
                <th className="text-left py-6 px-4 text-[11px] uppercase tracking-[0.15em] text-[#5E5E5E] font-normal">
                  Status
                </th>
                <th className="text-right py-6 pl-4 text-[11px] uppercase tracking-[0.15em] text-[#5E5E5E] font-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#5E5E5E]">
                    Loading orders...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#A32D2D]">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#5E5E5E]">
                    No orders found.
                  </td>
                </tr>
              )}

              {!loading && !error && paginatedOrders.map((o) => {
                const firstItem = o.items?.[0];
                const extraItemsCount = (o.items?.length || 0) - 1;
                const totalQty = (o.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0);

                return (
                  <tr
                    key={o._id}
                    className="border-b border-[#CFC4C5] last:border-b-0 transition-colors duration-300 hover:bg-[#F3F3F4]"
                  >
                    {/* Product */}
                    <td className="py-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 overflow-hidden flex-shrink-0 bg-[#EEEEEE]">
                          <img
                            src={firstItem?.product?.mainImage}
                            alt={firstItem?.product?.modelName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p
                            className="text-lg text-black"
                            style={{ fontFamily: "'Libre Caslon Text', serif" }}
                          >
                            {firstItem?.product?.modelName || 'Unknown product'}
                          </p>
                          <p className="text-[10px] uppercase text-[#5E5E5E] mt-1">
                            {firstItem?.product?.sku}
                            {extraItemsCount > 0 && ` · +${extraItemsCount} more`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="py-6 px-4 text-center text-sm text-black">
                      {totalQty}
                    </td>

                    {/* Customer */}
                    <td className="py-6 px-4">
                      <p className="text-sm text-[#1A1C1C]">{customerName(o)}</p>
                      <p className="text-[10px] uppercase text-[#5E5E5E] mt-1">
                        {o.user?.email}
                      </p>
                    </td>

                    {/* Shipping Address */}
                    <td className="py-6 px-4 text-sm leading-relaxed text-[#5E5E5E]">
                      {addressLine(o)}
                    </td>

                    {/* Order Date */}
                    <td className="py-6 px-4 text-sm text-black">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                    </td>

                    {/* Status */}
                    <td className="py-6 px-4">
                      <StatusBadge status={o.orderStatus} />
                    </td>

                    {/* Actions */}
                    <td className="py-6 pl-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${o._id}`)}
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-[#5E5E5E] hover:text-black transition-colors duration-200"
                        aria-label="View order"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-12">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#5E5E5E]">
            {filteredOrders.length === 0
              ? 'Showing 0 orders'
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
                  currentPage * PAGE_SIZE,
                  filteredOrders.length
                )} of ${filteredOrders.length} orders`}
          </p>

          <div className="flex items-center gap-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 text-[11px] uppercase text-[#CFC4C5] hover:text-[#1A1C1C] transition-colors duration-200 disabled:opacity-40 disabled:hover:text-[#CFC4C5]"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-4">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`text-sm transition-colors duration-200 ${
                      isActive ? 'text-black font-medium' : 'text-[#5E5E5E] hover:text-black'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 text-[11px] uppercase text-[#1A1C1C] hover:opacity-70 transition-opacity duration-200 disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}