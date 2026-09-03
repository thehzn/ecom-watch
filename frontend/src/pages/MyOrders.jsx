// import { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { 
//   ShoppingBag, 
//   ChevronLeft, 
//   ChevronRight, 
//   Package, 
//   ShieldCheck, 
//   ArrowRight, 
//   ArrowLeft,
//   Calendar,
//   CreditCard
// } from "lucide-react";
// import { useApi } from "../hooks/useApi";

// const PAGE_SIZE = 4;

// const STATUS_STYLES = {
//   Delivered: "bg-white text-black font-bold border border-white",
//   Shipped: "bg-white text-black font-bold",
//   Pending: "bg-amber-400/10 text-amber-300 border border-amber-400/20",
//   Cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
// };

// export default function MyOrders() {
//   const navigate = useNavigate();
//   const { get, del } = useApi();

//   const [allOrders, setAllOrders] = useState([]);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [cancellingId, setCancellingId] = useState(null);

//   const totalOrders = allOrders.length;
//   const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
//   const orders = allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const fetchOrders = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await get("/apiorders/myordes");
//       setAllOrders(res?.orders || []);
//     } catch (err) {
//       console.error("Fetch orders error:", err);
//       setError("Could not load your orders right now.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   useEffect(() => {
//     if (page > totalPages) setPage(1);
//   }, [page, totalPages]);

//   const handleCancel = async (orderId) => {
//     if (!window.confirm("Are you sure you wish to cancel this order?")) return;
//     setCancellingId(orderId);
//     setError("");
//     try {
//       await del(`/apiorders/cancelMyOrder/${orderId}`);
//       await fetchOrders();
//     } catch (err) {
//       console.error("Cancel order error:", err);
//       setError(err?.message || "Could not cancel this order. Please try again.");
//     } finally {
//       setCancellingId(null);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black">
      
//       {/* Header Banner */}
//       <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-14 sm:py-16 text-center relative overflow-hidden">
//         <div className="max-w-3xl mx-auto flex flex-col items-center">
//           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-3">
//             <Package size={12} />
//             Client Portfolio
//           </div>
//           <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
//             My Orders
//           </h1>
//           <p className="text-sm text-gray-400 mt-2">
//             Track your bespoke orders, certified deliveries, and acquisition records.
//           </p>
//         </div>
//       </section>

//       <main className="max-w-[1200px] mx-auto px-6 sm:px-12 py-12">
        
//         {/* Navigation Breadcrumb */}
//         <div className="flex items-center justify-between mb-8">
//           <Link
//             to="/myaccount"
//             className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
//           >
//             <ArrowLeft size={14} />
//             <span>Return to Client Dossier</span>
//           </Link>
//           <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
//             Total Orders: {totalOrders}
//           </span>
//         </div>

//         {loading && (
//           <div className="py-24 text-center">
//             <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//             <p className="text-sm text-gray-400">Retrieving order ledger…</p>
//           </div>
//         )}

//         {!loading && error && (
//           <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-center text-xs text-red-400 mb-6 font-medium">
//             {error}
//           </div>
//         )}

//         {!loading && !error && orders.length === 0 && (
//           <div className="bg-[#0E1015] border border-white/10 rounded-3xl p-16 text-center max-w-lg mx-auto">
//             <ShoppingBag size={40} className="text-gray-500 mx-auto mb-4" />
//             <h3 className="text-xl font-bold text-white">No Orders Placed</h3>
//             <p className="text-sm text-gray-400 mt-2 mb-6">
//               You have not placed any timepiece orders yet. Explore our handcrafted collections.
//             </p>
//             <Link
//               to="/shop"
//               className="inline-flex items-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-gray-200 transition-all"
//             >
//               <span>Explore Timepieces</span>
//               <ArrowRight size={14} />
//             </Link>
//           </div>
//         )}

//         {!loading && orders.length > 0 && (
//           <div className="flex flex-col gap-6">
//             {orders.map((order) => {
//               const status = order.orderStatus || "Pending";
//               const statusClass = STATUS_STYLES[status] || STATUS_STYLES.Pending;
//               const items = order.items || [];
//               const dateStr = order.createdAt 
//                 ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) 
//                 : 'Recent';

