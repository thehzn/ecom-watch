import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const SPEC_FIELDS = [
  { key: 'movement', label: 'Movement' },
  { key: 'caliber', label: 'Caliber' },
  { key: 'powerReserve', label: 'Power Reserve' },
  { key: 'caseMaterial', label: 'Case Material' },
  { key: 'waterResistance', label: 'Water Resistance' },
  { key: 'caseSize', label: 'Case Size' },
];

function InfoField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p
        className="uppercase"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#5D5E63' }}
      >
        {label}
      </p>
      <p className="mt-1 text-black" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>
        {value}
      </p>
    </div>
  );
}

function RelatedCard({ product }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="group block w-[260px] flex-shrink-0 cursor-pointer"
    >
      <div
        className="flex aspect-[4/5] w-full items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#F3F3F4' }}
      >
        <img
          src={product.mainImage}
          alt={product.modelName}
          className="h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <h4
        className="mt-4 text-black"
        style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '20px', fontWeight: 400 }}
      >
        {product.modelName}
      </h4>
      <p
        className="mt-1 uppercase"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#5D5E63' }}
      >
        ${Number(product.price).toLocaleString()}
      </p>
    </Link>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { get, post } = useApi();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [related, setRelated] = useState([]);
  const scrollerRef = useRef(null);

  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState('');
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await get(`/apiproduct/getsingleproduct/${id}`);
        if (cancelled) return;
        setProduct(data.product || null);

        // Related products: same category, excluding current
        if (data.product?.category) {
          try {
            const relatedData = await get(
              `/apiproduct/getallproducts?category=${encodeURIComponent(data.product.category)}&limit=6`
            );
            if (!cancelled) {
              setRelated((relatedData.products || []).filter((p) => p._id !== id));
            }
          } catch {
            // related products are non-critical, fail silently
          }
        }
      } catch (err) {
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
    setCartError('');
    setAddedMessage('');
    try {
      await post('/apicarts/addtocart', { ProductId: id, quantity: 1 });
      setAddedMessage('Added to your collection.');
      setTimeout(() => setAddedMessage(''), 2500);
    } catch (err) {
      setCartError('Unable to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const scrollRelated = (direction) => {
    if (!scrollerRef.current) return;
    const amount = 280;
    scrollerRef.current.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#5D5E63' }}>Loading…</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: '#F9F9F9' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#5D5E63' }}>Product not found.</p>
        <Link to="/shop" className="text-black underline">
          Back to Collection
        </Link>
      </div>
    );
  }

  const availableSpecs = SPEC_FIELDS.filter((f) => product[f.key]);

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="w-full px-5 py-16" style={{ backgroundColor: '#F9F9F9' }}>
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image */}
          <div
            className="group flex aspect-square w-full items-center justify-center overflow-hidden"
            style={{ backgroundColor: '#F3F3F4' }}
          >
            <img
              src={product.mainImage}
              alt={product.modelName}
              className="h-full w-full object-contain p-12 transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
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
              {product.category}
            </span>

            <h1
              className="text-black"
              style={{
                fontFamily: "'Libre Caslon Text', serif",
                fontSize: '40px',
                fontWeight: 400,
                lineHeight: '48px',
              }}
            >
              {product.modelName}
            </h1>

            <p style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '24px', color: '#5D5E63' }}>
              ${Number(product.price).toLocaleString()}
            </p>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px', color: '#5D5E63' }}>
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-6 border-t border-b py-6" style={{ borderColor: 'rgba(196,199,199,0.3)' }}>
              <InfoField label="Product Name" value={product.modelName} />
              <InfoField label="SKU" value={product.sku} />
              <InfoField label="Collection" value={product.category} />
              <InfoField label="Description" value={product.description} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 bg-black uppercase text-white transition-opacity duration-300 hover:opacity-90 disabled:opacity-60"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, padding: '16px' }}
              >
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>
              <Link
                to="/enquiry"
                className="flex-1 border border-black text-center uppercase text-black transition-colors duration-300 hover:bg-black hover:text-white"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, padding: '16px' }}
              >
                Enquire for Bespoke
              </Link>
            </div>

            {addedMessage && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#000000' }}>{addedMessage}</p>
            )}
            {cartError && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#DC2626' }}>{cartError}</p>
            )}
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      {availableSpecs.length > 0 && (
        <section className="w-full px-5 py-16">
          <div className="mx-auto max-w-[1440px]">
            <h2
              className="mb-10 text-black"
              style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '32px', fontWeight: 400 }}
            >
              Technical Specs
            </h2>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
              {availableSpecs.map((f) => (
                <InfoField key={f.key} label={f.label} value={product[f.key]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <section className="w-full px-5 py-16" style={{ backgroundColor: '#F9F9F9' }}>
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-8 flex items-center justify-between">
              <h2
                className="text-black"
                style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '32px', fontWeight: 400 }}
              >
                The Collection
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRelated('prev')}
                  className="flex h-10 w-10 items-center justify-center border border-black transition-colors duration-200 hover:bg-black hover:text-white"
                  aria-label="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollRelated('next')}
                  className="flex h-10 w-10 items-center justify-center border border-black transition-colors duration-200 hover:bg-black hover:text-white"
                  aria-label="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div ref={scrollerRef} className="flex gap-8 overflow-x-auto scroll-smooth pb-4">
              {related.map((p) => (
                <RelatedCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
