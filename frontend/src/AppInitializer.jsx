import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "./redux/cartSlice";
import { setWishlist } from "./redux/wishlistSlice";
import { useApi } from "./hooks/useApi";

export default function AppInitializer() {
  const dispatch = useDispatch();
  const { get } = useApi();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUserData = async () => {
      // If user logs out, isn't authenticated, or is an admin, do not fetch user cart/wishlist
      if (!user || !token || user.role === "admin") {
        dispatch(setCart([]));
        dispatch(setWishlist([]));
        return;
      }

      try {
        // Fetch cart and wishlist in parallel for customer users
        const [cartRes, wishlistRes] = await Promise.all([
          get("/apicarts/getcartitems", { allowNotFound: true }),
          get("/apiwishlist/getwishlists", { allowNotFound: true }),
        ]);

        // Sync Cart data to Redux
        const cartItems = cartRes?.cart?.items || cartRes?.items || [];
        dispatch(setCart(cartItems));

        // Sync Wishlist data to Redux
        const wishlistData = Array.isArray(wishlistRes)
          ? wishlistRes
          : wishlistRes?.products || wishlistRes?.wishlist || [];
        dispatch(setWishlist(wishlistData));
      } catch (error) {
        console.error("Failed to sync user data on load:", error);
      }
    };

    fetchUserData();
  }, [user, token, dispatch]);

  return null;
}