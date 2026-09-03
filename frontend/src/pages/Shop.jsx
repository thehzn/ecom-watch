import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, X, Heart, Search } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { addToWishlistLocal } from '../redux/wishlistSlice';

const LIMIT = 12;

const MATERIAL_OPTIONS = ['All Materials','Stainless Steel','Titanium','Gold','Rose Gold','Platinum','Ceramic',];

const FOR_OPTIONS = ['All', 'Men', 'Women', 'Children'];

function ProductCard({ product }) {
  const { post } = useApi();
  const dispatch = useDispatch();

  const details = [product.caseMaterial, product.glassType]
    .filter(Boolean)
    .join(' · ');

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
      // silently ignore
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
          aria-label={
            wishlisted ? 'Added to wishlist' : 'Add to wishlist'
          }
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all disabled:opacity-60"
        >
          <Heart
            size={16}
            className={
              wishlisted
                ? 'fill-white text-white'
                : 'text-white'
            }
          />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            {product.category || 'Haute Horlogerie'}
          </span>

          <span className="text-[9px] uppercase tracking-widest text-gray-400 px-2 py-0.5 bg-white/5 rounded border border-white/10">
            {product.productFor || 'Men'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-1">
          {product.modelName}
        </h3>

        {details && (
          <p className="text-xs text-gray-400 font-normal">
            {details}
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-base font-bold text-white">
            ₹{Number(product.price).toLocaleString()}
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

  const [searchProducts, setSearchProducts] = useState([]);
  const [normalProducts, setNormalProducts] = useState([]);

  const [page, setPage] = useState(1);

  const [material, setMaterial] = useState('All Materials');

  /*
    IMPORTANT:
    Search and "For" filter are independent.

    Do NOT automatically set this from search.
  */
  const [productFor, setProductFor] = useState('All');

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  
  const [forFilterChanged, setForFilterChanged] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setFetchError('');

    try {
      if (search.trim()) {
        const [searchData, allData] = await Promise.all([
          get(
            `/apiproduct/searchProduct?search=${encodeURIComponent(
              search.trim()
            )}`
          ),
          get('/apiproduct/getallproducts'),
        ]);

        setSearchProducts(searchData?.products || []);
        setNormalProducts(allData?.products || []);
      } else {
        const data = await get('/apiproduct/getallproducts');

        setNormalProducts(data?.products || []);
        setSearchProducts([]);
      }

      setPage(1);
    } catch (error) {
      console.error('Shop products error:', error);

      setSearchProducts([]);
      setNormalProducts([]);

      setFetchError(
        'Unable to load products right now.'
      );
    } finally {
      setLoading(false);
    }
  }, [get, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /*
    When Navbar search changes, reset the filters.

    We do NOT set Men/Women/Children automatically.
  */
  useEffect(() => {
    setMaterial('All Materials');
    setProductFor('All');
    setForFilterChanged(false);
    setPage(1);
  }, [search]);

  let sourceProducts;

  if (search.trim() && forFilterChanged) {
    sourceProducts = normalProducts;
  } else if (search.trim()) {
    sourceProducts = searchProducts;
  } else {
    sourceProducts = normalProducts;
  }
  const filteredProducts = sourceProducts.filter((product) => {
    const materialMatch =
      material === 'All Materials' ||
      product.caseMaterial?.trim().toLowerCase() ===
        material.trim().toLowerCase();
    const productForMatch =
      productFor === 'All' ||
      product.productFor?.trim().toLowerCase() ===
        productFor.trim().toLowerCase();

    return materialMatch && productForMatch;
  });

  /*
    FRONTEND PAGINATION
  */
  const totalProducts = filteredProducts.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / LIMIT)
  );

  const pagedProducts = filteredProducts.slice(
    (page - 1) * LIMIT,
    page * LIMIT
  );

  /*
    Previous page
  */
  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  /*
    Next page
  */
  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  /*
    Material change
  */
  const handleMaterialChange = (value) => {
    setMaterial(value);
    setPage(1);
  };

  /*
    For filter change

    IMPORTANT:
    If there is a search, selecting Men/Women/Children
    switches the source from searchProducts to
    normalProducts.
  */
  const handleProductForChange = (value) => {
    setProductFor(value);
    setPage(1);

    if (search.trim()) {
      setForFilterChanged(true);
    }
  };

  /*
    Clear Navbar search
  */
  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);

    next.delete('search');

    setSearchParams(next);

    setMaterial('All Materials');
    setProductFor('All');
    setForFilterChanged(false);
    setPage(1);
  };

  /*
    Reset filters
  */
  const resetFilters = () => {
    setMaterial('All Materials');

    if (search) {
      setProductFor('All');
      setForFilterChanged(false);
      setPage(1);
    } else {
      setProductFor('All');
      setPage(1);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans']">

      {/* HERO */}
      <section className="w-full bg-[#0B0D12] border-b border-white/10 px-5 py-14 sm:py-20 text-center relative overflow-hidden">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">

          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">
            Limited Release
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            {search
              ? 'Search Results'
              : 'Fine Timepiece Collection'}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            {search
              ? `Displaying all handcrafted timepieces matching "${search}"`
              : 'Each timepiece in this collection is crafted with uncompromising precision, built to be worn for generations.'}
          </p>

        </div>
      </section>

      {/* SEARCH HEADER */}
      {search && (
        <section className="mx-auto flex max-w-[1600px] flex-col gap-2 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">
            <Search
              size={16}
              className="text-gray-400"
            />

            <p className="text-sm text-gray-300">
              Search results for{' '}
              <span className="font-bold text-white">
                "{search}"
              </span>
            </p>
          </div>

          <button
            onClick={clearSearch}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
            Clear search
          </button>

        </section>
      )}

      {/* FILTER BAR */}
      <section className="mx-auto flex max-w-[1600px] flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-[#08090C]/90 backdrop-blur-md sticky top-[68px] z-30">

        <div className="flex flex-wrap items-center gap-6 sm:gap-8">

          {/* MATERIAL */}
          <div className="flex flex-col">

            <label
              htmlFor="material"
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1"
            >
              Material
            </label>

            <select
              id="material"
              value={material}
              onChange={(e) =>
                handleMaterialChange(e.target.value)
              }
              className="bg-[#141720] border border-white/15 text-white text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-white transition-colors cursor-pointer"
            >
              {MATERIAL_OPTIONS.map((m) => (
                <option
                  key={m}
                  value={m}
                  className="bg-[#141720] text-white"
                >
                  {m}
                </option>
              ))}
            </select>

          </div>

          {/* FOR */}
          <div className="flex flex-col">

            <label
              htmlFor="for"
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1"
            >
              For
            </label>

            <select
              id="for"
              value={productFor}
              onChange={(e) =>
                handleProductForChange(e.target.value)
              }
              className="bg-[#141720] border border-white/15 text-white text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-white transition-colors cursor-pointer"
            >
              {FOR_OPTIONS.map((f) => (
                <option
                  key={f}
                  value={f}
                  className="bg-[#141720] text-white"
                >
                  {f === 'All'
                    ? 'All Editions'
                    : `${f}'s Collection`}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* PRODUCT COUNT */}
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Showing {pagedProducts.length} of {totalProducts} timepieces
        </p>

      </section>

      {/* PRODUCT SECTION */}
      <section className="mx-auto max-w-[1600px] px-6 py-12 sm:py-16">

        {/* LOADING */}
        {loading && (
          <div className="py-24 text-center">

            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm text-gray-400">
              Loading timepieces…
            </p>

          </div>
        )}

        {/* ERROR */}
        {!loading && fetchError && (
          <p className="py-24 text-center text-sm text-red-400">
            {fetchError}
          </p>
        )}

        {/* EMPTY */}
        {!loading &&
          !fetchError &&
          filteredProducts.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center">

              <p className="text-base text-gray-400">
                {search
                  ? `No timepieces match "${search}" with the selected filters.`
                  : 'No timepieces match these filters.'}
              </p>

              <button
                onClick={resetFilters}
                className="mt-4 text-white underline text-xs uppercase tracking-wider font-bold"
              >
                Reset Filters
              </button>

            </div>
          )}

        {/* PRODUCT GRID */}
        {!loading &&
          !fetchError &&
          pagedProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-8">

              {pagedProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                />
              ))}

            </div>
          )}

      </section>

      {/* PAGINATION */}
      {!loading &&
        !fetchError &&
        totalPages > 1 && (
          <section className="flex flex-col items-center gap-6 border-t border-white/10 px-5 py-16">

            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-3">

              {/* PREVIOUS */}
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white hover:border-white transition-colors disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {/* NEXT */}
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
