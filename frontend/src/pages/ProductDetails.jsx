
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { ShieldCheck, Sparkles, Award, Heart, Check, ArrowRight } from "lucide-react";
// import { useApi } from "../hooks/useApi";
// import { addOrIncrementCartItem } from "../redux/cartSlice";
// import { addToWishlistLocal, removeFromWishlist } from "../redux/wishlistSlice";
// import ProductReviews from "../components/ProductReviews";

// const SPEC_FIELDS = [
//   { key: "brand", label: "Maison" },
//   { key: "modelNumber", label: "Reference" },
//   { key: "category", label: "Collection" },
//   { key: "caseMaterial", label: "Case Material" },
//   { key: "glassType", label: "Crystal" },
//   { key: "strapBracelet", label: "Bracelet / Strap" },
//   { key: "productFor", label: "Gender Edition" },
//   { key: "sku", label: "Unique SKU" },
// ];

// export default function ProductDetails() {
//   const { id } = useParams();
//   const { get, post, del } = useApi();
//   const dispatch = useDispatch();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notFound, setNotFound] = useState(false);
//   const [related, setRelated] = useState([]);
//   const [adding, setAdding] = useState(false);
//   const [addedMessage, setAddedMessage] = useState("");
//   const [selectedImage, setSelectedImage] = useState("");
//   const [wishlistSaving, setWishlistSaving] = useState(false);

//   const isWishlisted = useSelector((state) =>
//     state.wishlist?.items?.some((item) => item._id === id)
//   );

//   // Whether this product is already in the cart. Used to disable the
//   // "Acquire" button so it can't be added/incremented more than once
//   // from this page.
//   const isInCart = useSelector((state) =>
//     state.cart?.items?.some((item) => item._id === id)
//   );

//   useEffect(() => {
//     let cancelled = false;

//     const fetchProduct = async () => {
//       setLoading(true);
//       setNotFound(false);
//       try {
//         const data = await get(`/apiproduct/getsingleproduct/${id}`);
//         if (cancelled) return;
//         const fetched = data.product || null;
//         setProduct(fetched);
//         if (fetched?.mainImage) setSelectedImage(fetched.mainImage);

//         if (fetched?.category) {
//           try {
//             const rel = await get(`/apiproduct/getallproducts?category=${encodeURIComponent(fetched.category)}`);
//             if (!cancelled) {
//               setRelated((rel.products || []).filter((p) => p._id !== id).slice(0, 4));
//             }
//           } catch {
//             // ignore
//           }
//         }
//       } catch {
//         if (!cancelled) setNotFound(true);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     fetchProduct();
//     return () => {
//       cancelled = true;
//     };
//   }, [id, get]);

//   const handleAddToCart = async () => {
//     // Already adding, or already in the cart — do nothing. The button is
//     // also disabled in this case, this is just a safety guard.
//     if (adding || isInCart) return;

//     setAdding(true);
//     setAddedMessage("");
//     try {
//       await post("/apicarts/addtocart", {
//         ProductId: id,
//         quantity: 1,
//       });
//       dispatch(addOrIncrementCartItem(product));
//       setAddedMessage("Timepiece reserved and placed in your bag.");
//       setTimeout(() => setAddedMessage(""), 3000);
//     } catch {
//       dispatch(addOrIncrementCartItem(product));
//       setAddedMessage("Timepiece reserved.");
//       setTimeout(() => setAddedMessage(""), 3000);
//     } finally {
//       setAdding(false);
//     }
//   };

//   // Toggles the product in/out of the wishlist. Previously this only ever
//   // added — clicking the heart on an already-wishlisted product silently
//   // re-added it (a no-op) instead of removing it.
//   const handleWishlist = async () => {
//     if (wishlistSaving) return;
//     setWishlistSaving(true);

//     try {
//       if (isWishlisted) {
//         await del(`/apiwishlist/removefromlist/${id}`);
//         dispatch(removeFromWishlist(id));
//       } else {
//         await post(`/apiwishlist/addwishlist/${id}`);
//         dispatch(addToWishlistLocal(product));
//       }
//     } catch {
//       // ignore
//     } finally {
//       setWishlistSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#08090C] flex items-center justify-center">
//         <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (notFound || !product) {
//     return (
//       <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center text-center px-4 font-['Plus_Jakarta_Sans']">
//         <h2 className="text-3xl font-bold text-white">Timepiece Not Found</h2>
//         <p className="mt-2 text-sm text-gray-400">The requested horology piece may have been acquired.</p>
//         <Link to="/shop" className="mt-6 bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full">
//           Browse Active Timepieces
//         </Link>
//       </div>
//     );
//   }

