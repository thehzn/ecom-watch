// import { useEffect, useState, useRef } from "react";
// import { useParams, Link } from "react-router-dom";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { useApi } from "../hooks/useApi";

// const SPEC_FIELDS = [
//   { key: "movement", label: "Movement" },
//   { key: "caliber", label: "Caliber" },
//   { key: "powerReserve", label: "Power Reserve" },
//   { key: "caseMaterial", label: "Case Material" },
//   { key: "waterResistance", label: "Water Resistance" },
//   { key: "caseSize", label: "Case Size" },
// ];

// function InfoField({ label, value }) {
//   if (!value) return null;

//   return (
//     <div>
//       <p
//         className="uppercase"
//         style={{
//           fontFamily: "Inter, sans-serif",
//           fontSize: "10px",
//           color: "#5D5E63",
//         }}
//       >
//         {label}
//       </p>

//       <p
//         className="mt-1 text-black"
//         style={{
//           fontFamily: "Inter, sans-serif",
//           fontSize: "16px",
//         }}
//       >
//         {value}
//       </p>
//     </div>
//   );
// }

// function RelatedCard({ product }) {
//   return (
//     <Link
//       to={`/product/${product._id}`}
//       className="group block w-[260px] flex-shrink-0 cursor-pointer"
//     >
//       <div
//         className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden"
//         style={{ backgroundColor: "#F3F3F4" }}
//       >
//         <img
//           src={product.mainImage}
//           alt={product.modelName}
//           className="h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
//         />
//       </div>

//       <h4
//         className="mt-4 text-black"
//         style={{
//           fontFamily: "'Libre Caslon Text', serif",
//           fontSize: "20px",
//           fontWeight: 400,
//         }}
//       >
//         {product.modelName}
//       </h4>

//       <p
//         className="mt-1 uppercase"
//         style={{
//           fontFamily: "Inter, sans-serif",
//           fontSize: "12px",
//           color: "#5D5E63",
//         }}
//       >
//         ₹{Number(product.price).toLocaleString()}
//       </p>
//     </Link>
//   );
// }

// export default function ProductDetails() {
//   const { id } = useParams();
//   const { get, post } = useApi();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notFound, setNotFound] = useState(false);

//   const [related, setRelated] = useState([]);
//   const scrollerRef = useRef(null);

//   const [adding, setAdding] = useState(false);
//   const [addedMessage, setAddedMessage] = useState("");
//   const [cartError, setCartError] = useState("");

//   // Selected main image
//   const [selectedImage, setSelectedImage] = useState("");

//   useEffect(() => {
//     let cancelled = false;

//     const fetchProduct = async () => {
//       setLoading(true);
//       setNotFound(false);

//       try {
//         const data = await get(
//           `/apiproduct/getsingleproduct/${id}`
//         );

//         if (cancelled) return;

//         const fetchedProduct = data.product || null;

//         setProduct(fetchedProduct);

//         // Set main image
//         if (fetchedProduct?.mainImage) {
//           setSelectedImage(fetchedProduct.mainImage);
//         }

//         // Related products
//         if (fetchedProduct?.category) {
//           try {
//             const relatedData = await get(
//               `/apiproduct/getallproducts?category=${encodeURIComponent(
//                 fetchedProduct.category
//               )}&limit=6`
//             );

//             if (!cancelled) {
//               setRelated(
//                 (relatedData.products || []).filter(
//                   (p) => p._id !== id
//                 )
//               );
//             }
//           } catch (error) {
//             console.log("Related products error:", error);
//           }
//         }
//       } catch (err) {
//         console.log(err);

//         if (!cancelled) {
//           setNotFound(true);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchProduct();

//     return () => {
//       cancelled = true;
//     };
//   }, [id]);

//   const handleAddToCart = async () => {
//     setAdding(true);
//     setCartError("");
//     setAddedMessage("");

//     try {
//       await post("/apicarts/addtocart", {
//         ProductId: id,
//         quantity: 1,
//       });

//       setAddedMessage("Added to your collection.");

//       setTimeout(() => {
//         setAddedMessage("");
//       }, 2500);
//     } catch (err) {
//       setCartError(
//         "Unable to add to cart. Please try again."
//       );
//     } finally {
//       setAdding(false);
//     }
//   };

//   const scrollRelated = (direction) => {
//     if (!scrollerRef.current) return;

//     const amount = 280;

//     scrollerRef.current.scrollBy({
//       left: direction === "next" ? amount : -amount,
//       behavior: "smooth",
//     });
//   };

