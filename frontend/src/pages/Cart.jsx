// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useApi } from "../hooks/useApi";
// import { useSelector } from "react-redux";

// // ---------------------------------------------------------------------------
// // REAL backend contract (confirmed against backend/routes/cartRoutes.js +
// // backend/controllers/cartControllers.js on main):
// //
// //   GET    /apicarts/getcartitems          -> { cart: { items: [{ product, quantity }] }, itemCount, orderSummary: { subtotal, shipping, tax, total } }
// //   PATCH  /apicarts/updatequantity        body: { ProductId, quantity }   (no :id in URL)
// //   DELETE /apicarts/deletecartproducts/:ProductId
// //   POST   /apicarts/addtocart             body: { ProductId, quantity }
// //
// // Backend already computes subtotal/shipping/tax/total and itemCount, so no
// // client-side tax placeholder is needed anymore.
// // ---------------------------------------------------------------------------

// export default function Cart() {
//   const { get, patch, del } = useApi();
//   const navigate = useNavigate();

//   const [items, setItems] = useState([]);
//   const [orderSummary, setOrderSummary] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
//   const [itemCount, setItemCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const {user,token} = useSelector((state)=>state.auth);

//   useEffect(() => {
//     loadCart();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadCart = async () => {
//     setLoading(true);
//     try {
//       const res = await get("/apicarts/getcartitems", { allowNotFound: true });
//       setItems(res?.cart?.items ?? []);
//       setOrderSummary(res?.orderSummary ?? { subtotal: 0, shipping: 0, tax: 0, total: 0 });
//       setItemCount(res?.itemCount ?? 0);
//     } catch {
//       // useApi already handles 401/403/404/500 redirects globally;
//       // a 404 here means "cart is empty" per getCart's own semantics.
//       setItems([]);
//       setOrderSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
//       setItemCount(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateQuantity = async (productId, nextQty) => {
//     if (nextQty < 1) return;
//     // optimistic update
//     setItems((prev) =>
//       prev.map((it) =>
//         it.product._id === productId ? { ...it, quantity: nextQty } : it
//       )
//     );
//     try {
//       await patch("/apicarts/updatequantity", { ProductId: productId, quantity: nextQty });
//       // re-sync so orderSummary/itemCount stay accurate (backend computes these)
//       loadCart();
//     } catch {
//       loadCart(); // resync on failure
//     }
//   };
//    const handleCheckout = () => {
//     if (user && token) {
//       navigate("/checkout");
//     } else {
//       // send them to register, but remember where they were headed
//       navigate("/login", { state: { from: "/checkout" } });
//     }
//   };

//   const removeItem = async (productId) => {
//     const prevItems = items;
//     setItems((prev) => prev.filter((it) => it.product._id !== productId));
//     try {
//       await del(`/apicarts/deletecartproducts/${productId}`);
//       loadCart(); // re-sync orderSummary/itemCount after removal
//     } catch {
//       setItems(prevItems); // revert on failure
//     }
//   };

//   const { subtotal, shipping, tax, total } = orderSummary;

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <p className="text-[#5D5E63] font-['Inter']">Loading your cart...</p>
//       </div>
//     );
//   }

//   if (items.length === 0) {
//     return (
//       <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
//         <h1
//           className="text-3xl md:text-4xl mb-3"
//           style={{ fontFamily: "'Libre Caslon Text', serif" }}
//         >
//           Your Cart
//         </h1>
//         <p className="text-[#5D5E63] font-['Inter'] mb-8">
//           Your cart is empty.
//         </p>
//         <button
//           onClick={() => navigate("/categories")}
//           className="px-8 py-3 bg-black text-white font-['Inter'] text-sm tracking-wide hover:bg-[#5D5E63] transition-colors"
//         >
//           Browse Collections
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
//       {/* Section 1 — Header */}
//       <div className="text-left mb-10">
//         <h1
//           className="text-3xl md:text-4xl mb-1"
//           style={{ fontFamily: "'Libre Caslon Text', serif" }}
//         >
//           Your Cart
//         </h1>
//         <p className="text-[#5D5E63] font-['Inter'] text-sm">
//           {itemCount} {itemCount === 1 ? "item" : "items"}
//         </p>
//       </div>

//       {/* Section 2 & 3 — two-column layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
//         {/* Left column — Cart Items */}
//         <div className="lg:col-span-2 flex flex-col divide-y divide-gray-200">
//           {items.map((it) => {
//             const p = it.product;
//             return (
//               <div key={p._id} className="py-6 flex gap-5">
//                 {/* Product image */}
//                 <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 bg-[#F9F9F9] overflow-hidden group">
//                   <img
//                     src={p.mainImage}
//                     alt={p.modelName}
//                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                   />
//                 </div>

