

// export default function Wishlist() {
//   const { get, post, del } = useApi();

//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fetchError, setFetchError] = useState('');
//   const [addStateByProduct, setAddStateByProduct] = useState({});

//   const fetchWishlist = useCallback(async () => {
//     setLoading(true);
//     setFetchError('');
//     try {
//       const data = await get('/apiwishlist/getwishlists');
//       setItems(data?.products || []);
//     } catch (err) {
//       // Treat "no wishlist yet" as empty rather than an error, same as
//       // getCart returning 404 when nothing has been added yet.
//       if (err.message && err.message.toLowerCase().includes('not found')) {
//         setItems([]);
//       } else {
//         setFetchError('Unable to load your selection right now.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [get]);

//   useEffect(() => {
//     fetchWishlist();
//   }, [fetchWishlist]);

//   const handleRemove = async (productId) => {
//     const prevItems = items;
//     // optimistic remove
//     setItems((curr) => curr.filter((item) => item._id !== productId));
//     try {
//       await del(`/apiwishlist/deletewishlistproduct/${productId}`);
//     } catch {
//       setItems(prevItems); // roll back on failure
//     }
//   };

//   const handleAddToCart = async (productId) => {
//     setAddStateByProduct((s) => ({ ...s, [productId]: 'loading' }));
//     try {
//       await post('/apicarts/addtocart', { ProductId: productId, quantity: 1 });
//       setAddStateByProduct((s) => ({ ...s, [productId]: 'added' }));
//       setTimeout(() => {
//         setAddStateByProduct((s) => ({ ...s, [productId]: 'idle' }));
//       }, 2000);
//     } catch {
//       setAddStateByProduct((s) => ({ ...s, [productId]: 'idle' }));
//     }
//   };

//   return (
//     <div className="min-h-screen w-full" style={{ backgroundColor: '#FFFFFF' }}>
//       {/* Hero */}
//       <section className="w-full px-5 py-16" style={{ backgroundColor: '#F9F9F9' }}>
//         <div className="mx-auto flex max-w-[1536px] flex-col items-center text-center">
//           <h1
//             className="text-black"
//             style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '40px', fontWeight: 400 }}
//           >
//             My Selection
//           </h1>
//           <p
//             className="mt-4"
//             style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}
//           >
//             The timepieces you've set aside, all in one place.
//           </p>
//         </div>
//       </section>

//       {loading && (
//         <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#5D5E63' }}>
//           Loading your selection…
//         </p>
//       )}

//       {!loading && fetchError && (
//         <p className="py-24 text-center" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>
//           {fetchError}
//         </p>
//       )}

//       {!loading && !fetchError && items.length === 0 && <EmptyState />}

//       {!loading && !fetchError && items.length > 0 && (
//         <section className="mx-auto max-w-[1536px] px-5 py-16">
//           <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
//             {items.map((product) => (
//               <WishlistCard
//                 key={product._id}
//                 product={product}
//                 onRemove={handleRemove}
//                 onAddToCart={handleAddToCart}
//                 addState={addStateByProduct[product._id] || 'idle'}
//               />
//             ))}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// // }
// import { useSelector, useDispatch } from 'react-redux';
// import { Link } from 'react-router-dom';
// import { Trash2, Heart, ArrowRight } from 'lucide-react';
// import { removeFromWishlist } from '../redux/wishlistSlice';
// import { addOrIncrementCartItem } from '../redux/cartSlice';
// import { useApi } from '../hooks/useApi';

// export default function Wishlist() {
//   const items = useSelector((state) => state.wishlist?.items || []);
//   const dispatch = useDispatch();
//   const { del, post } = useApi();

//   const handleRemove = async (id) => {
//     dispatch(removeFromWishlist(id));
//     try {
//       await del(`/apiwishlist/removewishlist/${id}`);
//     } catch {
//       // ignore
//     }
//   };

//   const handleAddToCart = async (product) => {
//     dispatch(addOrIncrementCartItem(product));
//     try {
//       await post('/apicarts/addtocart', { ProductId: product._id, quantity: 1 });
//     } catch {
//       // ignore
//     }
//   };

