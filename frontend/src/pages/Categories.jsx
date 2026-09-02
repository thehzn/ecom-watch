import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useApi } from '../hooks/useApi';
import { addToWishlistLocal } from '../redux/wishlistSlice';

import categoryLuxuryWatch from '../assets/category_luxury_watch.jpg';
import categoryHeritageWatch from '../assets/category_heritage_watch.jpg';
import categorySportWatch from '../assets/category_sport_watch.jpg';
import categoryContemporaryWatch from '../assets/category_contemporary_watch.jpg';

const LIMIT = 12;

const COLLECTIONS = [
  {
    category: 'Luxury',
    id: 'luxury',
    label: 'Collection I',
    title: 'Luxury Haute Horlogerie',
    description:
      'Precious 950 platinum, solid white gold, and skeletonized sapphire dials hand-finished to perfection.',
    image: categoryLuxuryWatch,
  },
  {
    category: 'Heritage',
    id: 'heritage',
    label: 'Collection II',
    title: 'Heritage Classics',
    description:
      'Vintage Swiss enamel dials, blued steel Breguet hands, and historic manufacture archives reissued.',
    image: categoryHeritageWatch,
  },
  {
    category: 'Sport',
    id: 'sport',
    label: 'Collection III',
    title: 'Sport & Chronograph',
    description:
      'Forged carbon, matte titanium, ceramic tachymeters, and high-performance racing calibres.',
    image: categorySportWatch,
  },
  {
    category: 'Contemporary',
    id: 'contemporary',
    label: 'Collection IV',
    title: 'Contemporary Architectural',
    description:
      'Open-worked geometric flying tourbillons and minimalist titanium monobloc architecture.',
    image: categoryContemporaryWatch,
  },
];

function ProductCard({ product }) {
  const { post } = useApi();
  const dispatch = useDispatch();
  const details = [product.caseMaterial, product.glassType].filter(Boolean).join(' · ');

  const wishlisted = useSelector((state) =>
    state.wishlist.items.some((item) => item._id === product._id)
  );

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) return;
    try {
      await post(`/apiwishlist/addwishlist/${product._id}`);
      dispatch(addToWishlistLocal(product));
    } catch {
      // ignore
    }
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#141720] p-8 flex items-center justify-center">
        <img
          src={product.mainImage}
          alt={product.modelName}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        <button
          onClick={handleWishlist}
          className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <Heart size={14} className={wishlisted ? "fill-white text-white" : ""} />
        </button>
      </div>
      <div className="p-5 flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
          {product.category || 'Haute Horlogerie'}
        </span>
        <h3 className="text-base font-bold text-white group-hover:text-gray-200 transition-colors line-clamp-1">
          {product.modelName}
        </h3>
        {details && (
          <p className="text-xs text-gray-400 line-clamp-1">{details}</p>
        )}
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm font-bold text-white">
            ${Number(product.price).toLocaleString()}
          </p>
          <span className="text-[10px] uppercase tracking-wider text-gray-300 font-bold group-hover:text-white">
            Configure &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Categories() {
  const { get } = useApi();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const listingRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Luxury');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const totalPages = Math.max(1, Math.ceil(products.length / LIMIT));
  const pagedProducts = products.slice((page - 1) * LIMIT, page * LIMIT);

  const fetchCategory = useCallback(
    async (category) => {
      setLoading(true);
      setFetchError('');
      setSelectedCategory(category);
      setPage(1);
      try {
        const params = new URLSearchParams({ category });
        const data = await get(`/apiproduct/getallproducts?${params.toString()}`);
        setProducts(data.products || []);
      } catch {
        setFetchError('Unable to load this collection right now.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  useEffect(() => {
    if (initialCategory) {
      const match = COLLECTIONS.find(
        (c) => c.category.toLowerCase() === initialCategory.toLowerCase()
      );
      if (match) {
        fetchCategory(match.category);
        setTimeout(() => {
          const el = document.getElementById(match.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      } else {
        fetchCategory(initialCategory);
      }
    } else {
      fetchCategory('Luxury');
    }
  }, [initialCategory, fetchCategory]);

  const handleExplore = (category, id) => {
    fetchCategory(category);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans']">
      
      {/* Hero */}
      <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-16 sm:py-24 text-center relative overflow-hidden">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-3">
            <Sparkles size={12} />
            Haute Horlogerie Pillars
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">
            The Collections
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            Explore our four foundational horology collections: Luxury, Heritage, Sport, and Contemporary.
          </p>
        </div>
      </section>

      {/* Collection Highlights */}
      <div className="max-w-[1600px] mx-auto px-6 py-16 flex flex-col gap-16">
        {COLLECTIONS.map((c, idx) => (
          <div
            id={c.id}
            key={c.category}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#0E1015] border rounded-3xl p-8 sm:p-12 transition-all scroll-mt-28 ${
              selectedCategory.toLowerCase() === c.category.toLowerCase()
                ? 'border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                : 'border-white/10'
            } ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
          >
            <div className={`lg:col-span-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#141720]">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className={`lg:col-span-6 flex flex-col items-start ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
                {c.label}
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl text-white font-bold tracking-tight">
                {c.title}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
                {c.description}
              </p>
              <button
                onClick={() => handleExplore(c.category, c.id)}
                className={`mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all shadow-lg ${
                  selectedCategory.toLowerCase() === c.category.toLowerCase()
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white hover:text-black border border-white/20'
                }`}
              >
                <span>{selectedCategory.toLowerCase() === c.category.toLowerCase() ? 'Viewing Collection' : 'Select Collection'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Listing for Selected Collection */}
      <section ref={listingRef} className="w-full border-t border-white/10 bg-[#0B0D12] px-6 py-16">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                Active Catalog
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {selectedCategory} Timepieces
              </h2>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              {products.length} models available
            </p>
          </div>

          {loading && (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-400">Loading {selectedCategory} models…</p>
            </div>
          )}

          {!loading && fetchError && (
            <p className="py-16 text-center text-sm text-red-400">{fetchError}</p>
          )}

          {!loading && !fetchError && products.length === 0 && (
            <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-12 text-center max-w-lg mx-auto">
              <p className="text-sm text-gray-300">
                No timepieces currently listed under {selectedCategory}.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-block text-xs uppercase font-bold text-white underline tracking-wider"
              >
                Explore Full Catalog
              </Link>
            </div>
          )}

          {!loading && !fetchError && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {pagedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {!loading && !fetchError && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-white/10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-white transition-colors disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
