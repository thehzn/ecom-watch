// import React, { useEffect, useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { useApi } from "../hooks/useApi";
// import { setAddresses } from "../redux/addressSlice";

// // Validation
// const shippingSchema = Yup.object({
//   firstName: Yup.string().trim().required("First name is required"),
//   lastName: Yup.string().trim().required("Last name is required"),
//   address: Yup.string().trim().required("Address is required"),
//   city: Yup.string().trim().required("City is required"),
//   state: Yup.string().trim().required("State is required"),
//   pincode: Yup.string()
//     .trim()
//     .matches(/^\d{4,6}$/, "Enter a valid pincode")
//     .required("Pincode is required"),
//   phone: Yup.string()
//     .trim()
//     .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
//     .required("Phone number is required"),
//   shippingMethod: Yup.string().required("Shipping method is required"),
//   paymentMethod: Yup.string().required("Payment method is required"),
// });

// // Shipping methods
// // These values now match the backend
// const SHIPPING_METHODS = [
//   {
//     value: "Standard",
//     label: "Standard Delivery",
//     detail: "5-7 business days",
//     charge: 100,
//   },
//   {
//     value: "Express",
//     label: "Express Delivery",
//     detail: "2-3 business days",
//     charge: 500,
//   },
//   {
//     value: "White Glove",
//     label: "White Glove Delivery",
//     detail: "White-glove in-home setup",
//     charge: 1000,
//   },
// ];

// // Payment methods
// const PAYMENT_METHODS = [
//   {
//     value: "Razorpay",
//     label: "Razorpay",
//   },
// ];

// const EMPTY_SHIPPING_FIELDS = {
//   firstName: "",
//   lastName: "",
//   address: "",
//   city: "",
//   state: "",
//   pincode: "",
//   phone: "",
// };

// export default function Checkout() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { request, get } = useApi();

//   const [cartItems, setCartItems] = useState([]);
//   const [cartLoading, setCartLoading] = useState(true);
//   const [submitError, setSubmitError] = useState("");

//   // Backend order summary
//   const [orderSummary, setOrderSummary] = useState(null);

//   // Saved addresses
//   const addresses = useSelector((state) => state.address.items);
//   const [addressesLoading, setAddressesLoading] = useState(true);
//   // 'new' or an address _id
//   const [selectedAddressId, setSelectedAddressId] = useState("new");

//   // ============================================================
//   // LOAD CART FROM BACKEND
//   // ============================================================

//   useEffect(() => {
//     loadCart();
//     loadAddresses();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadCart = async () => {
//     try {
//       setCartLoading(true);

//       const res = await get("/apicarts/getcartitems", { allowNotFound: true });

//       console.log("Checkout cart response:", res);

//       setCartItems(res?.cart?.items ?? []);

//       // Save backend order summary
//       setOrderSummary(res?.orderSummary ?? null);

//       console.log("Checkout order summary:", res?.orderSummary);
//     } catch (error) {
//       console.error("Checkout cart error:", error);

//       setCartItems([]);
//       setOrderSummary(null);
//     } finally {
//       setCartLoading(false);
//     }
//   };

//   // ============================================================
//   // LOAD SAVED ADDRESSES FROM BACKEND
//   // ============================================================

//   const loadAddresses = async () => {
//     setAddressesLoading(true);
//     try {
//       const res = await get("/apiuser/user/getaddress");
//       const list = res?.addresses || [];
//       dispatch(setAddresses(list));

//       // Pre-select the default address (or the first one) so returning
//       // customers don't have to re-type an address they already saved.
//       const defaultAddr = list.find((a) => a.isDefault) || list[0];
//       if (defaultAddr) {
//         setSelectedAddressId(defaultAddr._id);
//         formik.setValues((prev) => ({
//           ...prev,
//           firstName: defaultAddr.firstName,
//           lastName: defaultAddr.lastName,
//           address: defaultAddr.address,
//           city: defaultAddr.city,
//           state: defaultAddr.state,
//           pincode: defaultAddr.pincode,
//           phone: defaultAddr.phone,
//         }));
//       }
//     } catch (error) {
//       console.error("Checkout addresses error:", error);
//       dispatch(setAddresses([]));
//     } finally {
//       setAddressesLoading(false);
//     }
//   };

//   // ============================================================
//   // SUBTOTAL
//   // ============================================================

//   const calculatedSubtotal = cartItems.reduce(
//     (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
//     0
//   );

//   // Use backend subtotal if available
//   const subtotal = Number(orderSummary?.subtotal) || calculatedSubtotal;

//   // ============================================================
//   // FORMIK
//   // ============================================================

//   const formik = useFormik({
//     initialValues: {
//       ...EMPTY_SHIPPING_FIELDS,
//       shippingMethod: "Standard",
//       paymentMethod: "Razorpay",
//     },

//     validationSchema: shippingSchema,

//     onSubmit: async (values, { setSubmitting }) => {
//       setSubmitError("");

