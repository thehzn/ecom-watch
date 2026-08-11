import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Globe } from 'lucide-react';

import { login } from '../../redux/authSlice';

const validationSchema = Yup.object({
  email: Yup.string()
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .required('Email address is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [langOpen, setLangOpen] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('');
      try {
        const res = await fetch('http://localhost:3000/apiauth/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: values.email.trim().toLowerCase(),
            password: values.password,
          }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setAuthError((data && data.message) || 'Invalid email or password');
          return;
        }

        dispatch(login({ token: data.token, user: data.user }));
        navigate('/');
      } catch {
        setAuthError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#F9F9F9' }}>
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{
          backgroundColor: 'rgba(249,249,249,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'rgba(196,199,199,0.2)',
        }}
      >
        <div className="mx-auto flex max-w-[1536px] items-center justify-between px-6 py-5 sm:px-10">
          <Link
            to="/"
            className="uppercase text-black"
            style={{
              fontFamily: "'Libre Caslon Text', serif",
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.2em',
            }}
          >
            Chronos
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center text-[#5D5E63] transition-colors hover:text-black"
              aria-label="Select language"
              aria-expanded={langOpen}
            >
              <Globe size={20} strokeWidth={1.5} />
            </button>

            {langOpen && (
              <div
                className="absolute right-0 top-8 w-32 border bg-white py-2 shadow-sm"
                style={{ borderColor: 'rgba(196,199,199,0.3)' }}
              >
                <button
                  type="button"
                  onClick={() => setLangOpen(false)}
                  className="block w-full px-4 py-2 text-left text-[14px] text-black hover:bg-[#F9F9F9]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  English
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Section */}
      <main className="relative flex min-h-[calc(100vh-73px)] w-full items-center justify-center overflow-hidden px-5 py-16">
        {/* Decorative blurred gradient circles */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.06), transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.05), transparent 70%)' }}
        />

        <div className="relative z-10 w-full max-w-[480px]">
          {/* Authentication Card */}
          <div
            className="w-full p-8"
            style={{
              backgroundColor: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(196,199,199,0.1)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
            }}
          >
            <h1
              className="text-center text-black"
              style={{
                fontFamily: "'Libre Caslon Text', serif",
                fontSize: '40px',
                fontWeight: 400,
                lineHeight: '48px',
              }}
            >
              Welcome Back
            </h1>
            <p
              className="mb-8 mt-2 text-center"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}
            >
              Re-enter the world of timeless precision.
            </p>

            <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-6">
              {/* Email */}
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border-0 border-b bg-transparent text-[16px] text-black outline-none transition-colors duration-300 placeholder:text-[#9A9C9C] focus:border-black"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    borderColor: '#747878',
                    padding: '12px 0px',
                  }}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-[12px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[12px] uppercase tracking-[0.05em] text-[#5D5E63]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[#5D5E63] hover:text-black"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px' }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    autoComplete="current-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border-0 border-b bg-transparent pr-8 text-[16px] text-black outline-none transition-colors duration-300 placeholder:text-[#9A9C9C] focus:border-black"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      borderColor: '#747878',
                      padding: '12px 0px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-0 text-[#5D5E63] hover:text-black"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-[12px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {authError && (
                <p className="text-[12px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-black text-white transition-colors duration-300 hover:bg-[#333333] active:scale-[0.98] disabled:opacity-70"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '16px',
                }}
              >
                {formik.isSubmitting ? 'Signing In…' : 'Sign In'}
              </button>

              <p
                className="text-center"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}
              >
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-black hover:underline">
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