//                 {/* Product details */}
//                 <div className="flex-1 flex flex-col justify-between min-w-0">
//                   <div className="flex justify-between gap-4">
//                     <div className="min-w-0">
//                       <h3
//                         className="text-lg md:text-xl truncate"
//                         style={{ fontFamily: "'Libre Caslon Text', serif" }}
//                       >
//                         {p.modelName}
//                       </h3>
//                       <p className="text-[#5D5E63] font-['Inter'] text-sm mt-1">
//                         {p.caseMaterial} &middot; {p.caseSize ?? "—"}
//                       </p>
//                       <p className="text-[#5D5E63] font-['Inter'] text-xs mt-1 uppercase tracking-wide">
//                         {p.sku}
//                       </p>
//                     </div>
//                     <p className="font-['Inter'] text-base md:text-lg whitespace-nowrap">
//                       ${p.price?.toLocaleString()}
//                     </p>
//                   </div>

//                   <div className="flex items-center justify-between mt-4">
//                     {/* Quantity selector */}
//                     <div className="flex items-center border border-gray-300">
//                       <button
//                         onClick={() => updateQuantity(p._id, it.quantity - 1)}
//                         className="w-8 h-8 flex items-center justify-center text-[#5D5E63] hover:bg-[#F9F9F9] transition-colors"
//                         aria-label="Decrease quantity"
//                       >
//                         −
//                       </button>
//                       <span className="w-10 text-center font-['Inter'] text-sm">
//                         {it.quantity}
//                       </span>
//                       <button
//                         onClick={() => updateQuantity(p._id, it.quantity + 1)}
//                         className="w-8 h-8 flex items-center justify-center text-[#5D5E63] hover:bg-[#F9F9F9] transition-colors"
//                         aria-label="Increase quantity"
//                       >
//                         +
//                       </button>
//                     </div>

//                     {/* Remove button */}
//                     <button
//                       onClick={() => removeItem(p._id)}
//                       className="flex items-center gap-1 text-xs font-['Inter'] text-[#5D5E63] hover:text-black transition-colors"
//                     >
//                       <span aria-hidden="true">×</span> Remove
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Right column — Order Summary */}
//         <div className="lg:col-span-1">
//           <div className="sticky top-24 border border-gray-200 p-6 md:p-8">
//             <h2
//               className="text-xl mb-6"
//               style={{ fontFamily: "'Libre Caslon Text', serif" }}
//             >
//               Order Summary
//             </h2>

//             <div className="space-y-3 font-['Inter'] text-sm">
//               <div className="flex justify-between">
//                 <span className="text-[#5D5E63]">Subtotal</span>
//                 <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-[#5D5E63]">Shipping</span>
//                 <span>{shipping > 0 ? `$${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "Complimentary"}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-[#5D5E63]">Tax</span>
//                 <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
//               </div>
//             </div>

//             <div className="border-t border-gray-200 mt-5 pt-5 flex justify-between items-baseline">
//               <span className="font-['Inter'] text-sm">Total</span>
//               <span
//                 className="text-xl"
//                 style={{ fontFamily: "'Libre Caslon Text', serif" }}
//               >
//                 ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//               </span>
//             </div>

//             <button
//               onClick={handleCheckout}
//               className="w-full mt-6 py-3 bg-black text-white font-['Inter'] text-sm tracking-wide hover:bg-[#5D5E63] transition-colors"
//             >
//               Proceed to Checkout
//             </button>

//             <div className="mt-6 space-y-3 text-xs text-[#5D5E63] font-['Inter']">
//               <div className="flex items-center gap-2">
//                 <span aria-hidden="true">🔒</span>
//                 <span>Secure checkout, encrypted end-to-end</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span aria-hidden="true">↺</span>
//                 <span>30-day returns &middot; 2-year warranty</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useSelector, useDispatch } from "react-redux";
import { setCart, removeCartItem } from "../redux/cartSlice";

// ---------------------------------------------------------------------------
// REAL backend contract (confirmed against backend/routes/cartRoutes.js +
// backend/controllers/cartControllers.js on main):
//
//   GET    /apicarts/getcartitems          -> { cart: { items: [{ product, quantity }] }, itemCount, orderSummary: { subtotal, shipping, tax, total } }
//   PATCH  /apicarts/updatequantity        body: { ProductId, quantity }   (no :id in URL)
//   DELETE /apicarts/deletecartproducts/:ProductId
//   POST   /apicarts/addtocart             body: { ProductId, quantity }
//
// Backend already computes subtotal/shipping/tax/total and itemCount, so no
// client-side tax placeholder is needed anymore.
// ---------------------------------------------------------------------------

