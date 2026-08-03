export const getStoredToken = () => localStorage.getItem('token');

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setAuthStorage = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};