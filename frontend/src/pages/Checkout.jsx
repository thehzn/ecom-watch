import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

// ---- Validation schema -----------------------------------------------
const shippingSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  address: Yup.string().trim().required("Address is required"),
  city: Yup.string().trim().required("City is required"),
  pincode: Yup.string()
    .trim()
    .matches(/^\d{4,6}$/, "Enter a valid pincode")
    .required("Pincode is required"),
  phone: Yup.string()
    .trim()
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
    .required("Phone number is required"),
  shippingMethod: Yup.string().required(),
  paymentMethod: Yup.string().required(),
});

// ---- Shipping method options (data drives markup, not hardcoded blocks) ----
const SHIPPING_METHODS = [
  { value: "standard", label: "Standard Delivery", detail: "5-7 business days", charge: 0 },
  { value: "express", label: "Express Delivery", detail: "2-3 business days", charge: 25 },
  { value: "white-glove", label: "White Glove Delivery", detail: "White-glove in-home setup", charge: 75 },
];

// COD removed — backend has no COD support yet. Credit Card only until
// Najisha's Order schema/payment flow adds it back.
const PAYMENT_METHODS = [{ value: "card", label: "Credit Card" }];

export default function Checkout() {
  const navigate = useNavigate();
  const { request } = useApi();
  const [submitError, setSubmitError] = useState("");

  // Same cart slice shape Cart.jsx reads from
  const cartItems = useSelector((state) => state.cart?.items || []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
    0
  );

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      pincode: "",
      phone: "",
      shippingMethod: "standard",
      paymentMethod: "card",
    },
    validationSchema: shippingSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      const shippingCharge =
        SHIPPING_METHODS.find((m) => m.value === values.shippingMethod)?.charge || 0;

      try {
        // Assumed contract, unconfirmed with Najisha — same situation as
        // /apiwishlist and /apicarts before their backends existed.
        const res = await request({
          method: "POST",
          url: "/apicheckout/placeorder",
          data: {
            shippingAddress: {
              firstName: values.firstName,
              lastName: values.lastName,
              address: values.address,
              city: values.city,
              pincode: values.pincode,
              phone: values.phone,
            },
            shippingMethod: values.shippingMethod,
            paymentMethod: values.paymentMethod,
            items: cartItems.map((item) => ({
              product: item.product?._id,
              quantity: item.quantity,
            })),
            subtotal,
            shippingCharge,
            total: subtotal + shippingCharge,
          },
        });

        navigate("/order-success", { state: { order: res?.data } });
      } catch (err) {
        setSubmitError(
          err?.response?.data?.message || "Could not place order. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedShipping = SHIPPING_METHODS.find(
    (m) => m.value === formik.values.shippingMethod
  );
  const shippingCharge = selectedShipping?.charge || 0;
  const total = subtotal + shippingCharge;

  const inputClass =
    "w-full border-b border-[#C4C7C7] py-4 bg-transparent font-['Inter'] text-[15px] text-black placeholder:text-[#5D5E63] focus:outline-none focus:border-black transition-colors";

  return (
    <div className="w-full bg-[#F9F9F9] font-['Inter']">
      <div className="max-w-[1200px] mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* ---------------- LEFT COLUMN ---------------- */}
        <form onSubmit={formik.handleSubmit} noValidate>
          {/* Shipping Address */}
          <section>
            <h2 className="font-['Libre_Caslon_Text'] text-[32px] font-normal text-black mb-8">
              Shipping Address
            </h2>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    className={inputClass}
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-600 text-xs mt-1">{formik.errors.firstName}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    className={inputClass}
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-600 text-xs mt-1">{formik.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className={inputClass}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className={inputClass}
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.city && formik.errors.city && (
                    <p className="text-red-600 text-xs mt-1">{formik.errors.city}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    className={inputClass}
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.pincode && formik.errors.pincode && (
                    <p className="text-red-600 text-xs mt-1">{formik.errors.pincode}</p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone No"
                  className={inputClass}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.phone}</p>
                )}
              </div>
            </div>
          </section>

          {/* Shipping Method */}
          <section className="mt-8">
            <h2 className="font-['Libre_Caslon_Text'] text-2xl font-normal text-black mb-4">
              Shipping Method
            </h2>
            <div className="flex flex-col gap-3">
              {SHIPPING_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center justify-between bg-white border p-4 cursor-pointer transition-colors ${
                    formik.values.shippingMethod === method.value
                      ? "border-black"
                      : "border-[#E2E2E2]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.value}
                      checked={formik.values.shippingMethod === method.value}
                      onChange={formik.handleChange}
                      className="accent-black"
                    />
                    <span>
                      <span className="block text-sm text-black">{method.label}</span>
                      <span className="block text-xs text-[#5D5E63]">{method.detail}</span>
                    </span>
                  </span>
                  <span className="text-sm text-black">
                    {method.charge === 0 ? "Free" : `$${method.charge}`}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Payment */}
          <section className="mt-8">
            <h2 className="font-['Libre_Caslon_Text'] text-2xl font-normal text-black mb-4">
              Payment
            </h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 bg-white border p-4 cursor-pointer transition-colors ${
                    formik.values.paymentMethod === method.value
                      ? "border-black"
                      : "border-[#E2E2E2]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={formik.values.paymentMethod === method.value}
                    onChange={formik.handleChange}
                    className="accent-black"
                  />
                  <span className="text-sm text-black">{method.label}</span>
                </label>
              ))}
            </div>
          </section>

          {submitError && (
            <p className="text-red-600 text-sm mt-6">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting || cartItems.length === 0}
            className="mt-8 bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {formik.isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        {/* ---------------- RIGHT COLUMN ---------------- */}
        <aside className="h-fit lg:sticky lg:top-8">
          <h2 className="font-['Libre_Caslon_Text'] text-2xl font-normal text-black mb-6">
            Order Summary
          </h2>

          <div className="flex flex-col gap-4 mb-6">
            {cartItems.length === 0 ? (
              <p className="text-sm text-[#5D5E63]">Your cart is empty.</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.product?._id} className="flex gap-4 items-center">
                  <img
                    src={item.product?.mainImage}
                    alt={item.product?.modelName}
                    className="w-16 h-16 object-cover bg-white"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-black">{item.product?.modelName}</p>
                    <p className="text-xs text-[#5D5E63]">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm text-black">
                    ${((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-3 font-['Inter'] text-base">
            <div className="flex justify-between text-[#5D5E63]">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#5D5E63]">
              <span>Shipping Charge</span>
              <span>{shippingCharge === 0 ? "Free" : `$${shippingCharge.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-black border-t border-[#E2E2E2] pt-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
