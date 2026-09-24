import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trash2, Heart, ArrowRight, Loader2, Crown, LayoutDashboard, Compass } from 'lucide-react';
import { removeFromWishlist, setWishlist } from '../redux/wishlistSlice';
import { addOrIncrementCartItem } from '../redux/cartSlice';
import { useApi } from '../hooks/useApi';

export default function Wishlist() {
  const items = useSelector((state) => state.wishlist?.items || []);
  const user = useSelector((state) => state.auth?.user);
  const isAdmin = user?.role === 'admin';
  const dispatch = useDispatch();
  const { get, del, post } = useApi();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // 1. Fetch Wishlist on Mount
  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchWishlist = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const response = await get('/apiwishlist/getwishlists', {
          allowNotFound: true,
          allowForbidden: true,
        });

        const wishlistData = Array.isArray(response)
          ? response
          : (response?.products || response?.wishlist || []);

        if (isMounted) {
          if (dispatch && setWishlist) {
            dispatch(setWishlist(wishlistData));
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load wishlist:', err);
          setFetchError(err?.message || 'Could not load your wishlist. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWishlist();

    return () => {
      isMounted = false;
    };
  }, [get, dispatch, isAdmin]);

  // 2. Delete Wishlist Item via API
  const handleRemove = async (id) => {
    dispatch(removeFromWishlist(id));
    try {
      await del(`/apiwishlist/removefromlist/${id}`, {
        method: 'DELETE',
        allowNotFound: true,
        allowForbidden: true,
      });
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
    }
  };

  // 3. Add to Cart Handler
  const handleAddToCart = async (product) => {
    if (isAdmin) return;
    dispatch(addOrIncrementCartItem(product));
    try {
      await post('/apicarts/addtocart', { ProductId: product._id, quantity: 1 });
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Administrator Storefront Preview View
  if (isAdmin) {
    return (
      <div className="min-h-[75vh] bg-[#08090C] flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/30 text-[#C5A880] text-xs font-semibold uppercase tracking-widest mb-6">
          <Crown size={14} />
          <span>Administrator Storefront Preview</span>
        </div>

        <h1 className="font-caslon text-3xl sm:text-4xl lg:text-5xl text-white max-w-2xl leading-tight">
          Client Private Vault
        </h1>

        <p className="mt-4 text-sm sm:text-base text-white/60 max-w-lg font-normal leading-relaxed">
          You are previewing the Chronos boutique under administrator credentials. The private wishlist vault is tailored for registered customer clients.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 bg-[#C5A880] hover:bg-[#d8bd95] text-black text-xs font-bold uppercase tracking-[0.2em] px-7 py-3.5 rounded-lg transition-all shadow-lg shadow-[#C5A880]/15"
          >
            <LayoutDashboard size={15} />
            <span>Admin Dashboard</span>
          </Link>

          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 bg-[#12151B] hover:bg-[#1A1E26] border border-white/20 text-white text-xs font-semibold uppercase tracking-[0.16em] px-6 py-3.5 rounded-lg transition-all"
          >
            <span>Manage Products</span>
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs uppercase tracking-[0.16em] px-4 py-3.5 transition-colors"
          >
            <Compass size={14} />
            <span>Browse Timepieces</span>
          </Link>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#08090C] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A880] mb-4" />
        <p className="text-sm font-medium tracking-wide text-gray-400">Loading your collection...</p>
      </div>
    );
  }

  // Error State
  if (fetchError) {
    return (
      <div className="min-h-[70vh] bg-[#08090C] flex flex-col items-center justify-center text-center px-6">
        <p className="text-red-400 text-sm mb-4">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#E4CA99] border border-[#C5A880]/30 text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-lg transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#08090C] flex flex-col items-center justify-center text-center px-6 ">
        <div className="w-16 h-16 rounded-full bg-[#12151B] border border-white/10 flex items-center justify-center text-[#C5A880] mb-6">
          <Heart size={28} />
        </div>
        <h2 className="font-caslon text-3xl sm:text-4xl text-white">Your Wishlist is Empty</h2>
        <p className="mt-3 text-sm text-white/60 max-w-sm font-normal">
          Save your favorite master timepieces to curate your personal collection.
        </p>
        <Link
          to="/shop"
          className="mt-8 bg-[#C5A880] hover:bg-[#d8bd95] text-black text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-lg transition-all shadow-lg shadow-[#C5A880]/10"
        >
          Explore Timepieces
        </Link>
      </div>
    );
  }

  // Wishlist Grid
  return (
    <div className="min-h-screen bg-[#08090C] text-white py-12 px-5 sm:px-8 ">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C5A880]">
            Private Collection
          </span>
          <h1 className="font-caslon text-3xl sm:text-4xl text-white mt-1">
            Curated Wishlist ({items.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((product) => (
            <div
              key={product._id}
              className="group bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#C5A880]/50"
            >
              <div className="relative aspect-[4/5] bg-[#141720] p-6 flex items-center justify-center">
                <img
                  src={product.mainImage}
                  alt={product.modelName}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                />
                <button
                  onClick={() => handleRemove(product._id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-gray-400 hover:text-rose-400 hover:border-rose-400/30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
                  {product.category}
                </span>
                <h3 className="font-caslon text-lg text-white line-clamp-1">
                  {product.modelName}
                </h3>
                <p className="font-caslon text-base text-white/90">
                  ₹{Number(product.price).toLocaleString()}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-[#C5A880] hover:bg-[#d8bd95] text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all shadow-sm"
                  >
                    Add to Bag
                  </button>
                  <Link
                    to={`/product/${product._id}`}
                    className="px-3 py-2.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-white/80 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}