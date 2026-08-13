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
    },
    // Merges a partial profile update (e.g. from Edit Profile) into the
    // stored user so the UI reflects the change without a fresh login.
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      setAuthStorage(state.token, state.user);
    }
  }
});
 
export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;