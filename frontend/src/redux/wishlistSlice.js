import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // array of product objects, shape: { _id, modelName, price, ... }
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    addToWishlistLocal: (state, action) => {
      const exists = state.items.find((item) => item._id === action.payload._id);
      if (!exists) state.items.push(action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { setWishlist, removeFromWishlist, addToWishlistLocal, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;