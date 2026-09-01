import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { login } from '../../redux/authSlice';

const validationSchema = Yup.object({
  email: Yup.string()
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .required('Client email address is required')
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

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('');
      try {
        const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:3000')}/apiauth/user/login`, {
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
        setAuthError('Unable to connect to the Maison server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[650px] sm:h-[900px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_rgba(8,9,12,0)_70%)] pointer-events-none" />

      <header className="w-full border-b border-white/10 bg-[#08090C]/80 backdrop-blur-xl px-6 py-5 sm:px-12 flex items-center justify-between z-20">
        <Link to="/" className="flex flex-col group">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-white group-hover:text-gray-300 transition-colors">
            CHRONOS
          </span>
          <span className="text-[8px] tracking-[0.35em] text-gray-400 uppercase font-semibold">
            Haute Horlogerie
          </span>
        </Link>
        <Link
          to="/register"
          className="text-xs uppercase tracking-[0.18em] font-semibold text-gray-300 hover:text-white transition-colors"
        >
          Create Account
        </Link>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[460px] bg-[#0E1015]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] uppercase tracking-[0.25em] text-gray-300 mb-4">
              <Sparkles size={11} />
              Private Client Portal
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal">
              Enter your credentials to access your private collection.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                Client Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="client@chronos.com"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  Forgot Key?
                </Link>
              </div>

              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 pr-11 outline-none transition-colors placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{formik.errors.password}</p>
              )}
            </div>

            {authError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60 hover:scale-[1.01]"
            >
              <span>{formik.isSubmitting ? 'Authenticating…' : 'Access Client Account'}</span>
              <ArrowRight size={15} />
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              New client to the manufacture?{' '}
              <Link to="/register" className="font-bold text-white hover:underline ml-1">
                Register Privileges
              </Link>
            </p>
          </form>

        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-[10px] text-gray-500 tracking-widest uppercase">
        256-Bit Encrypted Atelier Access • Geneva Standard
      </footer>
    </div>
  );
}
