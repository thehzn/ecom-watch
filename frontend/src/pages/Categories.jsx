import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

import classicWatch from '../assets/classic-watch.jpg';
import sportWatch from '../assets/sport-watch.jpg';
import heritageWatch from '../assets/heritage-watch.jpg';
import limitedWatch from '../assets/limited-watch.jpg';

const LIMIT = 12;

const COLLECTIONS = [
  {
    category: 'Luxury Watch',
    label: 'Collection I',
    title: 'Precious Platinum & Royal Gold',
    description:
      'Precious 950 platinum and 18K metals, hand-finished cases, and uncompromising architectural balance.',
    image: classicWatch,
  },
  {
    category: 'Heritage',
    label: 'Collection II',
    title: 'Heritage Classics',
    description:
      'Designs rooted in the manufacture archives, reissued with state-of-the-art silicon mechanics.',
    image: heritageWatch,
  },
  {
    category: 'Contemporary',
    label: 'Collection III',
    title: 'Contemporary Chronographs',
    description:
      'A modern reading of the workshop’s codes — cleaner lines, lighter forged carbon cases, built for everyday precision.',
    image: sportWatch,
  },
  {
    category: 'Complications',
    label: 'Collection IV',
    title: 'Grand Complications',
    description:
      'Tourbillons, perpetual calendars, and moonphase indicators — mechanical storytelling at its most intricate.',
    image: limitedWatch,
  },
];

function ProductCard({ product }) {
  const details = [product.caseMaterial, product.glassType].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
    >
      <div className="aspect-[4/5] w-full overflow-hidden bg-[#141720] p-8 flex items-center justify-center">
        <img
          src={product.mainImage}
          alt={product.modelName}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors">
          {product.modelName}
        </h3>
        {details && (
          <p className="mt-1 text-xs text-gray-400">{details}</p>
        )}
        <p className="mt-3 text-base font-bold text-white">
          ${Number(product.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}

export default function Categories() {
  const { get } = useApi();
  const listingRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const scrollToListing = () => {
    listingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleExplore = (category) => {
    fetchCategory(category);
    requestAnimationFrame(scrollToListing);
  };

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans']">
      
      {/* Hero */}
      <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-16 sm:py-24 text-center relative overflow-hidden">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">
            Established 1924
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">
            The Collections
          </h1>
          <p className="mt-4 text-base text-gray-300 font-normal leading-relaxed">
            Four pillars of watchmaking mastery. Designed to transcend eras and celebrate perpetual mechanics.
          </p>
        </div>
      </section>

      {/* Collection Highlights */}
      <div className="max-w-[1600px] mx-auto px-6 py-16 flex flex-col gap-16">
        {COLLECTIONS.map((c, idx) => (
          <div
            key={c.category}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#0E1015] border border-white/10 rounded-3xl p-8 sm:p-12 ${
              idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
            }`}
          >
            <div className={`lg:col-span-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
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
                onClick={() => handleExplore(c.category)}
                className="mt-8 inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all shadow-lg"
              >
                <span>View Timepieces</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Listing for Selected Collection */}
      <section ref={listingRef} className="w-full border-t border-white/10 bg-[#0B0D12] px-6 py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {COLLECTIONS.map((c) => {
              const isActive = selectedCategory === c.category;
              return (
                <button
                  key={c.category}
                  onClick={() => fetchCategory(c.category)}
                  className={`text-xs font-bold uppercase tracking-[0.18em] px-6 py-3 rounded-full transition-all border ${
                    isActive
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-[#141720] text-gray-300 border-white/15 hover:border-white/40'
                  }`}
                >
                  {c.category}
                </button>
              );
            })}
          </div>

          {!selectedCategory && (
            <p className="py-16 text-center text-gray-400">
              Select a collection above to examine available models.
            </p>
          )}

          {selectedCategory && loading && (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-400">Loading collection...</p>
            </div>
          )}

          {selectedCategory && !loading && fetchError && (
            <p className="py-24 text-center text-red-400">{fetchError}</p>
          )}

          {selectedCategory && !loading && !fetchError && products.length === 0 && (
            <p className="py-24 text-center text-gray-400">
              No timepieces found in this collection.
            </p>
          )}

          {selectedCategory && !loading && !fetchError && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pagedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}