//   const allImages = [product.mainImage, ...(product.images || [])].filter(Boolean);

//   return (
//     <div className="min-h-screen bg-[#08090C] text-white font-['Plus_Jakarta_Sans']">
      
//       {/* Product Main Display */}
//       <section className="max-w-[1600px] mx-auto px-6 py-12 sm:py-16">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
//           {/* Gallery Column */}
//           <div className="lg:col-span-7 flex flex-col gap-4">
            
//             {/* Main Stage Image */}
//             <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-3xl overflow-hidden bg-[#0E1015] border border-white/10 flex items-center justify-center p-8">
//               <img
//                 src={selectedImage || product.mainImage}
//                 alt={product.modelName}
//                 className="h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]"
//               />
//               <button
//                 onClick={handleWishlist}
//                 disabled={wishlistSaving}
//                 aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//                 className="absolute top-6 right-6 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all disabled:opacity-60"
//               >
//                 <Heart size={18} className={isWishlisted ? 'fill-white text-white' : ''} />
//               </button>
//             </div>

//             {/* Thumbnails */}
//             {allImages.length > 1 && (
//               <div className="flex gap-4 overflow-x-auto pb-2">
//                 {allImages.map((img, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setSelectedImage(img)}
//                     className={`w-24 h-24 rounded-2xl overflow-hidden bg-[#0E1015] border p-2 shrink-0 transition-all ${
//                       selectedImage === img ? 'border-white shadow-lg' : 'border-white/10 opacity-70 hover:opacity-100'
//                     }`}
//                   >
//                     <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Details & Acquisition Column */}
//           <div className="lg:col-span-5 flex flex-col">
            
//             <div className="inline-flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-[0.25em] mb-2">
//               <Sparkles size={14} />
//               {product.brand || 'Chronos Haute Horlogerie'}
//             </div>

//             <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
//               {product.modelName}
//             </h1>

//             <div className="mt-4 flex items-baseline gap-4">
//               <span className="text-3xl font-bold text-white">
//                 ₹{Number(product.price).toLocaleString()}
//               </span>
//               <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
//                 In Stock & Verified
//               </span>
//             </div>

//             <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
//               {product.description}
//             </p>

//             {/* Action Buttons */}
//             <div className="mt-8 flex flex-col gap-3">
//               <button
//                 onClick={handleAddToCart}
//                 disabled={adding || isInCart}
//                 className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
//               >
//                 {adding
//                   ? "Securing Timepiece..."
//                   : isInCart
//                   ? "Already in Bag"
//                   : "Acquire Timepiece"}
//               </button>

//               <button
//                 onClick={handleWishlist}
//                 disabled={wishlistSaving}
//                 className="w-full border border-white/20 hover:border-white text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all disabled:opacity-60 flex items-center justify-center gap-2"
//               >
//                 <Heart size={14} className={isWishlisted ? 'fill-white text-white' : ''} />
//                 {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
//               </button>

//               {addedMessage && (
//                 <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center text-xs text-white">
//                   {addedMessage}
//                 </div>
//               )}
//             </div>

//             {/* Specifications Table */}
//             <div className="mt-10 pt-8 border-t border-white/10">
//               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
//                 Horology Specifications
//               </h3>

//               <div className="grid grid-cols-2 gap-4">
//                 {SPEC_FIELDS.map(({ key, label }) => {
//                   const val = product[key];
//                   if (!val) return null;
//                   return (
//                     <div key={key} className="bg-[#0E1015] border border-white/5 p-3.5 rounded-xl">
//                       <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
//                       <p className="text-xs font-bold text-white mt-0.5">{val}</p>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Trust Badges */}
//             <div className="mt-8 p-4 rounded-2xl bg-[#0E1015] border border-white/5 flex items-center justify-between text-center">
//               <div className="flex flex-col items-center gap-1">
//                 <ShieldCheck size={18} className="text-white" />
//                 <span className="text-[10px] text-gray-300">5-Yr Warranty</span>
//               </div>
//               <div className="flex flex-col items-center gap-1">
//                 <Award size={18} className="text-white" />
//                 <span className="text-[10px] text-gray-300">Certified Swiss</span>
//               </div>
//               <div className="flex flex-col items-center gap-1">
//                 <Sparkles size={18} className="text-white" />
//                 <span className="text-[10px] text-gray-300">Free Courier</span>
//               </div>
//             </div>

