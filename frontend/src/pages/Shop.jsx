
// import { useEffect, useState, useCallback } from 'react';
// import { Link, useSearchParams } from 'react-router-dom';
// import { ChevronLeft, ChevronRight, X, Heart } from 'lucide-react';
// import { useApi } from '../hooks/useApi';

// const LIMIT = 12;

// const MATERIAL_OPTIONS = [
//   'All Materials',
//   'Stainless Steel',
//   'Titanium',
//   'Gold',
//   'Rose Gold',
//   'Platinum',
//   'Ceramic',
// ];

// const FOR_OPTIONS = ['Men', 'Women', 'Children'];

// function ProductCard({ product }) {
//   const { post } = useApi();
//   const details = [product.caseMaterial, product.glassType].filter(Boolean).join(' · ');
//   const [wishlisted, setWishlisted] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const handleWishlist = async (e) => {
//     e.preventDefault(); // don't follow the card's Link
//     e.stopPropagation();
//     if (saving || wishlisted) return;
//     setSaving(true);
//     try {
//       await post(`/apiwishlist/addwishlist/${product._id}`);
//       setWishlisted(true);
//     } catch (err) {
//       // silently ignore — button stays available to retry
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Link to={`/product/${product._id}`} className="group relative block cursor-pointer">
//       <div className="relative aspect-[4/5] w-full overflow-hidden">
//         <img
//           src={product.mainImage}
//           alt={product.modelName}
//           className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
//         />
//         <button
//           onClick={handleWishlist}
//           disabled={saving}
//           aria-label={wishlisted ? 'Added to wishlist' : 'Add to wishlist'}
//           className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 transition-transform duration-200 hover:scale-105 disabled:opacity-60"
//         >
//           <Heart
//             size={18}
//             className={wishlisted ? 'fill-black text-black' : 'text-black'}
//           />
//         </button>
//       </div>
//       <div className="mt-4 flex items-start justify-between gap-4">
//         <div>
//           <h3 className="font-['Libre_Caslon_Text'] text-2xl font-normal text-black">
//             {product.modelName}
//           </h3>
//           {details && (
//             <p className="mt-1 font-['Inter'] text-base text-[#5D5E63]">{details}</p>
//           )}
//         </div>
//         <p className="whitespace-nowrap text-right font-['Inter'] text-base font-semibold text-black">
//           ${Number(product.price).toLocaleString()}
//         </p>
//       </div>
//     </Link>
//   );
// }

// export default function Shop() {
//   const { get } = useApi();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const search = searchParams.get('search') || '';

//   const [products, setProducts] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalProducts, setTotalProducts] = useState(0);
//   const [material, setMaterial] = useState('All Materials');
//   const [productFor, setProductFor] = useState('Men');
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [fetchError, setFetchError] = useState('');

//   const buildQuery = useCallback(
//     (pageNum) => {
//       const params = new URLSearchParams({ page: pageNum, limit: LIMIT });
//       if (productFor) params.set('productFor', productFor);
//       if (material && material !== 'All Materials') params.set('caseMaterial', material);
//       if (search) params.set('search', search);
//       return `/apiproduct/getallproducts?${params.toString()}`;
//     },
//     [material, productFor, search]
//   );

//   const fetchProducts = useCallback(
//     async (pageNum, { append }) => {
//       append ? setLoadingMore(true) : setLoading(true);
//       setFetchError('');
//       try {
//         const data = await get(buildQuery(pageNum));
//         const fetched = data.products || [];
//         setProducts((prev) => (append ? [...prev, ...fetched] : fetched));
//         setTotalPages(data.totalPages || 1);
//         setTotalProducts(data.totalProducts || 0);
//         setPage(pageNum);
//       } catch (err) {
//         setFetchError('Unable to load products right now.');
//       } finally {
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [get, buildQuery]
//   );

//   // Refetch from page 1 whenever filters or the search term change
//   useEffect(() => {
//     fetchProducts(1, { append: false });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [material, productFor, search]);

//   const handleLoadMore = () => {
//     if (page < totalPages) fetchProducts(page + 1, { append: true });
//   };

//   const handlePrev = () => {
//     if (page > 1) fetchProducts(page - 1, { append: false });
//   };

