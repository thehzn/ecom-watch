import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, PackageOpen } from 'lucide-react';
import { useApi } from '../hooks/useApi';


function WishlistCard({ product, onRemove, onAddToCart, addState }) {
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(product._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product._id);
  };

  return (
    <Link to={`/product/${product._id}`} className="group block cursor-pointer">
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: '#F3F3F4' }}>
        <div className="aspect-[4/5] w-full">
          <img
            src={product.mainImage}
            alt={product.modelName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <button
          onClick={handleRemove}
          aria-label="Remove from wishlist"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white transition-colors duration-200 hover:bg-black hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4">
        <span
          className="block uppercase"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#5D5E63' }}
        >
          {product.category}
        </span>

        <div className="mt-1 flex items-start justify-between gap-4">
          <h3
            className="text-black"
            style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '24px', fontWeight: 400 }}
          >
            {product.modelName}
          </h3>
          <p
            className="whitespace-nowrap text-right text-black"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: 700 }}
          >
            ${Number(product.price).toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={addState === 'loading'}
          className="mt-4 w-full bg-black text-white transition-colors duration-200 hover:bg-[#2F3131] active:scale-[0.99] disabled:opacity-60"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '14px 0',
          }}
        >
          {addState === 'loading' ? 'Adding…' : addState === 'added' ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-5 py-24 text-center">
      <PackageOpen size={40} color="#5D5E63" strokeWidth={1.5} />
      <h2
        className="mt-6 text-black"
        style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '28px', fontWeight: 400 }}
      >
        Your selection is currently empty
      </h2>
      <p
        className="mt-3 max-w-[420px]"
        style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}
      >
        Browse the collections and save the timepieces you want to come back to.
      </p>
      <Link
        to="/categories"
        className="mt-8 inline-block bg-black text-white transition-opacity duration-300 hover:opacity-90"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '16px 40px',
        }}
      >
        Browse Collections
      </Link>
    </div>
  );
}

export default function Wishlist() {
  const { get, post, del } = useApi();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [addStateByProduct, setAddStateByProduct] = useState({});

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await get('/apiwishlist/getwishlists');
      setItems(data?.products || []);
    } catch (err) {
      // Treat "no wishlist yet" as empty rather than an error, same as
      // getCart returning 404 when nothing has been added yet.
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setItems([]);
      } else {
        setFetchError('Unable to load your selection right now.');
      }
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    const prevItems = items;
    // optimistic remove
    setItems((curr) => curr.filter((item) => item._id !== productId));
    try {
      await del(`/apiwishlist/deletewishlistproduct/${productId}`);
    } catch {
      setItems(prevItems); // roll back on failure
    }
  };

  const handleAddToCart = async (productId) => {
    setAddStateByProduct((s) => ({ ...s, [productId]: 'loading' }));
    try {
      await post('/apicarts/addtocart', { ProductId: productId, quantity: 1 });
      setAddStateByProduct((s) => ({ ...s, [productId]: 'added' }));
      setTimeout(() => {
        setAddStateByProduct((s) => ({ ...s, [productId]: 'idle' }));
      }, 2000);
    } catch {
      setAddStateByProduct((s) => ({ ...s, [productId]: 'idle' }));
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Hero */}
      <section className="w-full px-5 py-16" style={{ backgroundColor: '#F9F9F9' }}>
        <div className="mx-auto flex max-w-[1536px] flex-col items-center text-center">
          <h1
            className="text-black"
            style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '40px', fontWeight: 400 }}
          >
            My Selection
          </h1>
          <p
            className="mt-4"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}
          >
            The timepieces you've set aside, all in one place.
          </p>
        </div>
      </section>

      {loading && (
        <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#5D5E63' }}>
          Loading your selection…
        </p>
      )}

      {!loading && fetchError && (
        <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>
          {fetchError}
        </p>
      )}

      {!loading && !fetchError && items.length === 0 && <EmptyState />}

      {!loading && !fetchError && items.length > 0 && (
        <section className="mx-auto max-w-[1536px] px-5 py-16">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
                addState={addStateByProduct[product._id] || 'idle'}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