//           </div>

//         </div>
//       </section>

//       {/* Reviews Section  */}
//        <section className="w-full border-t border-white/10 bg-[#0B0D12] py-16 px-6">
//         <div className="max-w-[1600px] mx-auto">
         
//           {id && <ProductReviews productId={id} />}
//         </div>
//       </section> 

//       {/* Related Timepieces */}
//       {related.length > 0 && (
//         <section className="w-full border-t border-white/10 bg-[#08090C] py-16 px-6">
//           <div className="max-w-[1600px] mx-auto">
//             <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
//               Complementary Timepieces
//             </h2>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {related.map((rel) => (
//                 <Link
//                   key={rel._id}
//                   to={`/product/${rel._id}`}
//                   className="group bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl p-5 block transition-all"
//                 >
//                   <div className="aspect-square w-full overflow-hidden bg-[#141720] rounded-xl p-4 mb-4">
//                     <img src={rel.mainImage} alt={rel.modelName} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
//                   </div>
//                   <h4 className="text-base font-bold text-white group-hover:text-gray-200 transition-colors">{rel.modelName}</h4>
//                   <p className="text-sm font-bold text-white mt-1">₹{Number(rel.price).toLocaleString()}</p>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, Sparkles, Award, Heart, Check, ArrowRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { addOrIncrementCartItem } from "../redux/cartSlice";
import { addToWishlistLocal, removeFromWishlist } from "../redux/wishlistSlice";
import ProductReviews from "../components/ProductReviews";

const SPEC_FIELDS = [
  { key: "brand", label: "Maison" },
  { key: "modelNumber", label: "Reference" },
  { key: "category", label: "Collection" },
  { key: "caseMaterial", label: "Case Material" },
  { key: "glassType", label: "Crystal" },
  { key: "strapBracelet", label: "Bracelet / Strap" },
  { key: "productFor", label: "Gender Edition" },
  { key: "sku", label: "Unique SKU" },
];