//   if (loading) {
//     return (
//       <div
//         className="flex min-h-screen items-center justify-center"
//         style={{ backgroundColor: "#F9F9F9" }}
//       >
//         <p
//           style={{
//             fontFamily: "Inter, sans-serif",
//             color: "#5D5E63",
//           }}
//         >
//           Loading…
//         </p>
//       </div>
//     );
//   }

//   if (notFound || !product) {
//     return (
//       <div
//         className="flex min-h-screen flex-col items-center justify-center gap-4"
//         style={{ backgroundColor: "#F9F9F9" }}
//       >
//         <p
//           style={{
//             fontFamily: "Inter, sans-serif",
//             color: "#5D5E63",
//           }}
//         >
//           Product not found.
//         </p>

//         <Link
//           to="/shop"
//           className="text-black underline"
//         >
//           Back to Collection
//         </Link>
//       </div>
//     );
//   }

//   // Main image + additional images
//   const allImages = [
//     product.mainImage,
//     ...(Array.isArray(product.images)
//       ? product.images
//       : []),
//   ].filter(Boolean);

//   const availableSpecs = SPEC_FIELDS.filter(
//     (field) => product[field.key]
//   );

//   return (
//     <div className="w-full">

//       {/* HERO */}
//       <section
//         className="w-full px-5 py-16"
//         style={{ backgroundColor: "#F9F9F9" }}
//       >
//         <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 lg:grid-cols-2">

//           {/* IMAGE SECTION */}
//           <div className="w-full">

//             {/* MAIN IMAGE */}
//             <div
//               className="flex aspect-square w-full items-center justify-center overflow-hidden"
//               style={{ backgroundColor: "#F3F3F4" }}
//             >
//               <img
//                 src={selectedImage || product.mainImage}
//                 alt={product.modelName}
//                 className="h-full w-full object-contain p-12"
//               />
//             </div>

//             {/* THUMBNAILS */}
//             {allImages.length > 1 && (
//               <div className="mt-4 flex gap-3 overflow-x-auto">

//                 {allImages.map((image, index) => (
//                   <button
//                     key={`${image}-${index}`}
//                     type="button"
//                     onClick={() => setSelectedImage(image)}
//                     className={`flex h-24 w-24 flex-shrink-0 items-center justify-center border transition-all ${
//                       selectedImage === image
//                         ? "border-black"
//                         : "border-transparent"
//                     }`}
//                     style={{ backgroundColor: "#F3F3F4" }}
//                   >
//                     <img
//                       src={image}
//                       alt={`${product.modelName} ${index + 1}`}
//                       className="h-full w-full object-contain p-2"
//                     />
//                   </button>
//                 ))}

//               </div>
//             )}

//           </div>

//           {/* PRODUCT INFORMATION */}
//           <div className="flex flex-col gap-6">

//             <span
//               className="uppercase"
//               style={{
//                 fontFamily: "Inter, sans-serif",
//                 fontSize: "12px",
//                 fontWeight: 600,
//                 letterSpacing: "0.1em",
//                 color: "#5D5E63",
//               }}
//             >
//               {product.category}
//             </span>

//             <h1
//               className="text-black"
//               style={{
//                 fontFamily: "'Libre Caslon Text', serif",
//                 fontSize: "40px",
//                 fontWeight: 400,
//                 lineHeight: "48px",
//               }}
//             >
//               {product.modelName}
//             </h1>

//             <p
//               style={{
//                 fontFamily: "'Libre Caslon Text', serif",
//                 fontSize: "24px",
//                 color: "#5D5E63",
//               }}
//             >
//               ₹{Number(product.price).toLocaleString()}
//             </p>

//             <p
//               style={{
//                 fontFamily: "Inter, sans-serif",
//                 fontSize: "16px",
//                 lineHeight: "24px",
//                 color: "#5D5E63",
//               }}
//             >
//               {product.description}
//             </p>

//             {/* PRODUCT DETAILS */}
//             <div
//               className="grid grid-cols-2 gap-6 border-t border-b py-6"
//               style={{
//                 borderColor: "rgba(196,199,199,0.3)",
//               }}
//             >
//               <InfoField
//                 label="Product Name"
//                 value={product.modelName}
//               />

//               <InfoField
//                 label="SKU"
//                 value={product.sku}
//               />

//               <InfoField
//                 label="Collection"
//                 value={product.category}
//               />

//               <InfoField
//                 label="Description"
//                 value={product.description}
//               />
//             </div>