//       try {
//         console.log("========== CHECKOUT SUBMITTED ==========");
//         console.log("Checkout values:", values);
//         console.log("Cart items:", cartItems);

//         // ======================================================
//         // 1. CREATE ORDER
//         // ======================================================

//         const res = await request("/apiorders/ordercreate", {
//           method: "POST",

//           body: JSON.stringify({
//             shippingMethod: values.shippingMethod,

//             shippingAddress: {
//               firstName: values.firstName,
//               lastName: values.lastName,
//               address: values.address,
//               city: values.city,
//               state: values.state,
//               pincode: values.pincode,
//               phone: values.phone,
//             },
//           }),
//         });

//         console.log("========== CREATE ORDER RESPONSE ==========");
//         console.log("Create order response:", res);

//         if (!res?.status) {
//           throw new Error(res?.message || "Unable to create order");
//         }

//         const { order, razorpayOrder, razorpayKey, discount } = res;

//         console.log("MongoDB Order:", order);
//         console.log("Razorpay Order:", razorpayOrder);
//         console.log("Razorpay Key:", razorpayKey);
//         console.log("Subscription Discount:", discount);

//         // ======================================================
//         // 2. CHECK RAZORPAY SDK
//         // ======================================================

//         if (!window.Razorpay) {
//           throw new Error("Razorpay SDK is not loaded. Please check index.html.");
//         }

//         if (!razorpayOrder?.id) {
//           throw new Error("Razorpay order was not created.");
//         }

//         if (!razorpayKey) {
//           throw new Error("Razorpay key is missing.");
//         }

//         // ======================================================
//         // 3. RAZORPAY OPTIONS
//         // ======================================================

//         const options = {
//           key: razorpayKey,

//           // Backend sends the discounted final amount
//           amount: razorpayOrder.amount,

//           currency: razorpayOrder.currency,

//           name: "CHRONOS",

//           description: "Luxury Watch Purchase",

//           order_id: razorpayOrder.id,

//           // ====================================================
//           // PAYMENT SUCCESS
//           // ====================================================

//           handler: async function (paymentResponse) {
//             try {
//               setSubmitError("");

//               console.log("Payment response:", paymentResponse);

//               // ==================================================
//               // 4. VERIFY PAYMENT
//               // ==================================================

//               const verifyRes = await request("/apiorders/verifypayment", {
//                 method: "POST",

//                 body: JSON.stringify({
//                   razorpay_order_id: paymentResponse.razorpay_order_id,

//                   razorpay_payment_id: paymentResponse.razorpay_payment_id,

//                   razorpay_signature: paymentResponse.razorpay_signature,
//                 }),
//               });

//               console.log("Payment verification response:", verifyRes);

//               if (!verifyRes?.status) {
//                 throw new Error(verifyRes?.message || "Payment verification failed");
//               }

//               // ==================================================
//               // 5. ORDER CONFIRMED
//               // ==================================================

//               navigate("/order-confirmed", {
//                 state: {
//                   order: verifyRes.order,
//                 },
//               });
//             } catch (error) {
//               console.error("Payment verification error:", error);

//               setSubmitError(error?.message || "Payment verification failed.");
//             }
//           },

//           // ====================================================
//           // CUSTOMER DETAILS
//           // ====================================================

//           prefill: {
//             name: `${values.firstName} ${values.lastName}`,
//             contact: values.phone,
//           },

//           notes: {
//             shippingMethod: values.shippingMethod,
//           },

//           theme: {
//             color: "#000000",
//           },

//           // ====================================================
//           // POPUP CLOSED
//           // ====================================================

//           modal: {
//             ondismiss: function () {
//               setSubmitError("Payment was cancelled. Your order is still pending.");
//             },
//           },
//         };

//         // ======================================================
//         // 6. CREATE RAZORPAY INSTANCE
//         // ======================================================

//         const razorpay = new window.Razorpay(options);

//         // ======================================================
//         // 7. PAYMENT FAILED
//         // ======================================================

//         razorpay.on("payment.failed", function (response) {
//           console.error("Payment failed:", response);

//           setSubmitError(response?.error?.description || "Payment failed. Please try again.");
//         });

//         // ======================================================
//         // 8. OPEN RAZORPAY
//         // ======================================================

//         console.log("Opening Razorpay...");

//         razorpay.open();
//       } catch (error) {
//         console.error("Create order error:", error);

//         setSubmitError(error?.message || "Could not create order. Please try again.");
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   // Selecting a saved address prefills the form (and locks it); selecting
//   // "new" clears the fields and unlocks them for manual one-off entry.
//   const isUsingSavedAddress = selectedAddressId !== "new";

//   const handleSelectAddress = (addressId) => {
//     setSelectedAddressId(addressId);

//     if (addressId === "new") {
//       formik.setValues((prev) => ({ ...prev, ...EMPTY_SHIPPING_FIELDS }));
//       return;
//     }

