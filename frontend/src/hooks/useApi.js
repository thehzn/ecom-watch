
import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL;

export function useApi() {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (url, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}${url}`, {
          method: options.method || 'GET',
          body: options.body,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        let data = null;
        const text = await res.text();

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch(logout());
            navigate('/login');
          } else if (res.status === 403) {
            navigate('/unauthorized');
          } else if (res.status === 404 && !options.allowNotFound) {
            navigate('/not-found');
          } else if (res.status >= 500) {
            navigate('/server-error');
          }

          const message =
            (data && data.message) || `Request failed: ${res.status}`;

          throw new Error(message);
        }

        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, navigate, dispatch]
  );

  const get = useCallback(
    (url, options) => request(url, options),
    [request]
  );

  const post = useCallback(
    (url, body) =>
      request(url, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    [request]
  );

  const put = useCallback(
    (url, body) =>
      request(url, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    [request]
  );

  const patch = useCallback(
    (url, body) =>
      request(url, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    [request]
  );

  const del = useCallback(
    (url) =>
      request(url, {
        method: 'DELETE',
      }),
    [request]
  );

  return {
    request,
    get,
    post,
    put,
    patch,
    del,
    loading,
    error,
  };
}