//             {/* BUTTONS */}
//             <div className="flex flex-col gap-3 sm:flex-row">

//               <button
//                 type="button"
//                 onClick={handleAddToCart}
//                 disabled={adding}
//                 className="flex-1 bg-black uppercase text-white transition-opacity duration-300 hover:opacity-90 disabled:opacity-60"
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontSize: "12px",
//                   fontWeight: 600,
//                   padding: "16px",
//                 }}
//               >
//                 {adding
//                   ? "Adding…"
//                   : "Add to Cart"}
//               </button>

//               <Link
//                 to="/enquiry"
//                 className="flex-1 border border-black text-center uppercase text-black transition-colors duration-300 hover:bg-black hover:text-white"
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontSize: "12px",
//                   fontWeight: 600,
//                   padding: "16px",
//                 }}
//               >
//                 Enquire for Bespoke
//               </Link>

//             </div>

//             {addedMessage && (
//               <p
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontSize: "14px",
//                   color: "#000000",
//                 }}
//               >
//                 {addedMessage}
//               </p>
//             )}

//             {cartError && (
//               <p
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontSize: "14px",
//                   color: "#DC2626",
//                 }}
//               >
//                 {cartError}
//               </p>
//             )}

//           </div>
//         </div>
//       </section>

//       {/* TECHNICAL SPECS */}
//       {availableSpecs.length > 0 && (
//         <section className="w-full px-5 py-16">
//           <div className="mx-auto max-w-[1440px]">

//             <h2
//               className="mb-10 text-black"
//               style={{
//                 fontFamily:
//                   "'Libre Caslon Text', serif",
//                 fontSize: "32px",
//                 fontWeight: 400,
//               }}
//             >
//               Technical Specs
//             </h2>

//             <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
//               {availableSpecs.map((field) => (
//                 <InfoField
//                   key={field.key}
//                   label={field.label}
//                   value={product[field.key]}
//                 />
//               ))}
//             </div>

//           </div>
//         </section>
//       )}

//       {/* RELATED PRODUCTS */}
//       {related.length > 0 && (
//         <section
//           className="w-full px-5 py-16"
//           style={{ backgroundColor: "#F9F9F9" }}
//         >
//           <div className="mx-auto max-w-[1440px]">

//             <div className="mb-8 flex items-center justify-between">

//               <h2
//                 className="text-black"
//                 style={{
//                   fontFamily:
//                     "'Libre Caslon Text', serif",
//                   fontSize: "32px",
//                   fontWeight: 400,
//                 }}
//               >
//                 The Collection
//               </h2>

//               <div className="flex items-center gap-2">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     scrollRelated("prev")
//                   }
//                   className="flex h-10 w-10 items-center justify-center border border-black transition-colors duration-200 hover:bg-black hover:text-white"
//                   aria-label="Previous"
//                 >
//                   <ChevronLeft size={16} />
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     scrollRelated("next")
//                   }
//                   className="flex h-10 w-10 items-center justify-center border border-black transition-colors duration-200 hover:bg-black hover:text-white"
//                   aria-label="Next"
//                 >
//                   <ChevronRight size={16} />
//                 </button>

//               </div>
//             </div>

//             <div
//               ref={scrollerRef}
//               className="flex gap-8 overflow-x-auto scroll-smooth pb-4"
//             >
//               {related.map((relatedProduct) => (
//                 <RelatedCard
//                   key={relatedProduct._id}
//                   product={relatedProduct}
//                 />
//               ))}
//             </div>

//           </div>
//         </section>
//       )}
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, Sparkles, Award, Heart, Check, ArrowRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { addOrIncrementCartItem } from "../redux/cartSlice";
import { addToWishlistLocal } from "../redux/wishlistSlice";

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
  const { get, post } = useApi();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const isWishlisted = useSelector((state) =>
    state.wishlist?.items?.some((item) => item._id === id)
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

  const handleWishlist = async () => {
    try {
      await post(`/apiwishlist/addwishlist/${id}`);
    } catch {
      // ignore
    }
    dispatch(addToWishlistLocal(product));
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
                aria-label="Wishlist"
                className="absolute top-6 right-6 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
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
                disabled={adding}
                className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
              >
                {adding ? "Securing Timepiece..." : "Acquire Timepiece"}
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

      {/* Related Timepieces */}
      {related.length > 0 && (
        <section className="w-full border-t border-white/10 bg-[#0B0D12] py-16 px-6">
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
                  <p className="text-sm font-bold text-white mt-1">${Number(rel.price).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}