//     const addr = addresses.find((a) => a._id === addressId);
//     if (!addr) return;

//     formik.setValues((prev) => ({
//       ...prev,
//       firstName: addr.firstName,
//       lastName: addr.lastName,
//       address: addr.address,
//       city: addr.city,
//       state: addr.state,
//       pincode: addr.pincode,
//       phone: addr.phone,
//     }));
//   };

//   // ============================================================
//   // SELECTED SHIPPING
//   // ============================================================

//   const selectedShipping = SHIPPING_METHODS.find(
//     (method) => method.value === formik.values.shippingMethod
//   );

//   const selectedShippingCharge = selectedShipping?.charge || 0;

//   // ============================================================
//   // ORDER SUMMARY VALUES
//   // ============================================================

//   /*
//     The backend cart API may already provide orderSummary.

//     However, shipping depends on the shipping method selected
//     on this page, so we calculate the currently selected
//     shipping charge here.

//     The final order itself is still calculated securely
//     by the backend when Place Order is clicked.
//   */

//   const discount = Number(orderSummary?.discount) || 0;

//   const tax = Number(orderSummary?.tax) || 10;

//   const shippingCharge = selectedShippingCharge;

//   const total = subtotal - discount + shippingCharge + tax;

//   // ============================================================
//   // INPUT CLASS
//   // ============================================================

//   const inputClass =
//     "w-full border-b border-[#C4C7C7] py-4 bg-transparent font-['Inter'] text-[15px] text-black placeholder:text-[#5D5E63] focus:outline-none focus:border-black transition-colors";

//   const lockedInputClass = "cursor-not-allowed opacity-70";

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="w-full bg-[#F9F9F9] font-['Inter']">
//       <div className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 sm:gap-8">
//         {/* ====================================================
//             LEFT COLUMN
//         ==================================================== */}

//         <form onSubmit={formik.handleSubmit} noValidate>
//           {/* ================= SHIPPING ADDRESS ================= */}

//           <section>
//             <h2 className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl md:text-[32px] font-normal text-black mb-5 sm:mb-8">
//               Shipping Address
//             </h2>

//             {/* ===== Saved address picker ===== */}

//             {addressesLoading && (
//               <p className="text-sm text-[#5D5E63] mb-6">Loading your saved addresses…</p>
//             )}

//             {!addressesLoading && addresses.length > 0 && (
//               <div className="flex flex-col gap-3 mb-8">
//                 {addresses.map((addr) => (
//                   <label
//                     key={addr._id}
//                     className={`flex items-start gap-3 bg-white border p-3.5 sm:p-4 cursor-pointer transition-colors ${
//                       selectedAddressId === addr._id ? "border-black" : "border-[#E2E2E2]"
//                     }`}
//                   >
//                     <input
//                       type="radio"
//                       name="savedAddress"
//                       checked={selectedAddressId === addr._id}
//                       onChange={() => handleSelectAddress(addr._id)}
//                       className="accent-black mt-1 shrink-0"
//                     />
//                     <span className="flex-1 min-w-0">
//                       <span className="flex flex-wrap items-center gap-2">
//                         <span className="text-sm font-semibold text-black break-words">
//                           {addr.firstName} {addr.lastName}
//                         </span>
//                         {addr.isDefault && (
//                           <span className="shrink-0 text-[10px] uppercase tracking-wide font-semibold bg-black text-white px-2 py-0.5">
//                             Default
//                           </span>
//                         )}
//                       </span>
//                       <span className="block text-sm text-[#5D5E63] mt-1 break-words">
//                         {addr.address}, {addr.city}, {addr.state} — {addr.pincode}
//                       </span>
//                       <span className="block text-sm text-[#5D5E63]">{addr.phone}</span>
//                     </span>
//                   </label>
//                 ))}

//                 <label
//                   className={`flex items-center gap-3 bg-white border p-3.5 sm:p-4 cursor-pointer transition-colors ${
//                     selectedAddressId === "new" ? "border-black" : "border-[#E2E2E2]"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="savedAddress"
//                     checked={selectedAddressId === "new"}
//                     onChange={() => handleSelectAddress("new")}
//                     className="accent-black"
//                   />
//                   <span className="text-sm font-semibold text-black">
//                     Use a different address
//                   </span>
//                 </label>
//               </div>
//             )}

//             {/* ===== Manual entry fields — locked while a saved address is
//                 selected; unlocked only for a fresh one-off address ===== */}

//             <div className="flex flex-col gap-6">
//               {/* FIRST NAME / LAST NAME */}

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <input
//                     type="text"
//                     name="firstName"
//                     placeholder="First Name"
//                     readOnly={isUsingSavedAddress}
//                     disabled={isUsingSavedAddress}
//                     className={`${inputClass} ${isUsingSavedAddress ? lockedInputClass : ""}`}
//                     value={formik.values.firstName}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                   />
//                   {formik.touched.firstName && formik.errors.firstName && (
//                     <p className="text-red-600 text-xs mt-1">{formik.errors.firstName}</p>
//                   )}
//                 </div>