//   const handleNext = () => {
//     if (page < totalPages) fetchProducts(page + 1, { append: false });
//   };

//   const clearSearch = () => {
//     const next = new URLSearchParams(searchParams);
//     next.delete('search');
//     setSearchParams(next);
//   };

//   return (
//     <div className="min-h-screen w-full bg-white">
//       {/* Collection Hero */}
//       <section className="w-full bg-[#F9F9F9] px-5 py-16">
//         <div className="mx-auto flex max-w-[768px] flex-col items-center text-center">
//           <span className="font-['Inter'] text-xs font-semibold uppercase tracking-[0.2em] text-[#5D5E63]">
//             Limited Release
//           </span>
//           <h1 className="mt-4 font-['Libre_Caslon_Text'] text-[40px] font-normal leading-[48px] text-black">
//             Collection
//           </h1>
//           <p className="mt-4 font-['Inter'] text-lg leading-7 text-[#5D5E63]">
//             Each timepiece in this collection is crafted with uncompromising precision, built to
//             be worn for generations.
//           </p>
//         </div>
//       </section>

//       {/* Search context banner — only shows when arriving from a Navbar search */}
//       {search && (
//         <section className="mx-auto flex max-w-[1536px] items-center justify-between gap-4 border-b border-[#C4C7C7]/20 px-5 py-4">
//           <p className="font-['Inter'] text-sm text-[#1A1C1C]">
//             Search results for <span className="font-semibold">"{search}"</span>
//           </p>
//           <button
//             onClick={clearSearch}
//             className="flex items-center gap-1 font-['Inter'] text-xs font-semibold uppercase tracking-wide text-[#5D5E63] transition-colors duration-200 hover:text-black"
//           >
//             <X size={14} />
//             Clear search
//           </button>
//         </section>
//       )}

//       {/* Filter bar */}
//       <section className="mx-auto flex max-w-[1536px] flex-col gap-4 border-b border-[#C4C7C7]/20 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex flex-wrap items-center gap-8">
//           <div className="flex flex-col">
//             <label htmlFor="material" className="font-['Inter'] text-xs uppercase text-[#5D5E63]">
//               Material
//             </label>
//             <select
//               id="material"
//               value={material}
//               onChange={(e) => setMaterial(e.target.value)}
//               className="bg-transparent font-['Inter'] text-base text-black outline-none"
//             >
//               {MATERIAL_OPTIONS.map((m) => (
//                 <option key={m} value={m}>
//                   {m}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex flex-col">
//             <label htmlFor="for" className="font-['Inter'] text-xs uppercase text-[#5D5E63]">
//               For
//             </label>
//             <select
//               id="for"
//               value={productFor}
//               onChange={(e) => setProductFor(e.target.value)}
//               className="bg-transparent font-['Inter'] text-base text-black outline-none"
//             >
//               {FOR_OPTIONS.map((f) => (
//                 <option key={f} value={f}>
//                   {f}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <p className="font-['Inter'] text-xs font-semibold uppercase text-[#5D5E63]">
//           Showing {products.length} of {totalProducts} timepieces
//         </p>
//       </section>

//       {/* Product grid */}
//       <section className="mx-auto max-w-[1536px] px-5 py-12">
//         {loading && (
//           <p className="py-24 text-center font-['Inter'] text-[#5D5E63]">Loading timepieces…</p>
//         )}

//         {!loading && fetchError && (
//           <p className="py-24 text-center font-['Inter'] text-[#DC2626]">{fetchError}</p>
//         )}

//         {!loading && !fetchError && products.length === 0 && (
//           <p className="py-24 text-center font-['Inter'] text-[#5D5E63]">
//             {search
//               ? `No timepieces match "${search}".`
//               : 'No timepieces match these filters.'}
//           </p>
//         )}

//         {!loading && !fetchError && products.length > 0 && (
//           <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
//             {products.map((p) => (
//               <ProductCard key={p._id} product={p} />
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Load more + pagination */}
//       {!loading && !fetchError && totalPages > 1 && (
//         <section className="flex flex-col items-center gap-6 border-t border-[#C4C7C7]/20 px-5 py-16">
//           {page < totalPages && (
//             <button
//               onClick={handleLoadMore}
//               disabled={loadingMore}
//               className="bg-black px-12 py-4 font-['Inter'] text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors duration-200 hover:bg-[#2F3131] active:scale-95 disabled:opacity-60"
//             >
//               {loadingMore ? 'Loading…' : 'Discover More Timepieces'}
//             </button>
//           )}