//               return (
//                 <div
//                   key={order._id}
//                   className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 hover:border-white/25 transition-all shadow-xl"
//                 >
//                   {/* Order Top Bar */}
//                   <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
//                     <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
//                       <div>
//                         <span className="text-gray-500 uppercase tracking-wider text-[10px] block">Order Identifier</span>
//                         <span className="text-white font-mono font-medium">#{order._id.slice(-8).toUpperCase()}</span>
//                       </div>
//                       <div>
//                         <span className="text-gray-500 uppercase tracking-wider text-[10px] block">Acquisition Date</span>
//                         <span className="text-gray-300 font-medium">{dateStr}</span>
//                       </div>
//                       <div>
//                         <span className="text-gray-500 uppercase tracking-wider text-[10px] block">Total Amount</span>
//                         <span className="text-white font-bold text-sm">${Number(order.totalAmount || 0).toLocaleString()}</span>
//                       </div>
//                     </div>

//                     <span className={`px-3.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusClass}`}>
//                       {status}
//                     </span>
//                   </div>

//                   {/* Order Items */}
//                   <div className="flex flex-col gap-4">
//                     {items.map((item, idx) => {
//                       const prod = item.product || item.productId || {};
//                       return (
//                         <div key={idx} className="flex items-center justify-between gap-4">
//                           <div className="flex items-center gap-4">
//                             <div className="w-16 h-16 rounded-xl bg-[#141720] border border-white/10 p-2 shrink-0 flex items-center justify-center overflow-hidden">
//                               <img
//                                 src={prod.mainImage || "/default-watch.jpg"}
//                                 alt={prod.modelName || "Timepiece"}
//                                 className="w-full h-full object-cover"
//                               />
//                             </div>
//                             <div>
//                               <h4 className="text-sm font-bold text-white line-clamp-1">
//                                 {prod.modelName || "Haute Horlogerie Timepiece"}
//                               </h4>
//                               <p className="text-xs text-gray-400">
//                                 Qty: {item.quantity} • ${Number(item.price || prod.price || 0).toLocaleString()} each
//                               </p>
//                             </div>
//                           </div>

//                           <span className="text-sm font-bold text-white">
//                             ${Number((item.price || prod.price || 0) * item.quantity).toLocaleString()}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Actions Bar */}
//                   <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
//                     <span className="text-gray-500 text-[11px] flex items-center gap-1.5">
//                       <ShieldCheck size={14} className="text-gray-400" />
//                       Insured Swiss Delivery &amp; Certificate of Authenticity
//                     </span>

//                     {status === "Pending" && (
//                       <button
//                         onClick={() => handleCancel(order._id)}
//                         disabled={cancellingId === order._id}
//                         className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider text-[11px] border border-red-500/30 hover:border-red-500/60 px-4 py-2 rounded-full transition-all disabled:opacity-50"
//                       >
//                         {cancellingId === order._id ? "Cancelling…" : "Cancel Order"}
//                       </button>
//                     )}
//                   </div>

//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && !error && totalPages > 1 && (
//           <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-white/10">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors disabled:opacity-30"
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors disabled:opacity-30"
//             >
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         )}

//       </main>

//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useApi } from "../hooks/useApi";

const PAGE_SIZE = 4;

