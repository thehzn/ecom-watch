import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

const PAGE_SIZE = 3;

// Matches the real orderStatus enum: Pending / Shipped / Cancelled / Delivered.
const STATUS_STYLES = {
  Delivered: "bg-[#F3F4F6] text-[#5D5E63]",
  Shipped: "bg-black text-white",
  Pending: "bg-[#FFF4E5] text-[#8A5A00]",
  Cancelled: "bg-[#FDEDED] text-[#B42318]",
};

export default function MyOrders() {
  const navigate = useNavigate();
  const { get, del } = useApi();

  const [allOrders, setAllOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const totalOrders = allOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
  const orders = allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      // Real route (note the typo, this is intentional and matches the
      // backend): /apiorders/myordes. No page/limit support server-side —
      // it returns every order for the user at once, so pagination here
      // is handled client-side, same approach as Categories.jsx.
      const res = await get("/apiorders/myordes");
      setAllOrders(res?.orders || []);
    } catch {
      setError("Could not load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 1 if the current page becomes empty (e.g. after a refetch
  // with fewer orders than before).
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    setError("");
    try {
      // Real endpoint: DELETE /apiorders/cancelMyOrder/:id (customer-facing,
      // added by Najisha). NOTE: her controller currently reads/writes
      // order.status, but the schema's real field is orderStatus — the
      // cancel may report success without actually persisting. Refetching
      // from the server below (rather than trusting an optimistic update)
      // means the UI always reflects DB truth, bug or not — worth testing
      // by cancelling an order and checking it stays Cancelled after a
      // page refresh.
      await del(`/apiorders/cancelMyOrder/${orderId}`);
      await fetchOrders();
    } catch {
      setError("Could not cancel that order. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const rangeStart = totalOrders === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalOrders);

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-10 bg-white font-['Inter'] text-black">
      <div className="flex flex-col">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#5D5E63] mb-6">
          <button onClick={() => navigate("/myaccount")} className="hover:text-black transition-colors">
            My Account
          </button>
          <span className="mx-2">/</span>
          <span className="text-black">My Orders</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="font-['Libre_Caslon_Text'] text-[48px] font-normal text-black">
            My Orders
          </h1>
          <p className="font-['Inter'] text-base text-[#5D5E63] max-w-[672px] leading-[28px] mt-3">
            Track, manage, and review every order you've placed with Chronos —
            from dispatch through to delivery.
          </p>
        </div>

        {/* Order History */}
        <section>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse border-b border-[#E2E2E2]">
              <thead>
                <tr className="border-b border-[#E2E2E2]">
                  {["Order", "Quantity", "Date", "Status", "Total", "Action"].map(
                    (col) => (
                    <th
                      key={col}
                      className="text-left py-4 text-[11px] uppercase tracking-[0.15em] font-semibold text-[#5D5E63] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-sm text-[#5D5E63]">
                      Loading your orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-sm text-[#5D5E63]">
                      You haven't placed any orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const items = order.items || [];
                    const firstItem = items[0];
                    const extraItemCount = items.length - 1;
                    const totalUnits = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
                    const reference = order._id ? `#${order._id.slice(-8).toUpperCase()}` : "—";
                    const placedOn = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                    return (
                      <tr
                        key={order._id}
                        className="border-b border-[#E2E2E2] hover:bg-[#F9F9F9] transition-colors duration-300"
                      >
                        <td className="py-8 pr-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={firstItem?.product?.mainImage}
                              alt={firstItem?.product?.modelName}
                              className="w-20 h-20 object-cover bg-[#E2E2E2]"
                            />
                            <div>
                              <p className="text-sm font-bold">{reference}</p>
                              <p className="text-xs text-[#5D5E63] mt-1">
                                {firstItem?.product?.modelName}
                                {extraItemCount > 0 && ` +${extraItemCount} more item${extraItemCount > 1 ? "s" : ""}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-8 pr-4 text-sm text-[#5D5E63] whitespace-nowrap">
                          {totalUnits} {totalUnits === 1 ? "Unit" : "Units"}
                        </td>
                        <td className="py-8 pr-4 text-sm text-[#5D5E63] whitespace-nowrap">
                          {placedOn}
                        </td>
                        <td className="py-8 pr-4">
                          <span
                            className={`inline-block px-3 py-1 text-[10px] uppercase font-bold tracking-[0.15em] ${
                              STATUS_STYLES[order.orderStatus] || "bg-[#F3F4F6] text-[#5D5E63]"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-8 text-sm font-bold text-black tracking-tight whitespace-nowrap">
                          ${Number(order.total).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-8">
                          {order.orderStatus === "Pending" ? (
                            <button
                              onClick={() => handleCancel(order._id)}
                              disabled={cancellingId === order._id}
                              className="border border-black bg-transparent px-6 py-2 text-[10px] uppercase font-bold tracking-[0.15em] hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalOrders > 0 && (
            <div className="flex justify-between items-center mt-12">
              <p className="text-[11px] text-[#5D5E63]">
                Showing {rangeStart}–{rangeEnd} of {totalOrders} orders
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-[#5D5E63] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2"
                  aria-label="Previous page"
                >
                  ←
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 text-sm transition-colors ${
                      n === page ? "bg-black text-white" : "text-[#5D5E63] hover:text-black"
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-[#5D5E63] hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2"
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
