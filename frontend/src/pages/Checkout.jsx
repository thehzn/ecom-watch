import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

// Validation
const shippingSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .required("First name is required"),

  lastName: Yup.string()
    .trim()
    .required("Last name is required"),

  address: Yup.string()
    .trim()
    .required("Address is required"),

  city: Yup.string()
    .trim()
    .required("City is required"),

  state: Yup.string()
    .trim()
    .required("State is required"),

  pincode: Yup.string()
    .trim()
    .matches(/^\d{4,6}$/, "Enter a valid pincode")
    .required("Pincode is required"),

  phone: Yup.string()
    .trim()
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
    .required("Phone number is required"),

  shippingMethod: Yup.string()
    .required("Shipping method is required"),

  paymentMethod: Yup.string()
    .required("Payment method is required"),
});

// Shipping methods
// These values now match the backend
const SHIPPING_METHODS = [
  {
    value: "Standard",
    label: "Standard Delivery",
    detail: "5-7 business days",
    charge: 100,
  },
  {
    value: "Express",
    label: "Express Delivery",
    detail: "2-3 business days",
    charge: 500,
  },
  {
    value: "White Glove",
    label: "White Glove Delivery",
    detail: "White-glove in-home setup",
    charge: 1000,
  },
];

// Payment methods
const PAYMENT_METHODS = [
  {
    value: "Razorpay",
    label: "Razorpay",
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { request, get } = useApi();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");

  // Backend order summary
  const [orderSummary, setOrderSummary] = useState(null);

  // ============================================================
  // LOAD CART FROM BACKEND
  // ============================================================

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setCartLoading(true);

      const res = await get(
        "/apicarts/getcartitems",
        { allowNotFound: true }
      );

      console.log("Checkout cart response:", res);

      setCartItems(res?.cart?.items ?? []);

      // Save backend order summary
      setOrderSummary(res?.orderSummary ?? null);

      console.log(
        "Checkout order summary:",
        res?.orderSummary
      );
    } catch (error) {
      console.error("Checkout cart error:", error);

      setCartItems([]);
      setOrderSummary(null);
    } finally {
      setCartLoading(false);
    }
  };

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const calculatedSubtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.product?.price || 0) *
        (item.quantity || 1),
    0
  );

  // Use backend subtotal if available
  const subtotal =
    Number(orderSummary?.subtotal) ||
    calculatedSubtotal;

  // ============================================================
  // FORMIK
  // ============================================================

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      shippingMethod: "Standard",
      paymentMethod: "Razorpay",
    },

    validationSchema: shippingSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");

      try {
        console.log("========== CHECKOUT SUBMITTED ==========");
        console.log("Checkout values:", values);
        console.log("Cart items:", cartItems);

        // ======================================================
        // 1. CREATE ORDER
        // ======================================================

        const res = await request(
          "/apiorders/ordercreate",
          {
            method: "POST",

            body: JSON.stringify({
              shippingMethod: values.shippingMethod,

              shippingAddress: {
                firstName: values.firstName,
                lastName: values.lastName,
                address: values.address,
                city: values.city,
                state: values.state,
                pincode: values.pincode,
                phone: values.phone,
              },
            }),
          }
        );

        console.log(
          "========== CREATE ORDER RESPONSE =========="
        );

        console.log(
          "Create order response:",
          res
        );

        if (!res?.status) {
          throw new Error(
            res?.message ||
              "Unable to create order"
          );
        }

        const {
          order,
          razorpayOrder,
          razorpayKey,
          discount,
        } = res;

        console.log(
          "MongoDB Order:",
          order
        );

        console.log(
          "Razorpay Order:",
          razorpayOrder
        );

        console.log(
          "Razorpay Key:",
          razorpayKey
        );

        console.log(
          "Subscription Discount:",
          discount
        );

        // ======================================================
        // 2. CHECK RAZORPAY SDK
        // ======================================================

        if (!window.Razorpay) {
          throw new Error(
            "Razorpay SDK is not loaded. Please check index.html."
          );
        }

        if (!razorpayOrder?.id) {
          throw new Error(
            "Razorpay order was not created."
          );
        }

        if (!razorpayKey) {
          throw new Error(
            "Razorpay key is missing."
          );
        }

        // ======================================================
        // 3. RAZORPAY OPTIONS
        // ======================================================

        const options = {
          key: razorpayKey,

          // Backend sends the discounted final amount
          amount: razorpayOrder.amount,

          currency: razorpayOrder.currency,

          name: "CHRONOS",

          description: "Luxury Watch Purchase",

          order_id: razorpayOrder.id,

          // ====================================================
          // PAYMENT SUCCESS
          // ====================================================

          handler: async function (paymentResponse) {
            try {
              setSubmitError("");

              console.log(
                "Payment response:",
                paymentResponse
              );

              // ==================================================
              // 4. VERIFY PAYMENT
              // ==================================================

              const verifyRes = await request(
                "/apiorders/verifypayment",
                {
                  method: "POST",

                  body: JSON.stringify({
                    razorpay_order_id:
                      paymentResponse.razorpay_order_id,

                    razorpay_payment_id:
                      paymentResponse.razorpay_payment_id,

                    razorpay_signature:
                      paymentResponse.razorpay_signature,
                  }),
                }
              );

              console.log(
                "Payment verification response:",
                verifyRes
              );

              if (!verifyRes?.status) {
                throw new Error(
                  verifyRes?.message ||
                    "Payment verification failed"
                );
              }

              // ==================================================
              // 5. ORDER CONFIRMED
              // ==================================================

              navigate("/order-confirmed", {
                state: {
                  order: verifyRes.order,
                },
              });
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              setSubmitError(
                error?.message ||
                  "Payment verification failed."
              );
            }
          },

          // ====================================================
          // CUSTOMER DETAILS
          // ====================================================

          prefill: {
            name: `${values.firstName} ${values.lastName}`,
            contact: values.phone,
          },

          notes: {
            shippingMethod:
              values.shippingMethod,
          },

          theme: {
            color: "#000000",
          },

          // ====================================================
          // POPUP CLOSED
          // ====================================================

          modal: {
            ondismiss: function () {
              setSubmitError(
                "Payment was cancelled. Your order is still pending."
              );
            },
          },
        };

        // ======================================================
        // 6. CREATE RAZORPAY INSTANCE
        // ======================================================

        const razorpay =
          new window.Razorpay(options);

        // ======================================================
        // 7. PAYMENT FAILED
        // ======================================================

        razorpay.on(
          "payment.failed",
          function (response) {
            console.error(
              "Payment failed:",
              response
            );

            setSubmitError(
              response?.error?.description ||
                "Payment failed. Please try again."
            );
          }
        );

        // ======================================================
        // 8. OPEN RAZORPAY
        // ======================================================

        console.log(
          "Opening Razorpay..."
        );

        razorpay.open();
      } catch (error) {
        console.error(
          "Create order error:",
          error
        );

        setSubmitError(
          error?.message ||
            "Could not create order. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ============================================================
  // SELECTED SHIPPING
  // ============================================================

  const selectedShipping =
    SHIPPING_METHODS.find(
      (method) =>
        method.value ===
        formik.values.shippingMethod
    );

  const selectedShippingCharge =
    selectedShipping?.charge || 0;

  // ============================================================
  // ORDER SUMMARY VALUES
  // ============================================================

  /*
    The backend cart API may already provide orderSummary.

    However, shipping depends on the shipping method selected
    on this page, so we calculate the currently selected
    shipping charge here.

    The final order itself is still calculated securely
    by the backend when Place Order is clicked.
  */

  const discount =
    Number(orderSummary?.discount) || 0;

  const tax =
    Number(orderSummary?.tax) || 10;

  const shippingCharge =
    selectedShippingCharge;

  const total =
    subtotal -
    discount +
    shippingCharge +
    tax;

  // ============================================================
  // INPUT CLASS
  // ============================================================

  const inputClass =
    "w-full border-b border-[#C4C7C7] py-4 bg-transparent font-['Inter'] text-[15px] text-black placeholder:text-[#5D5E63] focus:outline-none focus:border-black transition-colors";

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full bg-[#F9F9F9] font-['Inter']">

      <div className="max-w-[1200px] mx-auto px-5 py-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

        {/* ====================================================
            LEFT COLUMN
        ==================================================== */}

        <form
          onSubmit={formik.handleSubmit}
          noValidate
        >

          {/* ================= SHIPPING ADDRESS ================= */}

          <section>

            <h2 className="font-['Libre_Caslon_Text'] text-[32px] font-normal text-black mb-8">
              Shipping Address
            </h2>

            <div className="flex flex-col gap-6">

              {/* FIRST NAME / LAST NAME */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div>

                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    className={inputClass}
                    value={
                      formik.values.firstName
                    }
                    onChange={
                      formik.handleChange
                    }
                    onBlur={
                      formik.handleBlur
                    }
                  />

                  {formik.touched.firstName &&
                    formik.errors.firstName && (
                      <p className="text-red-600 text-xs mt-1">
                        {
                          formik.errors.firstName
                        }
                      </p>
                    )}

                </div>

                <div>

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    className={inputClass}
                    value={
                      formik.values.lastName
                    }
                    onChange={
                      formik.handleChange
                    }
                    onBlur={
                      formik.handleBlur
                    }
                  />

                  {formik.touched.lastName &&
                    formik.errors.lastName && (
                      <p className="text-red-600 text-xs mt-1">
                        {
                          formik.errors.lastName
                        }
                      </p>
                    )}

                </div>

              </div>

              {/* ADDRESS */}

              <div>

                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className={inputClass}
                  value={
                    formik.values.address
                  }
                  onChange={
                    formik.handleChange
                  }
                  onBlur={
                    formik.handleBlur
                  }
                />

                {formik.touched.address &&
                  formik.errors.address && (
                    <p className="text-red-600 text-xs mt-1">
                      {
                        formik.errors.address
                      }
                    </p>
                  )}

              </div>

              {/* CITY / STATE */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div>

                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className={inputClass}
                    value={
                      formik.values.city
                    }
                    onChange={
                      formik.handleChange
                    }
                    onBlur={
                      formik.handleBlur
                    }
                  />

                  {formik.touched.city &&
                    formik.errors.city && (
                      <p className="text-red-600 text-xs mt-1">
                        {
                          formik.errors.city
                        }
                      </p>
                    )}

                </div>

                <div>

                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    className={inputClass}
                    value={
                      formik.values.state
                    }
                    onChange={
                      formik.handleChange
                    }
                    onBlur={
                      formik.handleBlur
                    }
                  />

                  {formik.touched.state &&
                    formik.errors.state && (
                      <p className="text-red-600 text-xs mt-1">
                        {
                          formik.errors.state
                        }
                      </p>
                    )}

                </div>

              </div>

              {/* PINCODE */}

              <div>

                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  className={inputClass}
                  value={
                    formik.values.pincode
                  }
                  onChange={
                    formik.handleChange
                  }
                  onBlur={
                    formik.handleBlur
                  }
                />

                {formik.touched.pincode &&
                  formik.errors.pincode && (
                    <p className="text-red-600 text-xs mt-1">
                      {
                        formik.errors.pincode
                      }
                    </p>
                  )}

              </div>

              {/* PHONE */}

              <div>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone No"
                  className={inputClass}
                  value={
                    formik.values.phone
                  }
                  onChange={
                    formik.handleChange
                  }
                  onBlur={
                    formik.handleBlur
                  }
                />

                {formik.touched.phone &&
                  formik.errors.phone && (
                    <p className="text-red-600 text-xs mt-1">
                      {
                        formik.errors.phone
                      }
                    </p>
                  )}

              </div>

            </div>

          </section>

          {/* ================= SHIPPING METHOD ================= */}

          <section className="mt-8">

            <h2 className="font-['Libre_Caslon_Text'] text-2xl font-normal text-black mb-4">
              Shipping Method
            </h2>

            <div className="flex flex-col gap-3">

              {SHIPPING_METHODS.map(
                (method) => (

                  <label
                    key={method.value}
                    className={`flex items-center justify-between bg-white border p-4 cursor-pointer transition-colors ${
                      formik.values.shippingMethod ===
                      method.value
                        ? "border-black"
                        : "border-[#E2E2E2]"
                    }`}
                  >

                    <span className="flex items-center gap-3">

                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.value}
                        checked={
                          formik.values.shippingMethod ===
                          method.value
                        }
                        onChange={
                          formik.handleChange
                        }
                        className="accent-black"
                      />

                      <span>

                        <span className="block text-sm text-black">
                          {method.label}
                        </span>

                        <span className="block text-xs text-[#5D5E63]">
                          {method.detail}
                        </span>

                      </span>

                    </span>

                    <span className="text-sm text-black">
                      ₹{method.charge.toFixed(2)}
                    </span>

                  </label>
                )
              )}

            </div>

          </section>

          {/* ================= PAYMENT ================= */}

          <section className="mt-8">

            <h2 className="font-['Libre_Caslon_Text'] text-2xl font-normal text-black mb-4">
              Payment
            </h2>

            <div className="flex flex-col gap-3">

              {PAYMENT_METHODS.map(
                (method) => (

                  <label
                    key={method.value}
                    className={`flex items-center gap-3 bg-white border p-4 cursor-pointer ${
                      formik.values.paymentMethod ===
                      method.value
                        ? "border-black"
                        : "border-[#E2E2E2]"
                    }`}
                  >

                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={
                        formik.values.paymentMethod ===
                        method.value
                      }
                      onChange={
                        formik.handleChange
                      }
                      className="accent-black"
                    />

                    <span className="text-sm text-black">
                      {method.label}
                    </span>

                  </label>
                )
              )}

            </div>

          </section>

          {/* ================= ERROR ================= */}

          {submitError && (
            <p className="text-red-600 text-sm mt-6">
              {submitError}
            </p>
          )}

          {/* ================= PLACE ORDER ================= */}

          <button
            type="submit"
            disabled={
              formik.isSubmitting ||
              cartLoading ||
              cartItems.length === 0
            }
            className="mt-8 bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {formik.isSubmitting
              ? "Opening Payment..."
              : cartLoading
              ? "Loading Cart..."
              : "Place Order"}
          </button>

        </form>

        {/* ====================================================
            RIGHT COLUMN
        ==================================================== */}

        <aside className="h-fit lg:sticky lg:top-8">

          <h2 className="font-['Libre_Caslon_Text'] text-2xl font-normal text-black mb-6">
            Order Summary
          </h2>

          {/* ================= CART ITEMS ================= */}

          <div className="flex flex-col gap-4 mb-6">

            {cartLoading ? (

              <p className="text-sm text-[#5D5E63]">
                Loading cart...
              </p>

            ) : cartItems.length === 0 ? (

              <p className="text-sm text-[#5D5E63]">
                Your cart is empty.
              </p>

            ) : (

              cartItems.map((item) => (

                <div
                  key={item.product?._id}
                  className="flex gap-4 items-center"
                >

                  <img
                    src={item.product?.mainImage}
                    alt={item.product?.modelName}
                    className="w-16 h-16 object-cover bg-white"
                  />

                  <div className="flex-1">

                    <p className="text-sm text-black">
                      {item.product?.modelName}
                    </p>

                    <p className="text-xs text-[#5D5E63]">
                      Qty: {item.quantity}
                    </p>

                  </div>

                  <p className="text-sm text-black">
                    ₹
                    {(
                      (item.product?.price || 0) *
                      (item.quantity || 1)
                    ).toFixed(2)}
                  </p>

                </div>

              ))

            )}

          </div>

          {/* ================= ORDER CALCULATION ================= */}

          <div className="flex flex-col gap-3 font-['Inter'] text-base">

            {/* SUBTOTAL */}

            <div className="flex justify-between text-[#5D5E63]">

              <span>
                Subtotal
              </span>

              <span>
                ₹{subtotal.toFixed(2)}
              </span>

            </div>

            {/* SUBSCRIPTION DISCOUNT */}

            <div className="flex justify-between text-[#5D5E63]">

              <span>
                Subscription Discount
              </span>

              <span className="text-green-600">
                {discount > 0
                  ? `-₹${discount.toFixed(2)}`
                  : "₹0.00"}
              </span>

            </div>

            {/* SHIPPING */}

            <div className="flex justify-between text-[#5D5E63]">

              <span>
                Shipping Charge
              </span>

              <span>
                ₹{shippingCharge.toFixed(2)}
              </span>

            </div>

            {/* TAX */}

            <div className="flex justify-between text-[#5D5E63]">

              <span>
                Tax
              </span>

              <span>
                ₹{tax.toFixed(2)}
              </span>

            </div>

            {/* TOTAL */}

            <div className="flex justify-between font-bold text-black border-t border-[#E2E2E2] pt-4">

              <span>
                Total
              </span>

              <span>
                ₹{total.toFixed(2)}
              </span>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}