//           <p className="font-['Inter'] text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]">
//             Page {page} of {totalPages}
//           </p>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={handlePrev}
//               disabled={page === 1}
//               className="flex h-10 w-10 items-center justify-center border border-[#C4C7C7] transition-colors duration-200 hover:bg-[#F3F3F4] disabled:opacity-40"
//               aria-label="Previous page"
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <button
//               onClick={handleNext}
//               disabled={page === totalPages}
//               className="flex h-10 w-10 items-center justify-center border border-[#C4C7C7] transition-colors duration-200 hover:bg-[#F3F3F4] disabled:opacity-40"
//               aria-label="Next page"
//             >
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, X, Heart } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { addToWishlistLocal } from '../redux/wishlistSlice';

const LIMIT = 12;

const MATERIAL_OPTIONS = [
  'All Materials',
  'Stainless Steel',
  'Titanium',
  'Gold',
  'Rose Gold',
  'Platinum',
  'Ceramic',
];

const FOR_OPTIONS = ['Men', 'Women', 'Children'];

function ProductCard({ product }) {
  const { post } = useApi();
  const dispatch = useDispatch();
  const details = [product.caseMaterial, product.glassType].filter(Boolean).join(' · ');

  const wishlisted = useSelector((state) =>
    state.wishlist.items.some((item) => item._id === product._id)
  );
  const [saving, setSaving] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault(); // don't follow the card's Link
    e.stopPropagation();
    if (saving || wishlisted) return;
    setSaving(true);
    try {
      await post(`/apiwishlist/addwishlist/${product._id}`);
      dispatch(addToWishlistLocal(product));
    } catch (err) {
      // silently ignore — button stays available to retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="group relative block cursor-pointer">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={product.mainImage}
          alt={product.modelName}
          className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
        />
        <button
          onClick={handleWishlist}
          disabled={saving || wishlisted}
          aria-label={wishlisted ? 'Added to wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 transition-transform duration-200 hover:scale-105 disabled:opacity-60"
        >
          <Heart
            size={18}
            className={wishlisted ? 'fill-black text-black' : 'text-black'}
          />
        </button>
      </div>
      <div className="mt-3 sm:mt-4 flex items-start justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="font-['Libre_Caslon_Text'] text-lg sm:text-xl md:text-2xl font-normal text-black">
            {product.modelName}
          </h3>
          {details && (
            <p className="mt-1 font-['Inter'] text-sm sm:text-base text-[#5D5E63]">{details}</p>
          )}
        </div>
        <p className="whitespace-nowrap text-right font-['Inter'] text-sm sm:text-base font-semibold text-black">
          ${Number(product.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}

export default function Shop() {
  const { get } = useApi();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [material, setMaterial] = useState('All Materials');
  const [productFor, setProductFor] = useState('Men');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const buildQuery = useCallback(
    (pageNum) => {
      const params = new URLSearchParams({ page: pageNum, limit: LIMIT });
      if (productFor) params.set('productFor', productFor);
      if (material && material !== 'All Materials') params.set('caseMaterial', material);
      if (search) params.set('search', search);
      return `/apiproduct/getallproducts?${params.toString()}`;
    },
    [material, productFor, search]
  );

  const fetchProducts = useCallback(
    async (pageNum, { append }) => {
      append ? setLoadingMore(true) : setLoading(true);
      setFetchError('');
      try {
        const data = await get(buildQuery(pageNum));
        const fetched = data.products || [];
        setProducts((prev) => (append ? [...prev, ...fetched] : fetched));
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || 0);
        setPage(pageNum);
      } catch (err) {
        setFetchError('Unable to load products right now.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [get, buildQuery]
  );

  // Refetch from page 1 whenever filters or the search term change
  useEffect(() => {
    fetchProducts(1, { append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, productFor, search]);

  const handleLoadMore = () => {
    if (page < totalPages) fetchProducts(page + 1, { append: true });
  };

  const handlePrev = () => {
    if (page > 1) fetchProducts(page - 1, { append: false });
  };

  const handleNext = () => {
    if (page < totalPages) fetchProducts(page + 1, { append: false });
  };

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Collection Hero */}
      <section className="w-full bg-[#F9F9F9] px-5 py-10 sm:py-14 md:py-16">
        <div className="mx-auto flex max-w-[768px] flex-col items-center text-center">
          <span className="font-['Inter'] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#5D5E63]">
            Limited Release
          </span>
          <h1 className="mt-3 sm:mt-4 font-['Libre_Caslon_Text'] text-[28px] sm:text-[34px] md:text-[40px] font-normal leading-[1.2] md:leading-[48px] text-black">
            Collection
          </h1>
          <p className="mt-3 sm:mt-4 font-['Inter'] text-sm sm:text-base md:text-lg leading-6 md:leading-7 text-[#5D5E63]">
            Each timepiece in this collection is crafted with uncompromising precision, built to
            be worn for generations.
          </p>
        </div>
      </section>

      {/* Search context banner — only shows when arriving from a Navbar search */}
      {search && (
        <section className="mx-auto flex max-w-[1536px] flex-col gap-2 border-b border-[#C4C7C7]/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="font-['Inter'] text-sm text-[#1A1C1C]">
            Search results for <span className="font-semibold">"{search}"</span>
          </p>
          <button
            onClick={clearSearch}
            className="flex items-center gap-1 font-['Inter'] text-xs font-semibold uppercase tracking-wide text-[#5D5E63] transition-colors duration-200 hover:text-black"
          >
            <X size={14} />
            Clear search
          </button>
        </section>
      )}

      {/* Filter bar */}
      <section className="mx-auto flex max-w-[1536px] flex-col gap-4 border-b border-[#C4C7C7]/20 px-5 py-5 sm:py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-5 sm:gap-8">
          <div className="flex flex-col">
            <label htmlFor="material" className="font-['Inter'] text-xs uppercase text-[#5D5E63]">
              Material
            </label>
            <select
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-transparent font-['Inter'] text-sm sm:text-base text-black outline-none"
            >
              {MATERIAL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="for" className="font-['Inter'] text-xs uppercase text-[#5D5E63]">
              For
            </label>
            <select
              id="for"
              value={productFor}
              onChange={(e) => setProductFor(e.target.value)}
              className="bg-transparent font-['Inter'] text-sm sm:text-base text-black outline-none"
            >
              {FOR_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="font-['Inter'] text-[11px] sm:text-xs font-semibold uppercase text-[#5D5E63]">
          Showing {products.length} of {totalProducts} timepieces
        </p>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-[1536px] px-5 py-8 sm:py-10 md:py-12">
        {loading && (
          <p className="py-16 sm:py-24 text-center font-['Inter'] text-sm sm:text-base text-[#5D5E63]">
            Loading timepieces…
          </p>
        )}

        {!loading && fetchError && (
          <p className="py-16 sm:py-24 text-center font-['Inter'] text-sm sm:text-base text-[#DC2626]">
            {fetchError}
          </p>
        )}

        {!loading && !fetchError && products.length === 0 && (
          <p className="py-16 sm:py-24 text-center font-['Inter'] text-sm sm:text-base text-[#5D5E63]">
            {search
              ? `No timepieces match "${search}".`
              : 'No timepieces match these filters.'}
          </p>
        )}

        {!loading && !fetchError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3 lg:gap-y-12">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Load more + pagination */}
      {!loading && !fetchError && totalPages > 1 && (
        <section className="flex flex-col items-center gap-5 sm:gap-6 border-t border-[#C4C7C7]/20 px-5 py-10 sm:py-16">
          {page < totalPages && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-black px-8 py-3.5 sm:px-12 sm:py-4 font-['Inter'] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors duration-200 hover:bg-[#2F3131] active:scale-95 disabled:opacity-60"
            >
              {loadingMore ? 'Loading…' : 'Discover More Timepieces'}
            </button>
          )}

          <p className="font-['Inter'] text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-[#C4C7C7] transition-colors duration-200 hover:bg-[#F3F3F4] disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border border-[#C4C7C7] transition-colors duration-200 hover:bg-[#F3F3F4] disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}