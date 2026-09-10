
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, ShoppingBag, ShieldCheck } from "lucide-react";
import { removeCartItem, updateCartQuantity } from "../redux/cartSlice";

export default function Cart() {
  const { get, patch, del } = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [items, setItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await get("/apicarts/getcartitems", { allowNotFound: true });
      setItems(res?.cart?.items ?? []);
      setOrderSummary(res?.orderSummary ?? { subtotal: 0, shipping: 0, tax: 0, total: 0 });
    } catch {
      setItems([]);
      setOrderSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, nextQty) => {
    if (nextQty < 1) return;
    setItems((prev) =>
      prev.map((it) => (it.product._id === productId ? { ...it, quantity: nextQty } : it))
    );
    dispatch(updateCartQuantity({ productId, quantity: nextQty }));
    try {
      await patch("/apicarts/updatequantity", { ProductId: productId, quantity: nextQty });
      loadCart();
    } catch {
      loadCart();
    }
  };

  const handleRemove = async (productId) => {
    setItems((prev) => prev.filter((it) => it.product._id !== productId));
    dispatch(removeCartItem(productId));
    try {
      await del(`/apicarts/deletecartproducts/${productId}`);
      loadCart();
    } catch {
      loadCart();
    }
  };

  const handleCheckout = () => {
    if (user && token) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { from: "/checkout" } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#08090C] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#08090C] flex flex-col items-center justify-center text-center px-6 font-['Plus_Jakarta_Sans']">
        <div className="w-16 h-16 rounded-full bg-[#12151B] border border-white/20 flex items-center justify-center text-white mb-6">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-3xl font-bold text-white">Your Shopping Bag is Empty</h2>
        <p className="mt-3 text-sm text-gray-400 max-w-sm font-normal">
          You haven't reserved any timepieces yet. Explore our haute horlogerie collections.
        </p>
        <Link
          to="/shop"
          className="mt-8 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all shadow-lg"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const { subtotal, shipping, tax, total } = orderSummary;

  return (
    <div className="min-h-screen bg-[#08090C] text-white py-12 px-5 sm:px-8 font-['Plus_Jakarta_Sans']">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
          Your Reserved Timepieces
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Items List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="bg-[#0E1015] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6"
              >
                <img
                  src={product.mainImage}
                  alt={product.modelName}
                  className="w-24 h-24 object-contain bg-[#141720] rounded-xl p-2 shrink-0"
                />

                <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                    {product.category}
                  </span>
                  <h3 className="text-xl font-bold text-white">{product.modelName}</h3>
                  <p className="text-sm font-bold text-white">
                    ₹{Number(product.price).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-white/20 rounded-lg overflow-hidden bg-[#141720]">
                    <button
                      onClick={() => handleUpdateQuantity(product._id, quantity - 1)}
                      className="px-3 py-1 text-gray-300 hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(product._id, quantity + 1)}
                      className="px-3 py-1 text-gray-300 hover:text-white"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(product._id)}
                    aria-label="Remove item"
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-[#0E1015] border border-white/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
              <h3 className="text-2xl font-bold text-white">Order Summary</h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">₹{Number(subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Insured Global Shipping</span>
                  <span className="text-white font-bold">Complimentary</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Estimated Tax</span>
                    <span className="text-white">₹{Number(tax).toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-white/10 flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>₹{Number(total || subtotal || 0).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all"
              >
                Proceed to Secure Checkout
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-400 text-[11px]">
                <ShieldCheck size={16} className="text-white" />
                <span>Encrypted 256-Bit Acquisition</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}