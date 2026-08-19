import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], // [{ product: {...}, quantity }]
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload;
    },
    addOrIncrementCartItem: (state, action) => {
      // action.payload: full product object being added
      const existing = state.items.find(
        (it) => it.product._id === action.payload._id
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
    },
    updateCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((it) => it.product._id === productId);
      if (item) item.quantity = quantity;
    },
    removeCartItem: (state, action) => {
      state.items = state.items.filter(
        (it) => it.product._id !== action.payload
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  setCart,
  addOrIncrementCartItem,
  updateCartQuantity,
  removeCartItem,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;