//                 <div>
//                   <input
//                     type="text"
//                     name="lastName"
//                     placeholder="Last Name"
//                     readOnly={isUsingSavedAddress}
//                     disabled={isUsingSavedAddress}
//                     className={`${inputClass} ${isUsingSavedAddress ? lockedInputClass : ""}`}
//                     value={formik.values.lastName}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                   />
//                   {formik.touched.lastName && formik.errors.lastName && (
//                     <p className="text-red-600 text-xs mt-1">{formik.errors.lastName}</p>
//                   )}
//                 </div>
//               </div>

//               {/* ADDRESS */}

//               <div>
//                 <input
//                   type="text"
//                   name="address"
//                   placeholder="Address"
//                   readOnly={isUsingSavedAddress}
//                   disabled={isUsingSavedAddress}
//                   className={`${inputClass} ${isUsingSavedAddress ? lockedInputClass : ""}`}
//                   value={formik.values.address}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                 />
//                 {formik.touched.address && formik.errors.address && (
//                   <p className="text-red-600 text-xs mt-1">{formik.errors.address}</p>
//                 )}
//               </div>

//               {/* CITY / STATE */}

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <input
//                     type="text"
//                     name="city"
//                     placeholder="City"
//                     readOnly={isUsingSavedAddress}
//                     disabled={isUsingSavedAddress}
//                     className={`${inputClass} ${isUsingSavedAddress ? lockedInputClass : ""}`}
//                     value={formik.values.city}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                   />
//                   {formik.touched.city && formik.errors.city && (
//                     <p className="text-red-600 text-xs mt-1">{formik.errors.city}</p>
//                   )}
//                 </div>

//                 <div>
//                   <input
//                     type="text"
//                     name="state"
//                     placeholder="State"
//                     readOnly={isUsingSavedAddress}
//                     disabled={isUsingSavedAddress}
//                     className={`${inputClass} ${isUsingSavedAddress ? lockedInputClass : ""}`}
//                     value={formik.values.state}
//                     onChange={formik.handleChange}
//                     onBlur={formik.handleBlur}
//                   />
//                   {formik.touched.state && formik.errors.state && (
//                     <p className="text-red-600 text-xs mt-1">{formik.errors.state}</p>
//                   )}
//                 </div>
//               </div>

//               {/* PINCODE */}

//               <div>
//                 <input
//                   type="text"
//                   name="pincode"
//                   placeholder="Pincode"
//                   readOnly={isUsingSavedAddress}
//                   disabled={isUsingSavedAddress}
//                   className={`${inputClass} ${isUsingSavedAddress ? lockedInputClass : ""}`}
//                   value={formik.values.pincode}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                 />
//                 {formik.touched.pincode && formik.errors.pincode && (
//                   <p className="text-red-600 text-xs mt-1">{formik.errors.pincode}</p>
//                 )}
//               </div>

//               {/* PHONE */}

//               <div>
//                 <input
//                   type="tel"
//                   name="phone"
//                   placeholder="Phone No"
//                   readOnly={isUsingSavedAddress}
//                   disabled={isUsingSavedAddress}
//                   className={`${inputClass} ${isUsingSavedAddress ? lockedInputClass : ""}`}
//                   value={formik.values.phone}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                 />
//                 {formik.touched.phone && formik.errors.phone && (
//                   <p className="text-red-600 text-xs mt-1">{formik.errors.phone}</p>
//                 )}
//               </div>

//               {isUsingSavedAddress && (
//                 <p className="text-xs text-[#5D5E63]">
//                   This address is locked to your saved details. Choose "Use a different
//                   address" above to enter a new one, or edit it permanently from your
//                   account page.
//                 </p>
//               )}
//             </div>
//           </section>

//           {/* ================= SHIPPING METHOD ================= */}

//           <section className="mt-8">
//             <h2 className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal text-black mb-4">
//               Shipping Method
//             </h2>

//             <div className="flex flex-col gap-3">
//               {SHIPPING_METHODS.map((method) => (
//                 <label
//                   key={method.value}
//                   className={`flex flex-wrap items-center justify-between gap-2 bg-white border p-3.5 sm:p-4 cursor-pointer transition-colors ${
//                     formik.values.shippingMethod === method.value
//                       ? "border-black"
//                       : "border-[#E2E2E2]"
//                   }`}
//                 >
//                   <span className="flex items-center gap-3 min-w-0">
//                     <input
//                       type="radio"
//                       name="shippingMethod"
//                       value={method.value}
//                       checked={formik.values.shippingMethod === method.value}
//                       onChange={formik.handleChange}
//                       className="accent-black shrink-0"
//                     />

//                     <span className="min-w-0">
//                       <span className="block text-sm text-black">{method.label}</span>

//                       <span className="block text-xs text-[#5D5E63]">{method.detail}</span>
//                     </span>
//                   </span>

