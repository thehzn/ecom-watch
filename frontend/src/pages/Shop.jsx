
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
import { ChevronLeft, ChevronRight, X, Heart, Filter } from 'lucide-react';
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
    e.preventDefault();
    e.stopPropagation();
    if (saving || wishlisted) return;
    setSaving(true);
    try {
      await post(`/apiwishlist/addwishlist/${product._id}`);
      dispatch(addToWishlistLocal(product));
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative block bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.06)]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#141720] p-8 flex items-center justify-center">
        <img
          src={product.mainImage}
          alt={product.modelName}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />

        <button
          onClick={handleWishlist}
          disabled={saving || wishlisted}
          aria-label={wishlisted ? 'Added to wishlist' : 'Add to wishlist'}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all disabled:opacity-60"
        >
          <Heart
            size={15}
            className={wishlisted ? 'fill-white text-white' : 'text-white'}
          />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          {product.category || 'Haute Horlogerie'}
        </span>

        <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-1">
          {product.modelName}
        </h3>

        {details && (
          <p className="text-xs text-gray-400 font-normal">{details}</p>
        )}

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-base font-bold text-white">
            ${Number(product.price).toLocaleString()}
          </p>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            In Stock
          </span>
        </div>
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
        setTotalProducts(data.totalProducts || fetched.length);
        setPage(pageNum);
      } catch {
        setFetchError('Unable to load timepieces right now.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [get, buildQuery]
  );

  useEffect(() => {
    fetchProducts(1, { append: false });
  }, [material, productFor, search, fetchProducts]);

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
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans']">
      
      {/* Header Banner */}
      <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-14 sm:py-20 text-center relative overflow-hidden">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">
            The Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Fine Timepiece Collection
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            Discover our curated portfolio of chronometers, perpetual calendars, and titanium grand complications.
          </p>
        </div>
      </section>

      {/* Active Search Banner */}
      {search && (
        <section className="mx-auto flex max-w-[1600px] flex-col gap-2 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-300">
            Search results for <span className="text-white font-bold">"{search}"</span>
          </p>
          <button
            onClick={clearSearch}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
            Clear filter
          </button>
        </section>
      )}

      {/* Filter Bar */}
      <section className="mx-auto flex max-w-[1600px] flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-[#08090C]/90 backdrop-blur-md sticky top-[68px] z-30">
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-white" />
            <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Filters:</span>
          </div>

          <div className="flex flex-col">
            <select
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-[#141720] border border-white/15 text-gray-200 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-white transition-colors"
            >
              {MATERIAL_OPTIONS.map((m) => (
                <option key={m} value={m} className="bg-[#141720] text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <select
              id="for"
              value={productFor}
              onChange={(e) => setProductFor(e.target.value)}
              className="bg-[#141720] border border-white/15 text-gray-200 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-white transition-colors"
            >
              {FOR_OPTIONS.map((f) => (
                <option key={f} value={f} className="bg-[#141720] text-white">
                  {f}'s Collection
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Showing {products.length} of {totalProducts} timepieces
        </p>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-[1600px] px-6 py-12 sm:py-16">
        {loading && (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Loading fine timepieces...</p>
          </div>
        )}

        {!loading && fetchError && (
          <p className="py-24 text-center text-sm text-red-400">{fetchError}</p>
        )}

        {!loading && !fetchError && products.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center">
            <p className="text-base text-gray-400">
              {search
                ? `No timepieces match "${search}".`
                : 'No timepieces found for the selected criteria.'}
            </p>
            <button
              onClick={() => {
                setMaterial('All Materials');
                clearSearch();
              }}
              className="mt-4 text-white underline text-xs uppercase tracking-wider font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {!loading && !fetchError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-8">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination Controls */}
      {!loading && !fetchError && totalPages > 1 && (
        <section className="flex flex-col items-center gap-6 border-t border-white/10 px-5 py-16">
          {page < totalPages && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-white text-black px-10 py-3.5 text-xs font-bold uppercase tracking-[0.18em] rounded-full hover:bg-gray-200 transition-all shadow-lg disabled:opacity-60"
            >
              {loadingMore ? 'Loading...' : 'Discover More Models'}
            </button>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white hover:border-white transition-colors disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white hover:border-white transition-colors disabled:opacity-30"
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