//   if (items.length === 0) {
//     return (
//       <div className="min-h-[70vh] bg-[#08090C] flex flex-col items-center justify-center text-center px-6 font-['Plus_Jakarta_Sans']">
//         <div className="w-16 h-16 rounded-full bg-[#12151B] border border-white/20 flex items-center justify-center text-white mb-6">
//           <Heart size={28} />
//         </div>
//         <h2 className="text-3xl font-bold text-white">Your Wishlist is Empty</h2>
//         <p className="mt-3 text-sm text-gray-400 max-w-sm font-normal">
//           Save your favorite master timepieces to curate your personal collection.
//         </p>
//         <Link
//           to="/shop"
//           className="mt-8 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all shadow-lg"
//         >
//           Explore Timepieces
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#08090C] text-white py-12 px-5 sm:px-8 font-['Plus_Jakarta_Sans']">
//       <div className="max-w-[1600px] mx-auto">
//         <div className="mb-10">
//           <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
//             Private Collection
//           </span>
//           <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">
//             Curated Wishlist ({items.length})
//           </h1>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
//           {items.map((product) => (
//             <div
//               key={product._id}
//               className="group bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300"
//             >
//               <div className="relative aspect-[4/5] bg-[#141720] p-6 flex items-center justify-center">
//                 <img src={product.mainImage} alt={product.modelName} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
//                 <button
//                   onClick={() => handleRemove(product._id)}
//                   aria-label="Remove from wishlist"
//                   className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </div>

//               <div className="p-5 flex flex-col gap-2">
//                 <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
//                   {product.category}
//                 </span>
//                 <h3 className="text-lg font-bold text-white line-clamp-1">{product.modelName}</h3>
//                 <p className="text-base font-bold text-white">
//                   ${Number(product.price).toLocaleString()}
//                 </p>

//                 <div className="mt-4 flex gap-2">
//                   <button
//                     onClick={() => handleAddToCart(product)}
//                     className="flex-1 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all"
//                   >
//                     Add to Bag
//                   </button>
//                   <Link
//                     to={`/product/${product._id}`}
//                     className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center justify-center transition-colors"
//                   >
//                     <ArrowRight size={16} />
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trash2, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { removeFromWishlist, setWishlist } from '../redux/wishlistSlice'; // Ensure setWishlistItems exists in your slice
import { addOrIncrementCartItem } from '../redux/cartSlice';
import { useApi } from '../hooks/useApi';

export default function Wishlist() {
  const items = useSelector((state) => state.wishlist?.items || []);
  const dispatch = useDispatch();
  const { get, del, post } = useApi();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // 1. Fetch Wishlist on Mount
  useEffect(() => {
    let isMounted = true;

    const fetchWishlist = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const response = await get('/apiwishlist/getwishlists');
       console.log(response); // see the full shape
console.log(response.products);
        
        // Handle variations in API response structures (e.g. array vs { items: [...] } or { wishlist: [...] })
        const wishlistData = Array.isArray(response) 
          ? response 
          : (response?.products || response?.wishlist || []);

        if (isMounted) {
          // Sync backend data to Redux if you maintain a wishlist reducer
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
  }, [get, dispatch]);

  // 2. Delete Wishlist Item via API
  const handleRemove = async (id) => {
    // Optimistic UI update
    dispatch(removeFromWishlist(id));

    try {
      // Correct API Endpoint matching: router.delete("/removefromlist/:productId")
      await del(`/apiwishlist/removefromlist/${id}`,{
      method: 'DELETE',
      allowNotFound: true
    });
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
      // Optional: Refetch list on error to revert optimistic update
    }
  };

  // 3. Add to Cart Handler
  const handleAddToCart = async (product) => {
    dispatch(addOrIncrementCartItem(product));
    try {
      await post('/apicarts/addtocart', { ProductId: product._id, quantity: 1 });
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#08090C] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-4" />
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
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#08090C] flex flex-col items-center justify-center text-center px-6 font-['Plus_Jakarta_Sans']">
        <div className="w-16 h-16 rounded-full bg-[#12151B] border border-white/20 flex items-center justify-center text-white mb-6">
          <Heart size={28} />
        </div>
        <h2 className="text-3xl font-bold text-white">Your Wishlist is Empty</h2>
        <p className="mt-3 text-sm text-gray-400 max-w-sm font-normal">
          Save your favorite master timepieces to curate your personal collection.
        </p>
        <Link
          to="/shop"
          className="mt-8 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all shadow-lg"
        >
          Explore Timepieces
        </Link>
      </div>
    );
  }

  // Wishlist Grid
  return (
    <div className="min-h-screen bg-[#08090C] text-white py-12 px-5 sm:px-8 font-['Plus_Jakarta_Sans']">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
            Private Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">
            Curated Wishlist ({items.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((product) => (
            <div
              key={product._id}
              className="group bg-[#0E1015] border border-white/10 hover:border-white/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300"
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
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  {product.category}
                </span>
                <h3 className="text-lg font-bold text-white line-clamp-1">
                  {product.modelName}
                </h3>
                <p className="text-base font-bold text-white">
                  ₹{Number(product.price).toLocaleString()}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all"
                  >
                    Add to Bag
                  </button>
                  <Link
                    to={`/product/${product._id}`}
                    className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center justify-center transition-colors"
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