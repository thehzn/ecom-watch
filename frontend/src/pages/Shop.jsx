import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';

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
  const details = [product.caseMaterial, product.glassType].filter(Boolean).join(' · ');

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

export default function Shop() {
  const { get } = useApi();

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
      return `/apiproduct/getallproducts?${params.toString()}`;
    },
    [material, productFor]
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

  // Refetch from page 1 whenever filters change
  useEffect(() => {
    fetchProducts(1, { append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, productFor]);

  const handleLoadMore = () => {
    if (page < totalPages) fetchProducts(page + 1, { append: true });
  };

  const handlePrev = () => {
    if (page > 1) fetchProducts(page - 1, { append: false });
  };

  const handleNext = () => {
    if (page < totalPages) fetchProducts(page + 1, { append: false });
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Collection Hero */}
      <section className="w-full px-5 py-16" style={{ backgroundColor: '#F9F9F9' }}>
        <div className="mx-auto flex max-w-[768px] flex-col items-center text-center">
          <span
            className="uppercase"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              color: '#5D5E63',
            }}
          >
            Limited Release
          </span>
          <h1
            className="mt-4 text-black"
            style={{
              fontFamily: "'Libre Caslon Text', serif",
              fontSize: '40px',
              fontWeight: 400,
              lineHeight: '48px',
            }}
          >
            Collection
          </h1>
          <p
            className="mt-4"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: '#5D5E63',
            }}
          >
            Each timepiece in this collection is crafted with uncompromising precision, built to
            be worn for generations.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section
        className="mx-auto flex max-w-[1536px] flex-col gap-4 border-b px-5 py-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: 'rgba(196,199,199,0.2)' }}
      >
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col">
            <label
              htmlFor="material"
              className="uppercase"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#5D5E63' }}
            >
              Material
            </label>
            <select
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="bg-transparent text-black outline-none"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
            >
              {MATERIAL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="for"
              className="uppercase"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#5D5E63' }}
            >
              For
            </label>
            <select
              id="for"
              value={productFor}
              onChange={(e) => setProductFor(e.target.value)}
              className="bg-transparent text-black outline-none"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
            >
              {FOR_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p
          className="uppercase"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#5D5E63' }}
        >
          Showing {products.length} of {totalProducts} timepieces
        </p>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-[1536px] px-5 py-12">
        {loading && (
          <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#5D5E63' }}>
            Loading timepieces…
          </p>
        )}

        {!loading && fetchError && (
          <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>
            {fetchError}
          </p>
        )}

        {!loading && !fetchError && products.length === 0 && (
          <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#5D5E63' }}>
            No timepieces match these filters.
          </p>
        )}

        {!loading && !fetchError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Load more + pagination */}
      {!loading && !fetchError && totalPages > 1 && (
        <section
          className="flex flex-col items-center gap-6 border-t px-5 py-16"
          style={{ borderColor: 'rgba(196,199,199,0.2)' }}
        >
          {page < totalPages && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-black text-white transition-colors duration-200 hover:bg-[#2F3131] active:scale-95 disabled:opacity-60"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '16px 48px',
              }}
            >
              {loadingMore ? 'Loading…' : 'Discover More Timepieces'}
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
        </section>
      )}
    </div>
  );
}
