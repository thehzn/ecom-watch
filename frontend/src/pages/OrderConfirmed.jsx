import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderConfirmed() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] px-5">
        <div className="text-center">
          <h1 className="font-['Libre_Caslon_Text'] text-3xl text-black">
            Order details not found
          </h1>

          <button
            onClick={() => navigate("/shop")}
            className="mt-6 bg-black text-white px-8 py-4 text-xs font-semibold uppercase tracking-wide"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] px-5 py-16">
      <div className="max-w-[1200px] mx-auto text-center">

        <div className="text-4xl mb-2">✓</div>

        <h1 className="font-['Libre_Caslon_Text'] text-[40px] font-normal text-black tracking-[2px]">
          THANK YOU
        </h1>

        <p className="mt-4 font-['Inter'] text-lg text-[#5D5E63]">
          Your order has been placed successfully
        </p>

        <div className="max-w-[700px] mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="bg-[#F3F3F4] border border-[#E2E2E2] p-8">
            <p className="font-['Inter'] text-[10px] font-medium uppercase text-[#5D5E63]">
              Order Number
            </p>

            <p className="mt-2 font-['Libre_Caslon_Text'] text-2xl text-black">
              {order._id}
            </p>
          </div>

          <div className="bg-[#F3F3F4] border border-[#E2E2E2] p-8">
            <p className="font-['Inter'] text-[10px] font-medium uppercase text-[#5D5E63]">
              Payment Status
            </p>

            <p className="mt-2 font-['Libre_Caslon_Text'] text-2xl text-black">
              {order.paymentStatus}
            </p>
          </div>

        </div>

        <div className="max-w-[700px] mx-auto mt-10 text-left">

          <h2 className="font-['Inter'] text-xs font-semibold uppercase tracking-[1px]">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4 font-['Inter'] text-base">

            <div className="flex justify-between text-[#5D5E63]">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>

            <div className="flex justify-between text-[#5D5E63]">
              <span>Shipping</span>
              <span>
                {order.shipping === 0
                  ? "Free"
                  : `₹${order.shipping}`}
              </span>
            </div>

            <div className="flex justify-between border-t border-[#E2E2E2] pt-4 font-bold text-black">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>

          </div>

        </div>

        <div className="mt-16 flex flex-col sm:flex-row justify-center gap-4">

          <button
            onClick={() => navigate("/my-orders")}
            className="bg-black text-white rounded px-8 py-4 font-['Inter'] text-xs font-semibold uppercase tracking-[1px]"
          >
            View Order Details
          </button>

          <button
            onClick={() => navigate("/shop")}
            className="bg-white text-black border border-black rounded px-8 py-4 font-['Inter'] text-xs font-semibold uppercase tracking-[1px]"
          >
            Continue Shopping
          </button>

        </div>

      </div>
    </div>
  );
}