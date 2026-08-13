import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

import classicWatch from '../assets/classic-watch.jpg';
import sportWatch from '../assets/sport-watch.jpg';
import heritageWatch from '../assets/heritage-watch.jpg';
import limitedWatch from '../assets/limited-watch.jpg';

const LIMIT = 12;

// Mapped 1:1 to the Product schema's `category` enum — these values are sent
// as-is to /apiproduct/getallproducts?category=...
const COLLECTIONS = [
  {
    category: 'Luxury Watch',
    label: 'Collection I',
    title: 'Luxury Watch',
    description:
      'Precious metals, hand-finished cases and uncompromising detail — timepieces built to be handed down, not worn out.',
    image: classicWatch,
  },
  {
    category: 'Heritage',
    label: 'Collection II',
    title: 'Heritage',
    description:
      'Designs rooted in the archive, reissued for a new generation while staying true to the silhouettes that defined the house.',
    image: heritageWatch,
  },
  {
    category: 'Contemporary',
    label: 'Collection III',
    title: 'Contemporary',
    description:
      'A modern reading of the workshop\u2019s codes — cleaner lines, lighter cases, built for everyday precision.',
    image: sportWatch,
  },
  {
    category: 'Complications',
    label: 'Collection IV',
    title: 'Complications',
    description:
      'Chronographs, moonphases and perpetual calendars \u2014 mechanical storytelling at its most intricate.',
    image: limitedWatch,
  },
];

// Same product card used on the Shop page, kept in sync intentionally.
function ProductCard({ product }) {
  const details = [product.caseMaterial, product.glassType].filter(Boolean).join(' \u00b7 ');

  return (
    <Link to={`/product/${product._id}`} className="group block cursor-pointer">
      <div className="aspect-[4/5] w-full overflow-hidden">
        <img
          src={product.mainImage}
          alt={product.modelName}
          className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
          style={{ filter: 'grayscale(0.2)' }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = 'grayscale(0)')}
          onMouseLeave={(e) => (e.currentTarget.style.filter = 'grayscale(0.2)')}
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3
            className="text-black"
            style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '24px', fontWeight: 400 }}
          >
            {product.modelName}
          </h3>
          {details && (
            <p className="mt-1" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}>
              {details}
            </p>
          )}
        </div>
        <p
          className="whitespace-nowrap text-right text-black"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 600 }}
        >
          ${Number(product.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}

function CategoryHero() {
  return (
    <section className="w-full px-5 py-16" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="mx-auto flex max-w-[1536px] flex-col items-center text-center">
        <h1
          className="text-black"
          style={{
            fontFamily: "'Libre Caslon Text', serif",
            fontWeight: 400,
            lineHeight: '110%',
            fontSize: 'clamp(40px, 9vw, 120px)',
          }}
        >
          The Collections
        </h1>
        <p
          className="mt-6"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: '28px',
            color: '#5D5E63',
            maxWidth: '520px',
          }}
        >
          Four collections, one philosophy: every timepiece is built to outlast the trends it was
          designed within.
        </p>
        <span
          className="mt-8 inline-block pb-1 uppercase"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#000000',
            borderBottom: '1px solid #000000',
          }}
        >
          Established 1924
        </span>
      </div>
    </section>
  );
}

function CollectionSection({ label, title, description, image, onExplore }) {
  return (
    <section className="w-full px-5 py-16">
      <div className="mx-auto grid max-w-[1536px] grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="w-full overflow-hidden" style={{ aspectRatio: '4 / 3', height: '600px' }}>
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-all duration-700 ease-out hover:brightness-110"
            style={{ filter: 'grayscale(1)' }}
          />
        </div>

        <div className="flex flex-col items-start">
          <span
            className="uppercase"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#5D5E63',
            }}
          >
            {label}
          </span>
          <h2
            className="mt-3 text-black"
            style={{
              fontFamily: "'Libre Caslon Text', serif",
              fontSize: '32px',
              fontWeight: 400,
              lineHeight: '40px',
            }}
          >
            {title}
          </h2>
          <p
            className="mt-4"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
              color: '#5D5E63',
            }}
          >
            {description}
          </p>
          <button
            onClick={onExplore}
            className="mt-8 bg-black text-white transition-opacity duration-300 hover:opacity-90"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '16px 32px',
            }}
          >
            Explore the Collection
          </button>
        </div>
      </div>
    </section>
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

  // NOTE: /apiproduct/getallproducts currently ignores page/limit query params
  // and returns the full filtered list with no pagination metadata, so
  // pagination here is handled client-side against the full result set.
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
    // give the fetch a tick to kick off before scrolling
    requestAnimationFrame(scrollToListing);
  };

  const handleLoadMore = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#FFFFFF' }}>
      <CategoryHero />

      {COLLECTIONS.map((c) => (
        <CollectionSection key={c.category} {...c} onExplore={() => handleExplore(c.category)} />
      ))}

      {/* Category picker + product listing */}
      <section ref={listingRef} className="w-full border-t px-5 py-16" style={{ borderColor: 'rgba(196,199,199,0.2)' }}>
        <div className="mx-auto max-w-[1536px]">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {COLLECTIONS.map((c) => {
              const isActive = selectedCategory === c.category;
              return (
                <button
                  key={c.category}
                  onClick={() => fetchCategory(c.category)}
                  className="border transition-colors duration-200"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '12px 28px',
                    borderColor: isActive ? '#000000' : '#C4C7C7',
                    backgroundColor: isActive ? '#000000' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#000000',
                  }}
                >
                  {c.title}
                </button>
              );
            })}
          </div>

          {!selectedCategory && (
            <p
              className="mt-16 text-center"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}
            >
              Select a collection above to view its timepieces.
            </p>
          )}

          {selectedCategory && loading && (
            <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#5D5E63' }}>
              Loading timepieces\u2026
            </p>
          )}

          {selectedCategory && !loading && fetchError && (
            <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>
              {fetchError}
            </p>
          )}

          {selectedCategory && !loading && !fetchError && products.length === 0 && (
            <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#5D5E63' }}>
              No timepieces in this collection yet.
            </p>
          )}

          {selectedCategory && !loading && !fetchError && products.length > 0 && (
            <>
              <p
                className="mt-10 mb-6 text-center uppercase"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#5D5E63' }}
              >
                Showing {pagedProducts.length} of {products.length} timepieces
              </p>

              <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {pagedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-16 flex flex-col items-center gap-6 border-t pt-16" style={{ borderColor: 'rgba(196,199,199,0.2)' }}>
                  {page < totalPages && (
                    <button
                      onClick={handleLoadMore}
                      className="bg-black text-white transition-colors duration-200 hover:bg-[#2F3131] active:scale-95"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '16px 48px',
                      }}
                    >
                      Discover More Timepieces
                    </button>
                  )}

                  <p
                    className="uppercase"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      color: '#5D5E63',
                    }}
                  >
                    Page {page} of {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={page === 1}
                      className="flex h-10 w-10 items-center justify-center border transition-colors duration-200 hover:bg-[#F3F3F4] disabled:opacity-40"
                      style={{ borderColor: '#C4C7C7' }}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={page === totalPages}
                      className="flex h-10 w-10 items-center justify-center border transition-colors duration-200 hover:bg-[#F3F3F4] disabled:opacity-40"
                      style={{ borderColor: '#C4C7C7' }}
                      aria-label="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
