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

//     </div>
//   );
// }
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { addOrIncrementCartItem } from "../redux/cartSlice";

const SPEC_FIELDS = [
  { key: "movement", label: "Movement" },
  { key: "caliber", label: "Caliber" },
  { key: "powerReserve", label: "Power Reserve" },
  { key: "caseMaterial", label: "Case Material" },
  { key: "waterResistance", label: "Water Resistance" },
  { key: "caseSize", label: "Case Size" },
];

function InfoField({ label, value }) {
  if (!value) return null;

  return (
    <div>
      <p
        className="uppercase"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "10px",
          color: "#5D5E63",
        }}
      >
        {label}
      </p>

      <p
        className="mt-1 text-black text-sm sm:text-base"
        style={{
          fontFamily: "Inter, sans-serif",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function RelatedCard({ product }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="group block w-[200px] sm:w-[230px] md:w-[260px] flex-shrink-0 cursor-pointer"
    >
      <div
        className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#F3F3F4" }}
      >
        <img
          src={product.mainImage}
          alt={product.modelName}
          className="h-full w-full object-contain p-4 sm:p-6 transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <h4
        className="mt-3 sm:mt-4 text-black text-base sm:text-lg md:text-[20px]"
        style={{
          fontFamily: "'Libre Caslon Text', serif",
          fontWeight: 400,
        }}
      >
        {product.modelName}
      </h4>

      <p
        className="mt-1 uppercase text-[11px] sm:text-xs"
        style={{
          fontFamily: "Inter, sans-serif",
          color: "#5D5E63",
        }}
      >
        ₹{Number(product.price).toLocaleString()}
      </p>
    </Link>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { get, post } = useApi();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [related, setRelated] = useState([]);
  const scrollerRef = useRef(null);

  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const [cartError, setCartError] = useState("");

  // Selected main image
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const data = await get(
          `/apiproduct/getsingleproduct/${id}`
        );

        if (cancelled) return;

        const fetchedProduct = data.product || null;

        setProduct(fetchedProduct);

        // Set main image
        if (fetchedProduct?.mainImage) {
          setSelectedImage(fetchedProduct.mainImage);
        }

        // Related products
        if (fetchedProduct?.category) {
          try {
            const relatedData = await get(
              `/apiproduct/getallproducts?category=${encodeURIComponent(
                fetchedProduct.category
              )}&limit=6`
            );

            if (!cancelled) {
              setRelated(
                (relatedData.products || []).filter(
                  (p) => p._id !== id
                )
              );
            }
          } catch (error) {
            console.log("Related products error:", error);
          }
        }
      } catch (err) {
        console.log(err);

        if (!cancelled) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    setCartError("");
    setAddedMessage("");

    try {
      await post("/apicarts/addtocart", {
        ProductId: id,
        quantity: 1,
      });

      dispatch(addOrIncrementCartItem(product));

      setAddedMessage("Added to your collection.");

      setTimeout(() => {
        setAddedMessage("");
      }, 2500);
    } catch (err) {
      setCartError(
        "Unable to add to cart. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  const scrollRelated = (direction) => {
    if (!scrollerRef.current) return;

    const amount = 280;

    scrollerRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundColor: "#F9F9F9" }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            color: "#5D5E63",
          }}
        >
          Loading…
        </p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
        style={{ backgroundColor: "#F9F9F9" }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            color: "#5D5E63",
          }}
        >
          Product not found.
        </p>

        <Link
          to="/shop"
          className="text-black underline"
        >
          Back to Collection
        </Link>
      </div>
    );
  }

  // Main image + additional images
  const allImages = [
    product.mainImage,
    ...(Array.isArray(product.images)
      ? product.images
      : []),
  ].filter(Boolean);

  const availableSpecs = SPEC_FIELDS.filter(
    (field) => product[field.key]
  );

  return (
    <div className="w-full">

      {/* HERO */}
      <section
        className="w-full px-5 py-10 sm:py-14 md:py-16"
        style={{ backgroundColor: "#F9F9F9" }}
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">

          {/* IMAGE SECTION */}
          <div className="w-full">

            {/* MAIN IMAGE */}
            <div
              className="flex aspect-square w-full items-center justify-center overflow-hidden"
              style={{ backgroundColor: "#F3F3F4" }}
            >
              <img
                src={selectedImage || product.mainImage}
                alt={product.modelName}
                className="h-full w-full object-contain p-6 sm:p-10 md:p-12"
              />
            </div>

            {/* THUMBNAILS */}
            {allImages.length > 1 && (
              <div className="mt-3 sm:mt-4 flex gap-2 sm:gap-3 overflow-x-auto">

                {allImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`flex h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 items-center justify-center border transition-all ${
                      selectedImage === image
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: "#F3F3F4" }}
                  >
                    <img
                      src={image}
                      alt={`${product.modelName} ${index + 1}`}
                      className="h-full w-full object-contain p-2"
                    />
                  </button>
                ))}

              </div>
            )}

          </div>

          {/* PRODUCT INFORMATION */}
          <div className="flex flex-col gap-4 sm:gap-6">

            <span
              className="uppercase text-[11px] sm:text-xs"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#5D5E63",
              }}
            >
              {product.category}
            </span>

            <h1
              className="text-black text-[26px] sm:text-[32px] md:text-[40px] leading-[1.2] md:leading-[48px]"
              style={{
                fontFamily: "'Libre Caslon Text', serif",
                fontWeight: 400,
              }}
            >
              {product.modelName}
            </h1>

            <p
              className="text-lg sm:text-xl md:text-[24px]"
              style={{
                fontFamily: "'Libre Caslon Text', serif",
                color: "#5D5E63",
              }}
            >
              ₹{Number(product.price).toLocaleString()}
            </p>

            <p
              className="text-sm sm:text-base leading-6"
              style={{
                fontFamily: "Inter, sans-serif",
                color: "#5D5E63",
              }}
            >
              {product.description}
            </p>

            {/* PRODUCT DETAILS */}
            <div
              className="grid grid-cols-2 gap-5 sm:gap-6 border-t border-b py-5 sm:py-6"
              style={{
                borderColor: "rgba(196,199,199,0.3)",
              }}
            >
              <InfoField
                label="Product Name"
                value={product.modelName}
              />

              <InfoField
                label="SKU"
                value={product.sku}
              />

              <InfoField
                label="Collection"
                value={product.category}
              />

              <InfoField
                label="Description"
                value={product.description}
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 bg-black uppercase text-white transition-opacity duration-300 hover:opacity-90 disabled:opacity-60 py-4 text-xs"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                {adding
                  ? "Adding…"
                  : "Add to Cart"}
              </button>

              <Link
                to="/enquiry"
                className="flex-1 border border-black text-center uppercase text-black transition-colors duration-300 hover:bg-black hover:text-white py-4 text-xs"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                }}
              >
                Enquire for Bespoke
              </Link>

            </div>

            {addedMessage && (
              <p
                className="text-sm"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: "#000000",
                }}
              >
                {addedMessage}
              </p>
            )}

            {cartError && (
              <p
                className="text-sm"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: "#DC2626",
                }}
              >
                {cartError}
              </p>
            )}

          </div>
        </div>
      </section>

      {/* TECHNICAL SPECS */}
      {availableSpecs.length > 0 && (
        <section className="w-full px-5 py-10 sm:py-14 md:py-16">
          <div className="mx-auto max-w-[1440px]">

            <h2
              className="mb-6 sm:mb-8 md:mb-10 text-black text-2xl sm:text-[28px] md:text-[32px]"
              style={{
                fontFamily:
                  "'Libre Caslon Text', serif",
                fontWeight: 400,
              }}
            >
              Technical Specs
            </h2>

            <div className="grid grid-cols-2 gap-6 sm:gap-8 sm:grid-cols-3 lg:grid-cols-6">
              {availableSpecs.map((field) => (
                <InfoField
                  key={field.key}
                  label={field.label}
                  value={product[field.key]}
                />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section
          className="w-full px-5 py-10 sm:py-14 md:py-16"
          style={{ backgroundColor: "#F9F9F9" }}
        >
          <div className="mx-auto max-w-[1440px]">

            <div className="mb-6 sm:mb-8 flex items-center justify-between">

              <h2
                className="text-black text-2xl sm:text-[28px] md:text-[32px]"
                style={{
                  fontFamily:
                    "'Libre Caslon Text', serif",
                  fontWeight: 400,
                }}
              >
                The Collection
              </h2>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    scrollRelated("prev")
                  }
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-black transition-colors duration-200 hover:bg-black hover:text-white"
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollRelated("next")
                  }
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-black transition-colors duration-200 hover:bg-black hover:text-white"
                  aria-label="Next"
                >
                  <ChevronRight size={16} />
                </button>

              </div>
            </div>

            <div
              ref={scrollerRef}
              className="flex gap-5 sm:gap-6 md:gap-8 overflow-x-auto scroll-smooth pb-4"
            >
              {related.map((relatedProduct) => (
                <RelatedCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>

          </div>
        </section>
      )}

    </div>
  );
}