const STATUS_STYLES = {
  Delivered: "bg-white text-black font-bold border border-white",
  Shipped: "bg-white text-black font-bold",
  Pending: "bg-amber-400/10 text-amber-300 border border-amber-400/20",
  Cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function MyOrders() {
  const { get, del } = useApi();

  const [allOrders, setAllOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const totalOrders = allOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));

  const orders = allOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await get("/apiorders/myordes");
      setAllOrders(res?.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Could not load your orders right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  // =========================
  // CANCEL ORDER
  // =========================
  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you wish to cancel this order?")) {
      return;
    }

    setCancellingId(orderId);
    setError("");

    try {
      // Cancel Order API
      await del(`/apiorders/cancelMyOrder/${orderId}`);

      // Refresh orders after cancellation
      await fetchOrders();
    } catch (err) {
      console.error("Cancel order error:", err);
      setError(
        err?.message ||
          "Could not cancel this order. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black">

      {/* Header Banner */}
      <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-14 sm:py-16 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto flex flex-col items-center">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-3">
            <Package size={12} />
            Client Portfolio
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            My Orders
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Track your bespoke orders, certified deliveries, and acquisition
            records.
          </p>
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-6 sm:px-12 py-12">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">

          <Link
            to="/myaccount"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Client Dossier</span>
          </Link>

          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Total Orders: {totalOrders}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">
              Retrieving order ledger…
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-center text-xs text-red-400 mb-6 font-medium">
            {error}
          </div>
        )}

        {/* No Orders */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-[#0E1015] border border-white/10 rounded-3xl p-16 text-center max-w-lg mx-auto">

            <ShoppingBag
              size={40}
              className="text-gray-500 mx-auto mb-4"
            />

            <h3 className="text-xl font-bold text-white">
              No Orders Placed
            </h3>

            <p className="text-sm text-gray-400 mt-2 mb-6">
              You have not placed any timepiece orders yet. Explore our
              handcrafted collections.
            </p>

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-gray-200 transition-all"
            >
              <span>Explore Timepieces</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Orders */}
        {!loading && orders.length > 0 && (
          <div className="flex flex-col gap-6">

            {orders.map((order) => {
              const status = order.orderStatus || "Pending";

              const statusClass =
                STATUS_STYLES[status] || STATUS_STYLES.Pending;

              const items = order.items || [];

              const dateStr = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )
                : "Recent";

              return (
                <div
                  key={order._id}
                  className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 hover:border-white/25 transition-all shadow-xl"
                >

                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">

                      <div>
                        <span className="text-gray-500 uppercase tracking-wider text-[10px] block">
                          Order Identifier
                        </span>

                        <span className="text-white font-mono font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500 uppercase tracking-wider text-[10px] block">
                          Acquisition Date
                        </span>

                        <span className="text-gray-300 font-medium">
                          {dateStr}
                        </span>
                      </div>

                      {/* TOTAL AMOUNT */}
                      <div>
                        <span className="text-gray-500 uppercase tracking-wider text-[10px] block">
                          Total Amount
                        </span>

                        <span className="text-white font-bold text-sm">
                          ₹
                          {Number(
                            order.totalAmount || 0
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>

                    </div>

                    {/* Status */}
                    <span
                      className={`px-3.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusClass}`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="flex flex-col gap-4">

                    {items.map((item, idx) => {
                      const prod =
                        item.product ||
                        item.productId ||
                        {};

                      const itemPrice =
                        item.price ||
                        prod.price ||
                        0;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4"
                        >

                          <div className="flex items-center gap-4">

                            <div className="w-16 h-16 rounded-xl bg-[#141720] border border-white/10 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                              <img
                                src={
                                  prod.mainImage ||
                                  "/default-watch.jpg"
                                }
                                alt={
                                  prod.modelName ||
                                  "Timepiece"
                                }
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white line-clamp-1">
                                {prod.modelName ||
                                  "Haute Horlogerie Timepiece"}
                              </h4>

                              <p className="text-xs text-gray-400">
                                Qty: {item.quantity} • ₹
                                {Number(
                                  itemPrice
                                ).toLocaleString("en-IN")}{" "}
                                each
                              </p>
                            </div>

                          </div>

                          {/* ITEM TOTAL */}
                          <span className="text-sm font-bold text-white">
                            ₹
                            {Number(
                              itemPrice *
                                item.quantity
                            ).toLocaleString("en-IN")}
                          </span>

                        </div>
                      );
                    })}

                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">

                    <span className="text-gray-500 text-[11px] flex items-center gap-1.5">
                      <ShieldCheck
                        size={14}
                        className="text-gray-400"
                      />
                      Insured Swiss Delivery &amp; Certificate of
                      Authenticity
                    </span>

                    {/* CANCEL ORDER BUTTON */}
                    {status === "Pending" && (
                      <button
                        onClick={() =>
                          handleCancel(order._id)
                        }
                        disabled={
                          cancellingId === order._id
                        }
                        className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider text-[11px] border border-red-500/30 hover:border-red-500/60 px-4 py-2 rounded-full transition-all disabled:opacity-50"
                      >
                        {cancellingId === order._id
                          ? "Cancelling…"
                          : "Cancel Order"}
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* Pagination */}
        {!loading &&
          !error &&
          totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-white/10">

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
                disabled={page === totalPages}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>

            </div>
          )}

      </main>
    </div>
  );
}
