import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
 const BASE_URL = 'http://localhost:3000';

export function useApi() {
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, options = {}) => {
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

      // Try to parse body regardless of status (errors often have a message)
      let data = null;
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text; // non-JSON response, keep as raw text
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
        } else if (res.status === 404) {
          navigate('/not-found');
        } else if (res.status >= 500) {
          navigate('/server-error');
        }

        const message = (data && data.message) || `Request failed: ${res.status}`;
        throw new Error(message);
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, navigate, dispatch]);

  const get = (url) => request(url);
  const post = (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) });
  const put = (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) });
  const patch = (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) });
  const del = (url) => request(url, { method: 'DELETE' });

  return { request, get, post, put, patch, del, loading, error };
}