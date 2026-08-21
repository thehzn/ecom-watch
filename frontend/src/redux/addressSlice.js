import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    items: [], // [{ _id, firstName, lastName, phone, address, city, state, pincode, isDefault }]
  },
  reducers: {
    setAddresses: (state, action) => {
      state.items = action.payload;
    },
    addAddressLocal: (state, action) => {
      state.items.push(action.payload);
    },
    updateAddressLocal: (state, action) => {
      const idx = state.items.findIndex((a) => a._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeAddressLocal: (state, action) => {
      state.items = state.items.filter((a) => a._id !== action.payload);
    },
    clearAddresses: (state) => {
      state.items = [];
    },
  },
});

export const {
  setAddresses,
  addAddressLocal,
  updateAddressLocal,
  removeAddressLocal,
  clearAddresses,
} = addressSlice.actions;
export default addressSlice.reducer;