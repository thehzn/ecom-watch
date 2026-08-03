import { createSlice } from '@reduxjs/toolkit';
import { getStoredToken, getStoredUser, setAuthStorage, clearAuthStorage } from '../utils/authUtils';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: getStoredToken(),
    user: getStoredUser()
  },
  reducers: {
    login: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      setAuthStorage(token, user);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      clearAuthStorage();
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;