//                   <span className="shrink-0 text-sm text-black">
//                     ₹{method.charge.toFixed(2)}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </section>

//           {/* ================= PAYMENT ================= */}

//           <section className="mt-8">
//             <h2 className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal text-black mb-4">
//               Payment
//             </h2>

//             <div className="flex flex-col gap-3">
//               {PAYMENT_METHODS.map((method) => (
//                 <label
//                   key={method.value}
//                   className={`flex items-center gap-3 bg-white border p-3.5 sm:p-4 cursor-pointer ${
//                     formik.values.paymentMethod === method.value
//                       ? "border-black"
//                       : "border-[#E2E2E2]"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     name="paymentMethod"
//                     value={method.value}
//                     checked={formik.values.paymentMethod === method.value}
//                     onChange={formik.handleChange}
//                     className="accent-black shrink-0"
//                   />

//                   <span className="text-sm text-black">{method.label}</span>
//                 </label>
//               ))}
//             </div>
//           </section>

//           {/* ================= ERROR ================= */}

//           {submitError && <p className="text-red-600 text-sm mt-6">{submitError}</p>}

//           {/* ================= PLACE ORDER ================= */}

//           <button
//             type="submit"
//             disabled={formik.isSubmitting || cartLoading || cartItems.length === 0}
//             className="mt-8 w-full sm:w-auto bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
//           >
//             {formik.isSubmitting
//               ? "Opening Payment..."
//               : cartLoading
//               ? "Loading Cart..."
//               : "Place Order"}
//           </button>
//         </form>

//         {/* ====================================================
//             RIGHT COLUMN
//         ==================================================== */}

//         <aside className="h-fit lg:sticky lg:top-8">
//           <h2 className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal text-black mb-5 sm:mb-6">
//             Order Summary
//           </h2>

//           {/* ================= CART ITEMS ================= */}

//           <div className="flex flex-col gap-4 mb-6">
//             {cartLoading ? (
//               <p className="text-sm text-[#5D5E63]">Loading cart...</p>
//             ) : cartItems.length === 0 ? (
//               <p className="text-sm text-[#5D5E63]">Your cart is empty.</p>
//             ) : (
//               cartItems.map((item) => (
//                 <div key={item.product?._id} className="flex gap-3 sm:gap-4 items-center">
//                   <img
//                     src={item.product?.mainImage}
//                     alt={item.product?.modelName}
//                     className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 object-cover bg-white"
//                   />

//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm text-black truncate">{item.product?.modelName}</p>

//                     <p className="text-xs text-[#5D5E63]">Qty: {item.quantity}</p>
//                   </div>

//                   <p className="shrink-0 text-sm text-black">
//                     ₹{((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
//                   </p>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* ================= ORDER CALCULATION ================= */}

//           <div className="flex flex-col gap-3 font-['Inter'] text-base">
//             {/* SUBTOTAL */}

//             <div className="flex justify-between text-[#5D5E63]">
//               <span>Subtotal</span>

//               <span>₹{subtotal.toFixed(2)}</span>
//             </div>

//             {/* SUBSCRIPTION DISCOUNT */}

//             <div className="flex justify-between text-[#5D5E63]">
//               <span>Subscription Discount</span>

//               <span className="text-green-600">
//                 {discount > 0 ? `-₹${discount.toFixed(2)}` : "₹0.00"}
//               </span>
//             </div>

//             {/* SHIPPING */}

//             <div className="flex justify-between text-[#5D5E63]">
//               <span>Shipping Charge</span>

//               <span>₹{shippingCharge.toFixed(2)}</span>
//             </div>

//             {/* TAX */}

//             <div className="flex justify-between text-[#5D5E63]">
//               <span>Tax</span>

//               <span>₹{tax.toFixed(2)}</span>
//             </div>

//             {/* TOTAL */}

//             <div className="flex justify-between font-bold text-black border-t border-[#E2E2E2] pt-4">
//               <span>Total</span>

//               <span>₹{total.toFixed(2)}</span>
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useApi } from "../hooks/useApi";
import { setAddresses } from "../redux/addressSlice";

// Validation
const shippingSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  address: Yup.string().trim().required("Address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State is required"),
  pincode: Yup.string()
    .trim()
    .matches(/^\d{4,6}$/, "Enter a valid pincode")
    .required("Pincode is required"),
  phone: Yup.string()
    .trim()
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
    .required("Phone number is required"),
  shippingMethod: Yup.string().required("Shipping method is required"),
  paymentMethod: Yup.string().required("Payment method is required"),

  // ================= PRIVACY CONSENT =================
  privacyConsent: Yup.boolean()
    .oneOf([true], "You must agree to the Privacy Policy")
    .required("You must agree to the Privacy Policy"),
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

