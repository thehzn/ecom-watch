import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {ArrowLeft,Package,ShieldCheck,MapPin,CreditCard,Truck,} from "lucide-react";
import { useApi } from "../hooks/useApi";

const STATUS_STYLES = {
  Delivered: "bg-white text-black font-bold border border-white",
  Shipped: "bg-white text-black font-bold",
  Pending: "bg-amber-400/10 text-amber-300 border border-amber-400/20",
  Cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function OrderDetails() {
  const { id } = useParams();
  const { get, post } = useApi();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // =========================
  // FETCH SINGLE ORDER
  // =========================
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await get(`/apiorders/singleorder/${id}`);

        if (!res?.order) {
          setError("Order not found.");
          return;
        }

        setOrder(res.order);
      } catch (err) {
        console.error("Fetch single order error:", err);
        setError(
          err?.message || "Could not load this order right now."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // =========================
  // PAY NOW / RETRY PAYMENT
  // =========================
  const handlePayment = async () => {
    setPaymentLoading(true);
    setPaymentError("");

    try {
      // Create a new Razorpay payment attempt
      // for the SAME existing order
      const res = await post(`/apiorders/retrypayment/${order._id}`);

      if (!res?.status) {
        throw new Error(
          res?.message || "Could not start payment."
        );
      }

      const { razorpayOrder, razorpayKey } = res;

      if (!window.Razorpay) {
        throw new Error("Razorpay is not loaded.");
      }

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Chronos",
        description: "Payment for your Chronos order",
        order_id: razorpayOrder.id,

        // =========================
        // PAYMENT SUCCESS
        // =========================
        handler: async function (paymentResponse) {
          try {
            const verifyRes = await post(
              "/apiorders/verifypayment",
              {
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            if (!verifyRes?.status) {
              throw new Error(
                verifyRes?.message ||
                  "Payment verification failed."
              );
            }

            // Update current order on the page
            setOrder(verifyRes.order);

            setPaymentError("");

          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setPaymentError(
              error?.message ||
                "Payment verification failed."
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        // =========================
        // RAZORPAY MODAL CLOSED
        // =========================
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);

            setPaymentError(
              "Payment was cancelled. You can try again."
            );
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      // =========================
      // PAYMENT FAILED
      // =========================
      razorpay.on(
        "payment.failed",
        async function (response) {
          console.error("Payment failed:", response);

          try {
            const failedRes = await post(
              "/apiorders/markpaymentfailed",
              {
                razorpay_order_id: razorpayOrder.id,
              }
            );

            if (failedRes?.order) {
              setOrder(failedRes.order);
            } else {
              setOrder((previousOrder) => ({
                ...previousOrder,
                paymentStatus: "Failed",
              }));
            }
          } catch (error) {
            console.error(
              "Failed to update payment status:",
              error
            );
          }

          setPaymentError(
            response?.error?.description ||
              "Payment failed. Please try again."
          );

          setPaymentLoading(false);
        }
      );

      razorpay.open();

    } catch (error) {
      console.error("Payment error:", error);

      setPaymentError(
        error?.message ||
          "Could not start payment. Please try again."
      );

      setPaymentLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] text-white flex items-center justify-center font-['Plus_Jakarta_Sans']">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-400">
            Retrieving order details…
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR / NOT FOUND
  // =========================
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#08090C] text-white font-['Plus_Jakarta_Sans']">
        <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-14 text-center">
          <Package
            size={32}
            className="mx-auto mb-4 text-gray-400"
          />

          <h1 className="text-3xl sm:text-4xl font-bold">
            Order Not Found
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            {error || "We could not find this order."}
          </p>
        </section>

        <div className="flex justify-center mt-10">
          <Link
            to="/myorders"
            className="inline-flex items-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-gray-200 transition-all"
          >
            <ArrowLeft size={14} />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const status = order.orderStatus || "Pending";

  const statusClass =
    STATUS_STYLES[status] || STATUS_STYLES.Pending;

  const items = order.items || [];

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent";

  const address = order.shippingAddress || {};

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black">

      {/* =========================
          HEADER
      ========================= */}
      <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-14 sm:py-16 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto flex flex-col items-center">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-3">
            <Package size={12} />
            Order Details
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Order Details
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Review your order, delivery information, and payment details.
          </p>
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-6 sm:px-12 py-10">

        {/* =========================
            BACK
        ========================= */}
        <div className="mb-8">
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to My Orders
          </Link>
        </div>

        {/* =========================
            ORDER SUMMARY HEADER
        ========================= */}
        <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">

          <div className="flex flex-wrap items-start justify-between gap-5">

            <div>
              <p className="text-gray-500 uppercase tracking-wider text-[10px] mb-1">
                Order Identifier
              </p>

              <h2 className="text-white font-mono font-bold text-lg">
                #{order._id.slice(-8).toUpperCase()}
              </h2>

              <p className="text-xs text-gray-400 mt-2">
                Ordered on {dateStr}
              </p>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-wider ${statusClass}`}
            >
              {status}
            </span>

          </div>
        </div>

        {/* =========================
            ORDER ITEMS
        ========================= */}
        <section className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">

          <div className="flex items-center gap-2 mb-6">
            <Package size={17} className="text-gray-300" />

            <h2 className="text-sm font-bold uppercase tracking-wider">
              Ordered Items
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-white/10">

            {items.map((item, index) => {

              const product = item.product || {};

              const displayName =
                item.productName ||
                product.modelName ||
                "Haute Horlogerie Timepiece";

              const displayImage =
                item.image ||
                product.mainImage ||
                "/default-watch.jpg";

              const price = Number(
                item.price || product.price || 0
              );

              const quantity = Number(item.quantity || 0);

              const itemTotal = price * quantity;

              return (
                <div
                  key={item._id || index}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >

                  <div className="flex items-center gap-4 min-w-0">

                    <div className="w-20 h-20 rounded-xl bg-[#141720] border border-white/10 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={displayImage}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">

                      <h3 className="text-sm font-bold text-white truncate">
                        {displayName}
                      </h3>

                      {item.sku && (
                        <p className="text-[11px] text-gray-500 mt-1">
                          SKU: {item.sku}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        Quantity: {quantity}
                      </p>

                      <p className="text-xs text-gray-400">
                        ₹{price.toLocaleString("en-IN")} each
                      </p>

                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Item Total
                    </p>

                    <p className="text-sm font-bold text-white mt-1">
                      ₹{itemTotal.toLocaleString("en-IN")}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>
        </section>

        {/* =========================
            ORDER SUMMARY + PAYMENT
        ========================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* ORDER SUMMARY */}
          <section className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-8">

            <h2 className="text-sm font-bold uppercase tracking-wider mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Subtotal
                </span>

                <span className="text-white">
                  ₹{Number(order.subtotal || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Discount
                </span>

                <span className="text-green-400">
                  - ₹{Number(order.discount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Shipping
                </span>

                <span className="text-white">
                  ₹{Number(order.shipping || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Tax
                </span>

                <span className="text-white">
                  ₹{Number(order.tax || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-between gap-4">
                <span className="text-white font-bold">
                  Total
                </span>

                <span className="text-white font-bold text-lg">
                  ₹{Number(order.total || 0).toLocaleString("en-IN")}
                </span>
              </div>

            </div>
          </section>

          {/* PAYMENT */}
          <section className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-8">

            <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <CreditCard size={16} />
              Payment Information
            </h2>

            <div className="space-y-4 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Payment Method
                </span>

                <span className="text-white font-medium">
                  {order.paymentMethod || "Razorpay"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-400">
                  Payment Status
                </span>

                <span
                  className={
                    order.paymentStatus === "Paid"
                      ? "text-green-400 font-medium"
                      : order.paymentStatus === "Failed"
                      ? "text-red-400 font-medium"
                      : "text-amber-300 font-medium"
                  }
                >
                  {order.paymentStatus || "Pending"}
                </span>
              </div>

              {order.razorpayPaymentId && (
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
                    Payment ID
                  </p>

                  <p className="text-xs text-gray-300 font-mono break-all">
                    {order.razorpayPaymentId}
                  </p>
                </div>
              )}

              {order.razorpayOrderId && (
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
                    Razorpay Order ID
                  </p>

                  <p className="text-xs text-gray-300 font-mono break-all">
                    {order.razorpayOrderId}
                  </p>
                </div>
              )}

              {/* =========================
                  PAY NOW / RETRY BUTTON
              ========================= */}
              {order.paymentStatus !== "Paid" &&
                order.orderStatus !== "Cancelled" && (
                  <div className="pt-4 border-t border-white/10">

                    {paymentError && (
                      <p className="text-sm text-red-400 mb-4">
                        {paymentError}
                      </p>
                    )}

                    <button
                      onClick={handlePayment}
                      disabled={paymentLoading}
                      className="w-full py-4 bg-white text-black text-[11px] font-bold uppercase tracking-wider transition-opacity duration-300 hover:opacity-90 disabled:opacity-40"
                    >
                      {paymentLoading
                        ? "Processing Payment..."
                        : order.paymentStatus === "Failed"
                        ? "Retry Payment"
                        : "Pay Now"}
                    </button>

                  </div>
                )}

            </div>
          </section>

        </div>

        {/* =========================
            DELIVERY INFORMATION
        ========================= */}
        <section className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-8 mb-6">

          <div className="flex items-center gap-2 mb-6">
            <Truck size={17} className="text-gray-300" />

            <h2 className="text-sm font-bold uppercase tracking-wider">
              Delivery Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* SHIPPING METHOD */}
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">
                Shipping Method
              </p>

              <p className="text-sm text-white font-medium">
                {order.shippingMethod || "Standard"}
              </p>
            </div>

            {/* ADDRESS */}
            <div>

              <div className="flex items-center gap-2 mb-2">
                <MapPin size={14} className="text-gray-400" />

                <p className="text-gray-500 text-[10px] uppercase tracking-wider">
                  Shipping Address
                </p>
              </div>

              <div className="text-sm text-gray-300 leading-6">

                <p className="text-white font-medium">
                  {address.firstName} {address.lastName}
                </p>

                <p>{address.address}</p>

                <p>
                  {address.city}, {address.state}
                </p>

                <p>{address.pincode}</p>

                <p className="mt-2 text-gray-400">
                  Phone: {address.phone}
                </p>

              </div>

            </div>

          </div>
        </section>

        {/* =========================
            FOOTER INFO
        ========================= */}
        <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-5 flex items-center gap-3">

          <ShieldCheck
            size={18}
            className="text-gray-400 shrink-0"
          />

          <p className="text-xs text-gray-500">
            Your order is protected with insured Swiss delivery and a
            Certificate of Authenticity.
          </p>

        </div>

      </main>
    </div>
  );
}