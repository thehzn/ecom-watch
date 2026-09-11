import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderConfirmed() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090C] text-white px-5">
        <div className="text-center">
          <h1 className="font-caslon text-3xl text-white">
            Order details not found
          </h1>

          <button
            onClick={() => navigate("/shop")}
            className="mt-6 bg-[#C5A880] hover:bg-[#d8bd95] text-black px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090C] text-white px-5 py-16">
      <div className="max-w-[1200px] mx-auto text-center">

        <div className="text-4xl mb-2">✓</div>

        <h1 className="font-caslon text-3xl sm:text-5xl text-white tracking-wide">
          THANK YOU
        </h1>

        <p className="mt-4 text-base text-white/60 mt-3">
          Your order has been placed successfully
        </p>

        <div className="max-w-[700px] mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="bg-[#0E1015] border border-white/10 rounded-xl p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A880]">
              Order Number
            </p>

            <p className="mt-2 font-caslon text-xl sm:text-2xl text-white break-all">
              {order._id}
            </p>
          </div>

          <div className="bg-[#0E1015] border border-white/10 rounded-xl p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A880]">
              Payment Status
            </p>

            <p className="mt-2 font-caslon text-xl sm:text-2xl text-white break-all">
              {order.paymentStatus}
            </p>
          </div>

        </div>

        <div className="max-w-[700px] mx-auto mt-10 text-left">

          <h2 className="font-caslon text-xl text-white">
            Order Summary
          </h2>

          <div className="mt-6 space-y-3 text-sm bg-[#0E1015] border border-white/10 rounded-xl p-6 sm:p-8">

            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>

            <div className="flex justify-between text-white/60">
              <span>Shipping</span>
              <span>
                {order.shipping === 0
                  ? "Free"
                  : `₹${order.shipping}`}
              </span>
            </div>

            <div className="flex justify-between border-t border-white/10 pt-4 font-caslon text-lg text-white font-normal">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>

          </div>

        </div>

        <div className="mt-16 flex flex-col sm:flex-row justify-center gap-4">

          <button
            onClick={() => navigate("/my-orders")}
            className="bg-black text-white rounded px-8 py-4 font-caslon text-xl text-white"
          >
            View Order Details
          </button>

          <button
            onClick={() => navigate("/shop")}
            className="bg-black text-black border border-black rounded px-8 py-4 font-caslon text-xl text-white"
          >
            Continue Shopping
          </button>

        </div>

      </div>
    </div>
  );
}