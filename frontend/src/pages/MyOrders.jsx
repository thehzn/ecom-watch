// import { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { ShoppingBag, ChevronLeft, ChevronRight, Package, Clock, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
// import { useApi } from "../hooks/useApi";

// const PAGE_SIZE = 4;

// const STATUS_STYLES = {
//   Delivered: "bg-white/10 text-white border border-white/20",
//   Shipped: "bg-white text-black font-bold",
//   Pending: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
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
//     } catch {
//       setError("Could not load your acquisitions right now.");
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
//     setCancellingId(orderId);
//     setError("");
//     try {
//       await del(`/apiorders/cancelorder/${orderId}`);
//       fetchOrders();
//     } catch {
//       setError("Could not cancel this order. Please contact Concierge.");
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
//             Timepiece Acquisitions
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
//             <p className="text-sm text-gray-400">Retrieving acquisition ledger…</p>
//           </div>
//         )}

//         {!loading && error && (
//           <p className="py-16 text-center text-sm text-red-400">{error}</p>
//         )}

//         {!loading && !error && orders.length === 0 && (
//           <div className="bg-[#0E1015] border border-white/10 rounded-3xl p-16 text-center max-w-lg mx-auto">
//             <ShoppingBag size={40} className="text-gray-500 mx-auto mb-4" />
//             <h3 className="text-xl font-bold text-white">No Acquisitions Yet</h3>
//             <p className="text-sm text-gray-400 mt-2 mb-6">
//               You have not placed any timepiece orders yet. Explore our handcrafted collection.
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

//         {!loading && !error && orders.length > 0 && (
//           <div className="flex flex-col gap-6">
//             {orders.map((order) => {
//               const status = order.orderStatus || "Pending";
//               const statusClass = STATUS_STYLES[status] || STATUS_STYLES.Pending;
//               const items = order.items || [];
//               const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';

//               return (
//                 <div
//                   key={order._id}
//                   className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 hover:border-white/25 transition-all shadow-xl"
//                 >
//                   {/* Order Top Bar */}
//                   <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
//                     <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
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

//                     <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusClass}`}>
//                       {status}
//                     </span>
//                   </div>

//                   {/* Order Items */}
//                   <div className="flex flex-col gap-4">
//                     {items.map((item, idx) => {
//                       const prod = item.productId || {};
//                       return (
//                         <div key={idx} className="flex items-center justify-between gap-4">
//                           <div className="flex items-center gap-4">
//                             <div className="w-16 h-16 rounded-xl bg-[#141720] border border-white/10 p-2 shrink-0 flex items-center justify-center">
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
//                             \${Number((item.price || prod.price || 0) * item.quantity).toLocaleString()}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Actions Bar */}
//                   <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
//                     <span className="text-gray-500 text-[11px] flex items-center gap-1.5">
//                       <ShieldCheck size={14} className="text-gray-400" />
//                       Insured Swiss Delivery &amp; Certificate of Authenticity
//                     </span>

//                     {status === "Pending" && (
//                       <button
//                         onClick={() => handleCancel(order._id)}
//                         disabled={cancellingId === order._id}
//                         className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider text-[11px] transition-colors disabled:opacity-50"
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
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  CreditCard,
} from "lucide-react";
import { useApi } from "../hooks/useApi";

const PAGE_SIZE = 4;

