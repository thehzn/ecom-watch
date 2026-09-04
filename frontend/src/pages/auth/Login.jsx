import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { login } from '../../redux/authSlice';
import { useApi } from '../../hooks/useApi';
import loginWatchImage from '../../assets/classic-watch.jpg';
import ReCAPTCHA from 'react-google-recaptcha';

const validationSchema = Yup.object({
  email: Yup.string()
    .transform((value) =>
      value ? value.trim().toLowerCase() : value
    )
    .required('Email address is required')
    .email('Enter a valid email'),

  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { post } = useApi();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setAuthError('');

      // RECAPTCHA CHECK
      if (!captchaToken) {
        setAuthError('Please complete the reCAPTCHA.');
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

        // Reset CAPTCHA after failed login
        setCaptchaToken(null);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main className="min-h-screen w-full flex bg-white text-black font-['Plus_Jakarta_Sans']">

      {/* =====================================================
          LEFT LOGIN SECTION
      ====================================================== */}
      <section className="flex-1 min-h-screen flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-12">

        <div className="w-full max-w-[460px]">

          {/* MOBILE LOGO */}
          <Link
            to="/"
            className="lg:hidden block mb-10"
          >
            <div className="text-2xl font-semibold tracking-[0.25em]">
              CHRONOS
            </div>

            <div className="text-[8px] uppercase tracking-[0.3em] text-black/50 mt-1">
              Haute Horlogerie
            </div>
          </Link>

          {/* HEADER */}
          <div className="mb-8">

            <p className="text-[10px] uppercase tracking-[0.25em] text-black/50 mb-3">
              Client Access
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Welcome Back
            </h1>

            <p className="text-sm text-black/50 mt-2">
              Sign in to access your Chronos client account.
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
                    ? 'border-red-400'
                    : 'border-black/20'
                } focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30`}
              />

              {formik.touched.email &&
                formik.errors.email && (
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
                  className="text-[10px] uppercase tracking-wider text-black/100 hover:text-black transition-colors"
                >
                  Forgot Password?
                </Link>

              </div>

              <div className="relative">

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
                    formik.touched.password &&
                    formik.errors.password
                      ? 'border-red-400'
                      : 'border-black/20'
                  } focus:border-black text-black text-sm px-4 py-3.5 pr-12 outline-none transition-colors placeholder:text-black/30`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  tabIndex={-1}
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

              {formik.touched.password &&
                formik.errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {formik.errors.password}
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
            <div className="mt-2">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
                onExpired={() => setCaptchaToken(null)}
                onErrored={() => setCaptchaToken(null)}
              />
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-black/85 disabled:opacity-50 text-xs font-semibold uppercase tracking-[0.2em] py-4 transition-all"
            >

              <span>
                {formik.isSubmitting
                  ? 'Signing In...'
                  : 'Sign In'}
              </span>

              {!formik.isSubmitting && (
                <ArrowRight size={15} />
              )}

            </button>

            {/* REGISTER */}
            <p className="text-center text-xs text-black/50 pt-1">

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
          RIGHT WATCH IMAGE SECTION
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
            Discover exceptional timepieces crafted with
            precision, heritage and timeless elegance.
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