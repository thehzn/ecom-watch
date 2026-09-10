import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Home, Compass } from 'lucide-react';
import { login } from '../../redux/authSlice';
import { useApi } from '../../hooks/useApi';
import loginWatchImage from '../../assets/classic-watch.jpg';
import ReCAPTCHA from 'react-google-recaptcha';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validationSchema = Yup.object({
  email: Yup.string()
    .transform((value) =>
      value ? value.trim().toLowerCase() : value
    )
    .required('Email address is required')
    .matches(EMAIL_REGEX, 'Please enter a valid email address'),

  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),

  privacyAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the Privacy Policy to sign in'),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { post } = useApi();
  const recaptchaRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      privacyAccepted: false,
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('');

      // RECAPTCHA CHECK
      if (!captchaToken) {
        setAuthError('Please complete the reCAPTCHA verification.');
        setSubmitting(false);
        return;
      }

      try {
        const data = await post('/apiauth/user/login', {
          email: values.email.trim().toLowerCase(),
          password: values.password,
          captchaToken,
        });

        dispatch(
          login({
            token: data.token,
            user: data.user,
          })
        );

        navigate('/');
      } catch (error) {
        setAuthError(
          error.message || 'Invalid email or password'
        );

        // Instant reset of CAPTCHA widget without delay
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken(null);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-black font-['Plus_Jakarta_Sans']">

      {/* =====================================================
          MOBILE TOP NAVIGATION BAR
      ====================================================== */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white lg:hidden sticky top-0 z-30">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-black/70 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>

        <Link to="/" className="text-center">
          <span className="text-lg font-bold tracking-[0.25em]">CHRONOS</span>
        </Link>

        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-black/70 hover:text-black transition-colors"
        >
          <Compass size={14} />
          <span>Shop</span>
        </Link>
      </header>

      {/* =====================================================
          LEFT LOGIN SECTION
      ====================================================== */}
      <section className="relative flex-1 min-h-[calc(100vh-65px)] lg:min-h-screen flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-12">
        
        {/* DESKTOP BACK TO HOME LINK */}
        <div className="hidden lg:flex absolute top-8 left-10 lg:left-16 items-center gap-4 z-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50 hover:text-black transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            <span>Return to Catalog</span>
          </Link>
          <span className="text-black/20">•</span>
          <Link
            to="/shop"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50 hover:text-black transition-colors"
          >
            Browse Timepieces
          </Link>
        </div>

        <div className="w-full max-w-[460px]">

          {/* HEADER */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-black/50 mb-2 font-semibold">
              Client Access
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black">
              Welcome Back
            </h1>
            <p className="text-sm text-black/60 mt-2">
              Sign in to access your Chronos client account and orders.
            </p>
          </div>

          {/* =================================================
              LOGIN FORM
          ================================================== */}
          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full bg-white border ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : 'border-black/20'
                } focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30`}
              />

              {formik.touched.email && formik.errors.email && (
                <p className="mt-1.5 text-xs text-red-600">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-semibold uppercase tracking-wider"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-[10px] uppercase tracking-wider text-black/70 hover:text-black font-semibold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-white border ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-black/20'
                  } focus:border-black text-black text-sm px-4 py-3.5 pr-12 outline-none transition-colors placeholder:text-black/30`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-black/50 hover:text-black focus:outline-none flex items-center justify-center cursor-pointer transition-colors z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-black/70" />
                  ) : (
                    <Eye size={18} className="text-black/70" />
                  )}
                </button>
              </div>

              {formik.touched.password && formik.errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* PRIVACY POLICY ACCEPTANCE CHECKBOX */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id="privacyAccepted"
                  name="privacyAccepted"
                  type="checkbox"
                  checked={formik.values.privacyAccepted}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="mt-0.5 h-4 w-4 rounded-none border border-black/30 accent-black cursor-pointer shrink-0"
                />
                <span className="text-xs text-black/70 leading-relaxed">
                  I agree to the{' '}
                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-black underline hover:text-black/70 transition-colors"
                  >
                    Privacy Policy
                  </Link>{' '}
                  and acknowledge data processing for client access.
                </span>
              </label>

              {formik.touched.privacyAccepted && formik.errors.privacyAccepted && (
                <p className="mt-1.5 text-xs text-red-600">
                  {formik.errors.privacyAccepted}
                </p>
              )}
            </div>

            {/* SERVER ERROR */}
            {authError && (
              <div className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-600">
                {authError}
              </div>
            )}

            {/* GOOGLE RECAPTCHA */}
            <div className="mt-1">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => {
                  if (recaptchaRef.current) recaptchaRef.current.reset();
                  setCaptchaToken(null);
                }}
                onErrored={() => {
                  if (recaptchaRef.current) recaptchaRef.current.reset();
                  setCaptchaToken(null);
                }}
              />
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-black/85 disabled:opacity-50 text-xs font-semibold uppercase tracking-[0.2em] py-4 transition-all cursor-pointer shadow-sm"
            >
              <span>
                {formik.isSubmitting ? 'Signing In...' : 'Sign In'}
              </span>
              {!formik.isSubmitting && <ArrowRight size={15} />}
            </button>

            {/* REGISTER LINK */}
            <p className="text-center text-xs text-black/60 pt-2">
              Don't have a Chronos account?{' '}
              <Link
                to="/register"
                className="font-semibold text-black hover:underline"
              >
                Create Account
              </Link>
            </p>

          </form>

        </div>

      </section>

      {/* =====================================================
          RIGHT WATCH IMAGE SECTION (DESKTOP)
      ====================================================== */}
      <section className="relative hidden lg:flex w-1/2 min-h-screen bg-black overflow-hidden">
        
        {/* WATCH IMAGE */}
        <img
          src={loginWatchImage}
          alt="Luxury Chronos Watch"
          className="absolute inset-0 w-full h-full object-cover object-[65%_center]"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/45" />

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-black/50" />

        {/* BRAND */}
        <Link
          to="/"
          className="absolute top-10 right-12 z-10 text-right"
        >
          <div className="text-white text-3xl font-semibold tracking-[0.25em]">
            CHRONOS
          </div>
          <div className="text-white/60 text-[9px] uppercase tracking-[0.3em] mt-1">
            Haute Horlogerie
          </div>
        </Link>

        {/* IMAGE CONTENT */}
        <div className="absolute left-12 bottom-14 z-10 max-w-[400px]">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-px bg-white/70" />
            <span className="text-white/70 text-[10px] uppercase tracking-[0.3em]">
              Private Collection
            </span>
          </div>

          <h2 className="text-white text-4xl xl:text-5xl font-light tracking-tight leading-[1.05]">
            Timeless
            <br />
            Precision.
          </h2>

          <p className="text-white/60 text-sm leading-relaxed mt-5 max-w-[330px]">
            Discover exceptional timepieces crafted with precision, heritage and timeless elegance.
          </p>
        </div>

        {/* BOTTOM DETAILS */}
        <div className="absolute bottom-10 left-12 right-12 z-10 flex items-center justify-between">
          <span className="text-white/45 text-[9px] uppercase tracking-[0.25em]">
            Est. 1985
          </span>
          <span className="text-white/45 text-[9px] uppercase tracking-[0.25em]">
            Geneva • Switzerland
          </span>
        </div>

      </section>

    </main>
  );
}