const EMPTY_SHIPPING_FIELDS = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { request, get } = useApi();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");

  // Backend order summary
  const [orderSummary, setOrderSummary] = useState(null);

  // Saved addresses
  const addresses = useSelector((state) => state.address.items);
  const [addressesLoading, setAddressesLoading] = useState(true);
  // 'new' or an address _id
  const [selectedAddressId, setSelectedAddressId] = useState("new");

  // ============================================================
  // LOAD CART FROM BACKEND
  // ============================================================

  useEffect(() => {
    loadCart();
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCart = async () => {
    try {
      setCartLoading(true);

      const res = await get("/apicarts/getcartitems", { allowNotFound: true });

      console.log("Checkout cart response:", res);

      setCartItems(res?.cart?.items ?? []);

      // Save backend order summary
      setOrderSummary(res?.orderSummary ?? null);

      console.log("Checkout order summary:", res?.orderSummary);
    } catch (error) {
      console.error("Checkout cart error:", error);

      setCartItems([]);
      setOrderSummary(null);
    } finally {
      setCartLoading(false);
    }
  };

  // ============================================================
  // LOAD SAVED ADDRESSES FROM BACKEND
  // ============================================================

  const loadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await get("/apiuser/user/getaddress");
      const list = res?.addresses || [];
      dispatch(setAddresses(list));

      // Pre-select the default address (or the first one) so returning
      // customers don't have to re-type an address they already saved.
      const defaultAddr = list.find((a) => a.isDefault) || list[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        formik.setValues((prev) => ({
          ...prev,
          firstName: defaultAddr.firstName,
          lastName: defaultAddr.lastName,
          address: defaultAddr.address,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
          phone: defaultAddr.phone,
        }));
      }
    } catch (error) {
      console.error("Checkout addresses error:", error);
      dispatch(setAddresses([]));
    } finally {
      setAddressesLoading(false);
    }
  };

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const calculatedSubtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
    0
  );

  // Use backend subtotal if available
  const subtotal = Number(orderSummary?.subtotal) || calculatedSubtotal;

  // ============================================================
  // FORMIK
  // ============================================================

  const formik = useFormik({
    initialValues: {
      ...EMPTY_SHIPPING_FIELDS,
      shippingMethod: "Standard",
      paymentMethod: "Razorpay",

      // ================= PRIVACY CONSENT =================
      privacyConsent: false,
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

        const res = await request("/apiorders/ordercreate", {
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
        });

        console.log("========== CREATE ORDER RESPONSE ==========");
        console.log("Create order response:", res);

        if (!res?.status) {
          throw new Error(res?.message || "Unable to create order");
        }

        const { order, razorpayOrder, razorpayKey, discount } = res;

        console.log("MongoDB Order:", order);
        console.log("Razorpay Order:", razorpayOrder);
        console.log("Razorpay Key:", razorpayKey);
        console.log("Subscription Discount:", discount);

        // ======================================================
        // 2. CHECK RAZORPAY SDK
        // ======================================================

        if (!window.Razorpay) {
          throw new Error("Razorpay SDK is not loaded. Please check index.html.");
        }

        if (!razorpayOrder?.id) {
          throw new Error("Razorpay order was not created.");
        }

        if (!razorpayKey) {
          throw new Error("Razorpay key is missing.");
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

              console.log("Payment response:", paymentResponse);

              // ==================================================
              // 4. VERIFY PAYMENT
              // ==================================================

              const verifyRes = await request("/apiorders/verifypayment", {
                method: "POST",

                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,

                  razorpay_payment_id: paymentResponse.razorpay_payment_id,

                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              });

              console.log("Payment verification response:", verifyRes);

              if (!verifyRes?.status) {
                throw new Error(
                  verifyRes?.message || "Payment verification failed"
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
              console.error("Payment verification error:", error);

              setSubmitError(
                error?.message || "Payment verification failed."
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
            shippingMethod: values.shippingMethod,
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

        const razorpay = new window.Razorpay(options);

        // ======================================================
        // 7. PAYMENT FAILED
        // ======================================================

        razorpay.on("payment.failed", function (response) {
          console.error("Payment failed:", response);

          setSubmitError(
            response?.error?.description ||
              "Payment failed. Please try again."
          );
        });

        // ======================================================
        // 8. OPEN RAZORPAY
        // ======================================================

        console.log("Opening Razorpay...");

        razorpay.open();
      } catch (error) {
        console.error("Create order error:", error);

        setSubmitError(
          error?.message || "Could not create order. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Selecting a saved address prefills the form (and locks it); selecting
  // "new" clears the fields and unlocks them for manual one-off entry.
  const isUsingSavedAddress = selectedAddressId !== "new";

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);

    if (addressId === "new") {
      formik.setValues((prev) => ({ ...prev, ...EMPTY_SHIPPING_FIELDS }));
      return;
    }

    const addr = addresses.find((a) => a._id === addressId);
    if (!addr) return;

    formik.setValues((prev) => ({
      ...prev,
      firstName: addr.firstName,
      lastName: addr.lastName,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
    }));
  };

  // ============================================================
  // SELECTED SHIPPING
  // ============================================================

  const selectedShipping = SHIPPING_METHODS.find(
    (method) => method.value === formik.values.shippingMethod
  );

  const selectedShippingCharge = selectedShipping?.charge || 0;

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

  const discount = Number(orderSummary?.discount) || 0;

  const tax = Number(orderSummary?.tax) || 10;

  const shippingCharge = selectedShippingCharge;

  const total = subtotal - discount + shippingCharge + tax;

  // ============================================================
  // INPUT CLASS
  // ============================================================

  const inputClass =
    "w-full border-b border-[#C4C7C7] py-4 bg-transparent font-['Inter'] text-[15px] text-black placeholder:text-[#5D5E63] focus:outline-none focus:border-black transition-colors";

  const lockedInputClass = "cursor-not-allowed opacity-70";

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full bg-[#F9F9F9] font-['Inter']">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 sm:gap-8">
        {/* ====================================================
            LEFT COLUMN
        ==================================================== */}

        <form onSubmit={formik.handleSubmit} noValidate>
          {/* ================= SHIPPING ADDRESS ================= */}

          <section>
            <h2 className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl md:text-[32px] font-normal text-black mb-5 sm:mb-8">
              Shipping Address
            </h2>

            {/* ===== Saved address picker ===== */}

            {addressesLoading && (
              <p className="text-sm text-[#5D5E63] mb-6">
                Loading your saved addresses…
              </p>
            )}

            {!addressesLoading && addresses.length > 0 && (
              <div className="flex flex-col gap-3 mb-8">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 bg-white border p-3.5 sm:p-4 cursor-pointer transition-colors ${
                      selectedAddressId === addr._id
                        ? "border-black"
                        : "border-[#E2E2E2]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === addr._id}
                      onChange={() => handleSelectAddress(addr._id)}
                      className="accent-black mt-1 shrink-0"
                    />

                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-black break-words">
                          {addr.firstName} {addr.lastName}
                        </span>

                        {addr.isDefault && (
                          <span className="shrink-0 text-[10px] uppercase tracking-wide font-semibold bg-black text-white px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </span>

                      <span className="block text-sm text-[#5D5E63] mt-1 break-words">
                        {addr.address}, {addr.city}, {addr.state} —{" "}
                        {addr.pincode}
                      </span>

                      <span className="block text-sm text-[#5D5E63]">
                        {addr.phone}
                      </span>
                    </span>
                  </label>
                ))}

                <label
                  className={`flex items-center gap-3 bg-white border p-3.5 sm:p-4 cursor-pointer transition-colors ${
                    selectedAddressId === "new"
                      ? "border-black"
                      : "border-[#E2E2E2]"
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selectedAddressId === "new"}
                    onChange={() => handleSelectAddress("new")}
                    className="accent-black"
                  />

                  <span className="text-sm font-semibold text-black">
                    Use a different address
                  </span>
                </label>
              </div>
            )}

            {/* ===== Manual entry fields — locked while a saved address is
                selected; unlocked only for a fresh one-off address ===== */}

            <div className="flex flex-col gap-6">
              {/* FIRST NAME / LAST NAME */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    readOnly={isUsingSavedAddress}
                    disabled={isUsingSavedAddress}
                    className={`${inputClass} ${
                      isUsingSavedAddress ? lockedInputClass : ""
                    }`}
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-600 text-xs mt-1">
                      {formik.errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    readOnly={isUsingSavedAddress}
                    disabled={isUsingSavedAddress}
                    className={`${inputClass} ${
                      isUsingSavedAddress ? lockedInputClass : ""
                    }`}
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-600 text-xs mt-1">
                      {formik.errors.lastName}
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
                  readOnly={isUsingSavedAddress}
                  disabled={isUsingSavedAddress}
                  className={`${inputClass} ${
                    isUsingSavedAddress ? lockedInputClass : ""
                  }`}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {formik.touched.address && formik.errors.address && (
                  <p className="text-red-600 text-xs mt-1">
                    {formik.errors.address}
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
                    readOnly={isUsingSavedAddress}
                    disabled={isUsingSavedAddress}
                    className={`${inputClass} ${
                      isUsingSavedAddress ? lockedInputClass : ""
                    }`}
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {formik.touched.city && formik.errors.city && (
                    <p className="text-red-600 text-xs mt-1">
                      {formik.errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    readOnly={isUsingSavedAddress}
                    disabled={isUsingSavedAddress}
                    className={`${inputClass} ${
                      isUsingSavedAddress ? lockedInputClass : ""
                    }`}
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {formik.touched.state && formik.errors.state && (
                    <p className="text-red-600 text-xs mt-1">
                      {formik.errors.state}
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
                  readOnly={isUsingSavedAddress}
                  disabled={isUsingSavedAddress}
                  className={`${inputClass} ${
                    isUsingSavedAddress ? lockedInputClass : ""
                  }`}
                  value={formik.values.pincode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {formik.touched.pincode && formik.errors.pincode && (
                  <p className="text-red-600 text-xs mt-1">
                    {formik.errors.pincode}
                  </p>
                )}
              </div>

              {/* PHONE */}

              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone No"
                  readOnly={isUsingSavedAddress}
                  disabled={isUsingSavedAddress}
                  className={`${inputClass} ${
                    isUsingSavedAddress ? lockedInputClass : ""
                  }`}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-600 text-xs mt-1">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              {isUsingSavedAddress && (
                <p className="text-xs text-[#5D5E63]">
                  This address is locked to your saved details. Choose "Use a
                  different address" above to enter a new one, or edit it
                  permanently from your account page.
                </p>
              )}
            </div>
          </section>

          {/* ================= SHIPPING METHOD ================= */}

          <section className="mt-8">
            <h2 className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal text-black mb-4">
              Shipping Method
            </h2>

            <div className="flex flex-col gap-3">
              {SHIPPING_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex flex-wrap items-center justify-between gap-2 bg-white border p-3.5 sm:p-4 cursor-pointer transition-colors ${
                    formik.values.shippingMethod === method.value
                      ? "border-black"
                      : "border-[#E2E2E2]"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.value}
                      checked={
                        formik.values.shippingMethod === method.value
                      }
                      onChange={formik.handleChange}
                      className="accent-black shrink-0"
                    />

                    <span className="min-w-0">
                      <span className="block text-sm text-black">
                        {method.label}
                      </span>

                      <span className="block text-xs text-[#5D5E63]">
                        {method.detail}
                      </span>
                    </span>
                  </span>

                  <span className="shrink-0 text-sm text-black">
                    ₹{method.charge.toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* ================= PAYMENT ================= */}

          <section className="mt-8">
            <h2 className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal text-black mb-4">
              Payment
            </h2>

            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className={`flex items-center gap-3 bg-white border p-3.5 sm:p-4 cursor-pointer ${
                    formik.values.paymentMethod === method.value
                      ? "border-black"
                      : "border-[#E2E2E2]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={
                      formik.values.paymentMethod === method.value
                    }
                    onChange={formik.handleChange}
                    className="accent-black shrink-0"
                  />

                  <span className="text-sm text-black">{method.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* ================= PRIVACY CONSENT ================= */}

          <div className="mt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="privacyConsent"
                checked={formik.values.privacyConsent}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="accent-black mt-1 shrink-0"
              />

              <span className="text-sm text-[#5D5E63] leading-6">
                I agree to the{" "}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline hover:opacity-70"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {formik.touched.privacyConsent &&
              formik.errors.privacyConsent && (
                <p className="text-red-600 text-xs mt-1 ml-6">
                  {formik.errors.privacyConsent}
                </p>
              )}
          </div>

          {/* ================= ERROR ================= */}

          {submitError && (
            <p className="text-red-600 text-sm mt-6">{submitError}</p>
          )}

          {/* ================= PLACE ORDER ================= */}

          <button
            type="submit"
            disabled={
              formik.isSubmitting ||
              cartLoading ||
              cartItems.length === 0
            }
            className="mt-8 w-full sm:w-auto bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
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
          <h2 className="font-['Libre_Caslon_Text'] text-xl sm:text-2xl font-normal text-black mb-5 sm:mb-6">
            Order Summary
          </h2>

          {/* ================= CART ITEMS ================= */}

          <div className="flex flex-col gap-4 mb-6">
            {cartLoading ? (
              <p className="text-sm text-[#5D5E63]">Loading cart...</p>
            ) : cartItems.length === 0 ? (
              <p className="text-sm text-[#5D5E63]">
                Your cart is empty.
              </p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product?._id}
                  className="flex gap-3 sm:gap-4 items-center"
                >
                  <img
                    src={item.product?.mainImage}
                    alt={item.product?.modelName}
                    className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 object-cover bg-white"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-black truncate">
                      {item.product?.modelName}
                    </p>

                    <p className="text-xs text-[#5D5E63]">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm text-black">
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
              <span>Subtotal</span>

              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {/* SUBSCRIPTION DISCOUNT */}

            <div className="flex justify-between text-[#5D5E63]">
              <span>Subscription Discount</span>

              <span className="text-green-600">
                {discount > 0
                  ? `-₹${discount.toFixed(2)}`
                  : "₹0.00"}
              </span>
            </div>

            {/* SHIPPING */}

            <div className="flex justify-between text-[#5D5E63]">
              <span>Shipping Charge</span>

              <span>₹{shippingCharge.toFixed(2)}</span>
            </div>

            {/* TAX */}

            <div className="flex justify-between text-[#5D5E63]">
              <span>Tax</span>

              <span>₹{tax.toFixed(2)}</span>
            </div>

            {/* TOTAL */}

            <div className="flex justify-between font-bold text-black border-t border-[#E2E2E2] pt-4">
              <span>Total</span>

              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