export default function ProductDetails() {
  const { id } = useParams();
  const { get, post, del } = useApi();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [wishlistSaving, setWishlistSaving] = useState(false);

  const isWishlisted = useSelector((state) =>
    state.wishlist?.items?.some((item) => item._id === id)
  );

  // Whether this product is already in the cart. Used to disable the
  // "Acquire" button so it can't be added/incremented more than once
  // from this page.
  const isInCart = useSelector((state) =>
    state.cart?.items?.some((it) => it.product._id === id)
  );

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await get(`/apiproduct/getsingleproduct/${id}`);
        if (cancelled) return;
        const fetched = data.product || null;
        setProduct(fetched);
        if (fetched?.mainImage) setSelectedImage(fetched.mainImage);

        if (fetched?.category) {
          try {
            const rel = await get(`/apiproduct/getallproducts?category=${encodeURIComponent(fetched.category)}`);
            if (!cancelled) {
              setRelated((rel.products || []).filter((p) => p._id !== id).slice(0, 4));
            }
          } catch {
            // ignore
          }
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id, get]);

  const handleAddToCart = async () => {
    // Already adding, or already in the cart — do nothing. The button is
    // also disabled in this case, this is just a safety guard.
    if (adding || isInCart) return;

    setAdding(true);
    setAddedMessage("");
    try {
      await post("/apicarts/addtocart", {
        ProductId: id,
        quantity: 1,
      });
      dispatch(addOrIncrementCartItem(product));
      setAddedMessage("Timepiece reserved and placed in your bag.");
      setTimeout(() => setAddedMessage(""), 3000);
    } catch {
      dispatch(addOrIncrementCartItem(product));
      setAddedMessage("Timepiece reserved.");
      setTimeout(() => setAddedMessage(""), 3000);
    } finally {
      setAdding(false);
    }
  };

  // Toggles the product in/out of the wishlist. Previously this only ever
  // added — clicking the heart on an already-wishlisted product silently
  // re-added it (a no-op) instead of removing it.
  const handleWishlist = async () => {
    if (wishlistSaving) return;
    setWishlistSaving(true);

    try {
      if (isWishlisted) {
        await del(`/apiwishlist/removefromlist/${id}`);
        dispatch(removeFromWishlist(id));
      } else {
        await post(`/apiwishlist/addwishlist/${id}`);
        dispatch(addToWishlistLocal(product));
      }
    } catch {
      // ignore
    } finally {
      setWishlistSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center text-center px-4 font-['Plus_Jakarta_Sans']">
        <h2 className="text-3xl font-bold text-white">Timepiece Not Found</h2>
        <p className="mt-2 text-sm text-gray-400">The requested horology piece may have been acquired.</p>
        <Link to="/shop" className="mt-6 bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full">
          Browse Active Timepieces
        </Link>
      </div>
    );
  }

  const allImages = [product.mainImage, ...(product.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#08090C] text-white font-['Plus_Jakarta_Sans']">
      
      {/* Product Main Display */}
      <section className="max-w-[1600px] mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Gallery Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Main Stage Image */}
            <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-3xl overflow-hidden bg-[#0E1015] border border-white/10 flex items-center justify-center p-8">
              <img
                src={selectedImage || product.mainImage}
                alt={product.modelName}
                className="h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]"
              />
              <button
                onClick={handleWishlist}
                disabled={wishlistSaving}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute top-6 right-6 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all disabled:opacity-60"
              >
                <Heart size={18} className={isWishlisted ? 'fill-white text-white' : ''} />
              </button>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-24 h-24 rounded-2xl overflow-hidden bg-[#0E1015] border p-2 shrink-0 transition-all ${
                      selectedImage === img ? 'border-white shadow-lg' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Acquisition Column */}
          <div className="lg:col-span-5 flex flex-col">
            
            <div className="inline-flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-[0.25em] mb-2">
              <Sparkles size={14} />
              {product.brand || 'Chronos Haute Horlogerie'}
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              {product.modelName}
            </h1>

            <div className="mt-4 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-white">
                ₹{Number(product.price).toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                In Stock & Verified
              </span>
            </div>

            <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding || isInCart}
                className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
              >
                {adding
                  ? "Securing Timepiece..."
                  : isInCart
                  ? "Already in Bag"
                  : "Acquire Timepiece"}
              </button>

              <button
                onClick={handleWishlist}
                disabled={wishlistSaving}
                className="w-full border border-white/20 hover:border-white text-white text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Heart size={14} className={isWishlisted ? 'fill-white text-white' : ''} />
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>

              {addedMessage && (
                <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-center text-xs text-white">
                  {addedMessage}
                </div>
              )}
            </div>

            {/* Specifications Table */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
                Horology Specifications
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {SPEC_FIELDS.map(({ key, label }) => {
                  const val = product[key];
                  if (!val) return null;
                  return (
                    <div key={key} className="bg-[#0E1015] border border-white/5 p-3.5 rounded-xl">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
                      <p className="text-xs font-bold text-white mt-0.5">{val}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 p-4 rounded-2xl bg-[#0E1015] border border-white/5 flex items-center justify-between text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={18} className="text-white" />
                <span className="text-[10px] text-gray-300">5-Yr Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Award size={18} className="text-white" />
                <span className="text-[10px] text-gray-300">Certified Swiss</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles size={18} className="text-white" />
                <span className="text-[10px] text-gray-300">Free Courier</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Reviews Section  */}
       <section className="w-full border-t border-white/10 bg-[#0B0D12] py-16 px-6">
        <div className="max-w-[1600px] mx-auto">
         
          {id && <ProductReviews productId={id} />}
        </div>
      </section> 

      {/* Related Timepieces */}
      {related.length > 0 && (
        <section className="w-full border-t border-white/10 bg-[#08090C] py-16 px-6">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
              Complementary Timepieces
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel._id}
                  to={`/product/${rel._id}`}
                  className="group bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl p-5 block transition-all"
                >
                  <div className="aspect-square w-full overflow-hidden bg-[#141720] rounded-xl p-4 mb-4">
                    <img src={rel.mainImage} alt={rel.modelName} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-gray-200 transition-colors">{rel.modelName}</h4>
                  <p className="text-sm font-bold text-white mt-1">₹{Number(rel.price).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}