export default function Cart() {
  const { get, patch, del } = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items = useSelector((state) => state.cart.items);
  const [orderSummary, setOrderSummary] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await get("/apicarts/getcartitems", { allowNotFound: true });
      dispatch(setCart(res?.cart?.items ?? []));
      setOrderSummary(res?.orderSummary ?? { subtotal: 0, shipping: 0, tax: 0, total: 0 });
      setItemCount(res?.itemCount ?? 0);
    } catch {
      // useApi already handles 401/403/404/500 redirects globally;
      // a 404 here means "cart is empty" per getCart's own semantics.
      dispatch(setCart([]));
      setOrderSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, nextQty) => {
    if (nextQty < 1) return;
    // optimistic update
    dispatch(setCart(
      items.map((it) =>
        it.product._id === productId ? { ...it, quantity: nextQty } : it
      )
    ));
    try {
      await patch("/apicarts/updatequantity", { ProductId: productId, quantity: nextQty });
      // re-sync so orderSummary/itemCount stay accurate (backend computes these)
      loadCart();
    } catch {
      loadCart(); // resync on failure
    }
  };

  const handleCheckout = () => {
    if (user && token) {
      navigate("/checkout");
    } else {
      // send them to register, but remember where they were headed
      navigate("/login", { state: { from: "/checkout" } });
    }
  };

  const removeItem = async (productId) => {
    const prevItems = items;
    dispatch(removeCartItem(productId));
    try {
      await del(`/apicarts/deletecartproducts/${productId}`);
      loadCart(); // re-sync orderSummary/itemCount after removal
    } catch {
      dispatch(setCart(prevItems)); // revert on failure
    }
  };

  const { subtotal, shipping, tax, total } = orderSummary;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-[#5D5E63] font-['Inter'] text-sm">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl mb-3"
          style={{ fontFamily: "'Libre Caslon Text', serif" }}
        >
          Your Cart
        </h1>
        <p className="text-[#5D5E63] font-['Inter'] text-sm mb-8">
          Your cart is empty.
        </p>
        <button
          onClick={() => navigate("/categories")}
          className="px-7 py-3 sm:px-8 bg-black text-white font-['Inter'] text-xs sm:text-sm tracking-wide hover:bg-[#5D5E63] transition-colors"
        >
          Browse Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-14">
      {/* Section 1 — Header */}
      <div className="text-left mb-6 sm:mb-10">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl mb-1"
          style={{ fontFamily: "'Libre Caslon Text', serif" }}
        >
          Your Cart
        </h1>
        <p className="text-[#5D5E63] font-['Inter'] text-sm">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Section 2 & 3 — two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        {/* Left column — Cart Items */}
        <div className="lg:col-span-2 flex flex-col divide-y divide-gray-200">
          {items.map((it) => {
            const p = it.product;
            return (
              <div key={p._id} className="py-5 sm:py-6 flex gap-4 sm:gap-5">
                {/* Product image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0 bg-[#F9F9F9] overflow-hidden group">
                  <img
                    src={p.mainImage}
                    alt={p.modelName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Product details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="flex justify-between gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <h3
                        className="text-base sm:text-lg md:text-xl truncate"
                        style={{ fontFamily: "'Libre Caslon Text', serif" }}
                      >
                        {p.modelName}
                      </h3>
                      <p className="text-[#5D5E63] font-['Inter'] text-xs sm:text-sm mt-1">
                        {p.caseMaterial} &middot; {p.caseSize ?? "—"}
                      </p>
                      <p className="text-[#5D5E63] font-['Inter'] text-[10px] sm:text-xs mt-1 uppercase tracking-wide">
                        {p.sku}
                      </p>
                    </div>
                    <p className="font-['Inter'] text-sm sm:text-base md:text-lg whitespace-nowrap">
                      ${p.price?.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    {/* Quantity selector */}
                    <div className="flex items-center border border-gray-300">
                      <button
                        onClick={() => updateQuantity(p._id, it.quantity - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#5D5E63] hover:bg-[#F9F9F9] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 sm:w-10 text-center font-['Inter'] text-xs sm:text-sm">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(p._id, it.quantity + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#5D5E63] hover:bg-[#F9F9F9] transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(p._id)}
                      className="flex items-center gap-1 text-[11px] sm:text-xs font-['Inter'] text-[#5D5E63] hover:text-black transition-colors"
                    >
                      <span aria-hidden="true">×</span> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column — Order Summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 border border-gray-200 p-5 sm:p-6 md:p-8">
            <h2
              className="text-lg sm:text-xl mb-5 sm:mb-6"
              style={{ fontFamily: "'Libre Caslon Text', serif" }}
            >
              Order Summary
            </h2>

            <div className="space-y-3 font-['Inter'] text-sm">
              <div className="flex justify-between">
                <span className="text-[#5D5E63]">Subtotal</span>
                <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D5E63]">Shipping</span>
                <span>{shipping > 0 ? `$${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "Complimentary"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D5E63]">Tax</span>
                <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-5 pt-5 flex justify-between items-baseline">
              <span className="font-['Inter'] text-sm">Total</span>
              <span
                className="text-lg sm:text-xl"
                style={{ fontFamily: "'Libre Caslon Text', serif" }}
              >
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 py-3 bg-black text-white font-['Inter'] text-xs sm:text-sm tracking-wide hover:bg-[#5D5E63] transition-colors"
            >
              Proceed to Checkout
            </button>

            <div className="mt-6 space-y-3 text-[11px] sm:text-xs text-[#5D5E63] font-['Inter']">
              <div className="flex items-center gap-2">
                <span aria-hidden="true">🔒</span>
                <span>Secure checkout, encrypted end-to-end</span>
              </div>
              <div className="flex items-center gap-2">
                <span aria-hidden="true">↺</span>
                <span>30-day returns &middot; 2-year warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}