const STATUS_STYLES = {
  Delivered: "bg-white text-black border border-white",
  Shipped: "bg-white text-black font-bold",
  Pending:
    "bg-amber-400/10 text-amber-300 border border-amber-400/20",
  Cancelled:
    "bg-red-500/10 text-red-400 border border-red-500/20",
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

  const totalPages = Math.max(
    1,
    Math.ceil(totalOrders / PAGE_SIZE)
  );

  const orders = allOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const formatPrice = (value) => {
    const amount = Number(value ?? 0);

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await get("/apiorders/myordes");

      console.log("ORDERS RESPONSE:", res);
      console.log("FIRST ORDER:", res?.orders?.[0]);

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

  const handleCancel = async (orderId) => {
    setCancellingId(orderId);
    setError("");

    try {
      await del(`/apiorders/cancelorder/${orderId}`);

      fetchOrders();
    } catch (err) {
      console.error("Cancel order error:", err);

      setError(
        "Could not cancel this order. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07080B] text-white font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black">

      {/* ================= HEADER ================= */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-[#101218] to-[#090A0E] px-6 py-16 sm:py-20">

        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-400">
            <Package size={12} />

            My Orders
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
            My Orders
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-[15px]">
            View and track your watch orders, deliveries, and order history.
          </p>

          <div className="mt-7 h-px w-16 bg-white/20" />
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">

        {/* TOP BAR */}
        <div className="mb-8 flex flex-col gap-5 border-b border-white/[0.08] pb-7 sm:flex-row sm:items-center sm:justify-between">

          <Link
            to="/myaccount"
            className="group inline-flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-200 transition-colors hover:text-white"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />

            <span>Return to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-200">

            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />

            Total Orders: {totalOrders}
          </div>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

            <div className="mb-5 h-9 w-9 animate-spin rounded-full border border-white/20 border-t-white" />

            <p className="text-xs uppercase tracking-[0.15em] text-gray-500">
              Loading your orders…
            </p>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div className="mx-auto max-w-lg rounded-2xl border border-red-500/10 bg-red-500/[0.04] px-6 py-12 text-center">

            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!loading && !error && orders.length === 0 && (
          <div className="mx-auto max-w-xl rounded-[28px] border border-white/[0.08] bg-[#0C0E13] px-7 py-16 text-center shadow-2xl sm:px-14">

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              <ShoppingBag
                size={27}
                className="text-gray-500"
              />
            </div>

            <h3 className="text-xl font-semibold text-white">
              No Orders Yet
            </h3>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
              You have not placed any orders yet. Explore our collection and find your perfect timepiece.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition-all hover:bg-gray-200 hover:shadow-lg hover:shadow-white/5"
            >
              <span>Explore Watches</span>

              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ================= ORDERS ================= */}
        {!loading && !error && orders.length > 0 && (
          <div className="flex flex-col gap-5">

            {orders.map((order) => {

              const status = order.orderStatus || "Pending";

              const statusClass =
                STATUS_STYLES[status] ||
                STATUS_STYLES.Pending;

              const items = order.items || [];

              const dateStr = order.createdAt
                ? new Date(
                    order.createdAt
                  ).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Recent";

              /*
               * Backend order model uses `total`.
               * Fallbacks are included in case your response
               * uses another property.
               */
              const orderTotal = Number(
                order.total ??
                order.totalAmount ??
                order.grandTotal ??
                0
              );

              return (
                <article
                  key={order._id}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C0E13] transition-all duration-300 hover:border-white/[0.16] hover:bg-[#0E1015]"
                >

                  {/* ================= ORDER HEADER ================= */}
                  <div className="flex flex-col gap-5 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

                    <div className="flex flex-wrap items-center gap-x-7 gap-y-4">

                      {/* ORDER ID */}
                      <div>
                        <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          Order ID
                        </span>

                        <span className="font-mono text-xs font-medium tracking-wider text-gray-300">
                          #
                          {order._id
                            ?.slice(-8)
                            .toUpperCase()}
                        </span>
                      </div>

                      <div className="hidden h-7 w-px bg-white/[0.08] sm:block" />

                      {/* DATE */}
                      <div className="flex items-center gap-2">

                        <CalendarDays
                          size={13}
                          className="text-gray-600"
                        />

                        <div>

                          <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                            Order Date
                          </span>

                          <span className="text-xs font-medium text-gray-400">
                            {dateStr}
                          </span>

                        </div>
                      </div>

                      <div className="hidden h-7 w-px bg-white/[0.08] sm:block" />

                      {/* TOTAL */}
                      <div className="flex items-center gap-2">

                        <CreditCard
                          size={13}
                          className="text-gray-600"
                        />

                        <div>

                          <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                            Total Amount
                          </span>

                          <span className="text-sm font-bold tracking-wide text-white">
                            {formatPrice(orderTotal)}
                          </span>

                        </div>
                      </div>
                    </div>

                    {/* STATUS */}
                    <span
                      className={`w-fit rounded-full px-3.5 py-1.5 text-[9px] uppercase tracking-[0.16em] ${statusClass}`}
                    >
                      {status}
                    </span>

                  </div>

                  {/* ================= PRODUCTS ================= */}
                  <div className="px-5 py-6 sm:px-7">

                    <div className="flex flex-col divide-y divide-white/[0.06]">

                      {items.map((item, idx) => {

                        /*
                         * Product can come as:
                         * item.product
                         * OR
                         * item.productId
                         */
                        const prod =
                          item.product ||
                          item.productId ||
                          {};

                        /*
                         * Support multiple image fields.
                         */
                        const productImage =
                          prod.mainImage ||
                          prod.image ||
                          (Array.isArray(
                            prod.images
                          )
                            ? prod.images[0]
                            : null) ||
                          "/default-watch.jpg";

                        const itemPrice = Number(
                          item.price ??
                          prod.price ??
                          0
                        );

                        const quantity = Number(
                          item.quantity ?? 0
                        );

                        const itemTotal =
                          itemPrice * quantity;

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                          >

                            {/* PRODUCT INFO */}
                            <div className="flex min-w-0 items-center gap-4">

                              {/* IMAGE */}
                              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#14161C] p-2.5 transition-all duration-300 group-hover:border-white/[0.14]">

                                <img
                                  src={productImage}
                                  alt={
                                    prod.modelName ||
                                    "Watch"
                                  }
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    if (
                                      e.currentTarget
                                        .src.includes(
                                          "default-watch.jpg"
                                        )
                                    ) {
                                      return;
                                    }

                                    e.currentTarget.src =
                                      "/default-watch.jpg";
                                  }}
                                />

                              </div>

                              {/* DETAILS */}
                              <div className="min-w-0">

                                <h4 className="truncate text-sm font-semibold text-white">
                                  {prod.modelName ||
                                    prod.name ||
                                    "Watch"}
                                </h4>

                                <p className="mt-1.5 text-[11px] text-gray-500">

                                  Qty: {quantity}

                                  <span className="mx-2 text-gray-700">
                                    •
                                  </span>

                                  {formatPrice(
                                    itemPrice
                                  )}{" "}
                                  each

                                </p>

                              </div>

                            </div>

                            {/* ITEM TOTAL */}
                            <span className="shrink-0 text-sm font-semibold text-gray-200">
                              {formatPrice(itemTotal)}
                            </span>

                          </div>
                        );
                      })}

                    </div>
                  </div>

                  {/* ================= FOOTER ================= */}
                  <div className="flex flex-col gap-4 border-t border-white/[0.06] bg-white/[0.015] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">

                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.12em] text-gray-600">

                      <ShieldCheck
                        size={14}
                        className="shrink-0 text-gray-500"
                      />

                      <span>
                        Secure Delivery &amp; Certificate of Authenticity
                      </span>

                    </div>

                    {/* CANCEL */}
                    {status === "Pending" && (
                      <button
                        onClick={() =>
                          handleCancel(order._id)
                        }
                        disabled={
                          cancellingId === order._id
                        }
                        className="w-fit text-[10px] font-bold uppercase tracking-[0.16em] text-red-400 transition-colors hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {cancellingId ===
                        order._id
                          ? "Cancelling…"
                          : "Cancel Order"}
                      </button>
                    )}

                  </div>

                </article>
              );
            })}
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {!loading &&
          !error &&
          totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center border-t border-white/[0.08] pt-7">

              {/* PREVIOUS */}
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                disabled={page === 1}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] text-gray-400 transition-all hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </button>

              {/* PAGE */}
              <div className="mx-5 flex flex-col items-center">

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Page {page} of {totalPages}
                </span>

                <span className="mt-1 text-[9px] uppercase tracking-[0.15em] text-gray-700">
                  Order History
                </span>

              </div>

              {/* NEXT */}
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                  )
                }
                disabled={
                  page === totalPages
                }
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] text-gray-400 transition-all hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>

            </div>
          )}

      </main>
    </div>
  );
}