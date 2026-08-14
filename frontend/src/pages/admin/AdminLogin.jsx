import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../redux/authSlice';
import { LockKeyhole } from 'lucide-react';

import watchImage from '../../assets/admin-watch.avif';

const PASSWORD_ERROR =
  'Password must be 8–64 characters, start with a letter, and include at least one uppercase letter, one lowercase letter, one number, and one special character. Spaces are not allowed.';

const validationSchema = Yup.object({
  email: Yup.string()
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .max(254, 'Email address is required')
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .required('Password is required')
    .test('no-spaces', PASSWORD_ERROR, (v) => !!v && !/\s/.test(v))
    .test('length', PASSWORD_ERROR, (v) => !!v && v.length >= 8 && v.length <= 64)
    .test('starts-with-letter', PASSWORD_ERROR, (v) => !!v && /^[A-Za-z]/.test(v))
    .test('has-lower', PASSWORD_ERROR, (v) => !!v && /[a-z]/.test(v))
    .test('has-upper', PASSWORD_ERROR, (v) => !!v && /[A-Z]/.test(v))
    .test('has-digit', PASSWORD_ERROR, (v) => !!v && /\d/.test(v))
    .test('has-special', PASSWORD_ERROR, (v) => !!v && /[^A-Za-z0-9\s]/.test(v)),
});

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('');
      try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/apiadmin/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(values),
});
        const data = await res.json();

        if (!res.ok) {
          setAuthError('Invalid email or password');
          return;
        }

        if (data.user?.role !== 'admin') {
          setAuthError('Invalid email or password');
          return;
        }

        dispatch(login({ token: data.token, user: data.user }));
        navigate('/admin/dashboard');
      } catch {
        setAuthError('Invalid email or password');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main className="relative flex w-full min-h-screen flex-row items-center justify-center overflow-hidden bg-[#F9F9F9] p-4 sm:p-5 lg:p-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -right-[10%] -top-[10%] z-0 h-[120%] w-[60%] opacity-[0.03]">
        <div className="h-full w-full rotate-12 bg-black" />
      </div>

      {/* Login container */}
      <section className="relative z-10 flex w-full max-w-full flex-col items-center bg-[#F9F9F9] sm:max-w-[380px] lg:max-w-[420px]">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 inline-block">
  <LockKeyhole
    size={48}
    strokeWidth={1}
    className="mx-auto text-black"
  />
</div>
          <h1
            className="mb-2 text-[20px] leading-[32px] tracking-[-0.02em] text-black sm:text-[22px] lg:text-[24px]"
            style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400 }}
          >
            ADMIN
          </h1>
          <p
            className="text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#5D5E63]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Restricted Access
          </p>
        </header>

        {/* Login form container */}
        <div className="w-full border border-[rgba(93,94,99,0.10)] bg-white p-8 shadow-sm">
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-8" noValidate>
            {/* Email Field */}
            <div className="relative flex flex-col">
              <label
                htmlFor="email"
                className="mb-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border-0 border-b border-[rgba(93,94,99,0.30)] bg-transparent py-3 text-[16px] font-normal text-[#1A1C1C] outline-none transition-colors duration-200 placeholder:text-[#C4C7C7] focus:border-black"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative flex flex-col">
              <label
                htmlFor="password"
                className="mb-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border-0 border-b border-[rgba(93,94,99,0.30)] bg-transparent py-3 pr-10 text-[16px] font-normal text-[#1A1C1C] outline-none transition-colors duration-200 placeholder:text-[#C4C7C7] focus:border-black"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-0 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63] hover:text-black"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {formik.errors.password}
                </p>
              )}
            </div>

            {authError && (
              <p className="-mt-4 text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {authError}
              </p>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-black px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-[#5F5E5E] active:scale-[0.98] disabled:opacity-80"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {formik.isSubmitting ? 'Signing In…' : 'Sign In'}
            </button>

            {/* Forgot Password Link */}
            <a
              href="/admin/reset-request"
              className="self-center text-[10px] font-medium text-[#5D5E63] underline decoration-1 underline-offset-4 hover:text-black"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Request credential reset
            </a>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p
            className="mx-auto max-w-[280px] text-[10px] leading-relaxed text-[#858383]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            This area is restricted to authorized administrators. All access attempts are logged and monitored.
          </p>
        </footer>
      </section>

      {/* Left Decorative Watch Image — desktop only */}
      <div
        className="absolute bottom-20 left-20 z-[1] hidden w-64 opacity-20 lg:block"
        onMouseEnter={() => setImageHovered(true)}
        onMouseLeave={() => setImageHovered(false)}
      >
        <div
          className="aspect-[3/4] w-full bg-cover bg-center bg-no-repeat transition-[filter] duration-700 ease-out"
          style={{
            backgroundImage: `url(${watchImage})`,
            filter: imageHovered ? 'grayscale(0%)' : 'grayscale(100%)',
          }}
        />
      </div>
    </main>
  );
}
