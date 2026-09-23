import { useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ChevronDown,
  ArrowLeft,
  Compass
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import watchImage from '../../assets/luxury_titanium_watch.jpg';
import ReCAPTCHA from 'react-google-recaptcha';

const Register = () => {
  const navigate = useNavigate();
  const { post } = useApi();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [formError, setFormError] = useState('');

  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+91',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
      privacyAccepted: false,
    },

    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(
          2,
          'First name must be at least 2 characters'
        )
        .max(
          50,
          'First name must be at most 50 characters'
        )
        .required('First name is required'),

      lastName: Yup.string()
        .min(1, 'Last name is required')
        .max(
          50,
          'Last name must be at most 50 characters'
        )
        .required('Last name is required'),

      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),

      countryCode: Yup.string()
        .required('Country code is required'),

      mobileNumber: Yup.string()
        .matches(
          /^[0-9]{10}$/,
          'Mobile number must be 10 digits'
        )
        .required('Mobile number is required'),

      password: Yup.string()
        .min(
          8,
          'Password must be at least 8 characters'
        )
        .required('Password is required'),

      confirmPassword: Yup.string()
        .oneOf(
          [Yup.ref('password'), null],
          'Passwords must match'
        )
        .required('Please confirm your password'),

      privacyAccepted: Yup.boolean()
        .oneOf(
          [true],
          'You must accept the privacy policy'
        ),
    }),

    onSubmit: async (
      values,
      { setSubmitting }
    ) => {
      setFormError('');

      if (!captchaToken) {
        setFormError(
          'Please complete the reCAPTCHA verification.'
        );

        setSubmitting(false);
        return;
      }

      try {
        await post('/apiauth/user/register', {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          countryCode: values.countryCode.trim(),
          mobileNumber: values.mobileNumber.trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
          captchaToken,
        });

        navigate('/login');

      } catch (error) {
        setFormError(
          error.message ||
            'Registration failed. Please try again.'
        );

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

      {/* LEFT IMAGE */}
      <section className="relative hidden lg:flex w-1/2 min-h-screen bg-black overflow-hidden">

        <img
          src={watchImage}
          alt="Luxury watch"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30" />

        {/* BRAND */}
        <div className="absolute top-8 left-8 text-white z-10">

          <div className="flex items-center gap-2">

            <Compass size={20} />

            <span className="text-sm tracking-[0.3em] uppercase">
              Chronos
            </span>

          </div>

        </div>

        {/* IMAGE CONTENT */}
        <div className="absolute bottom-12 left-12 text-white max-w-md z-10">

          <p className="text-xs uppercase tracking-[0.3em] mb-4">
            Timeless Elegance
          </p>

          <h1 className="text-4xl xl:text-5xl font-light tracking-tight leading-[1.05]">
            Create your account
          </h1>

          <p className="mt-5 text-sm text-white/80 leading-relaxed">
            Join Chronos and discover a world of refined timepieces,
            curated collections and exceptional craftsmanship.
          </p>

        </div>

      </section>


      {/* RIGHT FORM */}
      <section className="w-full lg:w-1/2 bg-white flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-12">

        <div className="w-full max-w-[460px]">

          {/* BACK */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50 hover:text-black mb-8 transition-colors group"
          >

            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-1 transition-transform"
            />

            <span>
              Back
            </span>

          </button>


          {/* TITLE */}
          <div className="mb-8">

            <p className="text-[10px] uppercase tracking-[0.25em] text-black/50 mb-2 font-semibold">
              Welcome to Chronos
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black">
              Create Account
            </h1>

            <p className="text-sm text-black/60 mt-2">
              Register your account to continue.
            </p>

          </div>


          {/* SERVER ERROR */}
          {formError && (
            <div className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-600 mb-5">
              {formError}
            </div>
          )}


          {/* FORM */}
          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >

            {/* FIRST + LAST NAME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* FIRST NAME */}
              <div>

                <label
                  htmlFor="firstName"
                  className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  autoComplete="given-name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-white border ${
                    formik.touched.firstName &&
                    formik.errors.firstName
                      ? 'border-red-500'
                      : 'border-black/20'
                  } focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30`}
                />

                {formik.touched.firstName &&
                  formik.errors.firstName && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formik.errors.firstName}
                    </p>
                  )}

              </div>


              {/* LAST NAME */}
              <div>

                <label
                  htmlFor="lastName"
                  className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-white border ${
                    formik.touched.lastName &&
                    formik.errors.lastName
                      ? 'border-red-500'
                      : 'border-black/20'
                  } focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30`}
                />

                {formik.touched.lastName &&
                  formik.errors.lastName && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formik.errors.lastName}
                    </p>
                  )}

              </div>

            </div>


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
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full bg-white border ${
                  formik.touched.email &&
                  formik.errors.email
                    ? 'border-red-500'
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


            {/* MOBILE */}
            <div>

              <label
                htmlFor="mobileNumber"
                className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
              >
                Mobile Number
              </label>

              <div className="flex gap-3">

                {/* COUNTRY CODE */}
                <div className="relative w-24 shrink-0">

                  <select
                    name="countryCode"
                    value={formik.values.countryCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full appearance-none bg-white border border-black/20 focus:border-black text-black text-sm px-4 py-3.5 pr-8 outline-none transition-colors cursor-pointer"
                  >

                    <option value="+91">
                      +91
                    </option>

                    <option value="+971">
                      +971
                    </option>

                    <option value="+1">
                      +1
                    </option>

                    <option value="+44">
                      +44
                    </option>

                    <option value="+81">
                      +81
                    </option>

                  </select>

                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-black/50"
                  />

                </div>


                {/* MOBILE NUMBER */}
                <input
                  id="mobileNumber"
                  type="text"
                  name="mobileNumber"
                  maxLength="10"
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  value={formik.values.mobileNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`flex-1 bg-white border ${
                    formik.touched.mobileNumber &&
                    formik.errors.mobileNumber
                      ? 'border-red-500'
                      : 'border-black/20'
                  } focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30`}
                />

              </div>

              {formik.touched.mobileNumber &&
                formik.errors.mobileNumber && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {formik.errors.mobileNumber}
                  </p>
                )}

            </div>


            {/* PASSWORD */}
            <div>

              <label
                htmlFor="password"
                className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
              >
                Password
              </label>

              <div className="relative flex items-center">

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  name="password"
                  placeholder="Enter password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-white border ${
                    formik.touched.password &&
                    formik.errors.password
                      ? 'border-red-500'
                      : 'border-black/20'
                  } focus:border-black text-black text-sm px-4 py-3.5 pr-12 outline-none transition-colors placeholder:text-black/30`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-black/50 hover:text-black focus:outline-none flex items-center justify-center cursor-pointer transition-colors z-10"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >

                  {showPassword ? (
                    <EyeOff
                      size={18}
                      className="text-black/70"
                    />
                  ) : (
                    <Eye
                      size={18}
                      className="text-black/70"
                    />
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


            {/* CONFIRM PASSWORD */}
            <div>

              <label
                htmlFor="confirmPassword"
                className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
              >
                Confirm Password
              </label>

              <div className="relative flex items-center">

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  name="confirmPassword"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  value={
                    formik.values.confirmPassword
                  }
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full bg-white border ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-black/20'
                  } focus:border-black text-black text-sm px-4 py-3.5 pr-12 outline-none transition-colors placeholder:text-black/30`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-black/50 hover:text-black focus:outline-none flex items-center justify-center cursor-pointer transition-colors z-10"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >

                  {showConfirmPassword ? (
                    <EyeOff
                      size={18}
                      className="text-black/70"
                    />
                  ) : (
                    <Eye
                      size={18}
                      className="text-black/70"
                    />
                  )}

                </button>

              </div>

              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {formik.errors.confirmPassword}
                  </p>
                )}

            </div>


            {/* PRIVACY POLICY */}
            <div className="pt-1">

              <label className="flex items-start gap-3 cursor-pointer select-none">

                <input
                  id="privacyAccepted"
                  name="privacyAccepted"
                  type="checkbox"
                  checked={
                    formik.values.privacyAccepted
                  }
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

                  and Terms & Conditions.

                </span>

              </label>

              {formik.touched.privacyAccepted &&
                formik.errors.privacyAccepted && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {formik.errors.privacyAccepted}
                  </p>
                )}

            </div>


            {/* SERVER ERROR */}
            {formError && (
              <div className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-600">
                {formError}
              </div>
            )}


            {/* CAPTCHA */}
            <div className="mt-1">

              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={
                  import.meta.env
                    .VITE_RECAPTCHA_SITE_KEY
                }
                onChange={(token) =>
                  setCaptchaToken(token)
                }
                onExpired={() => {

                  if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                  }

                  setCaptchaToken(null);

                }}
                onErrored={() => {

                  if (recaptchaRef.current) {
                    recaptchaRef.current.reset();
                  }

                  setCaptchaToken(null);

                }}
              />

            </div>


            {/* CREATE ACCOUNT */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-black/85 disabled:opacity-50 text-xs font-semibold uppercase tracking-[0.2em] py-4 transition-all cursor-pointer shadow-sm"
            >

              <span>
                {formik.isSubmitting
                  ? 'Creating Account...'
                  : 'Create Account'}
              </span>

              {!formik.isSubmitting && (
                <ArrowRight size={15} />
              )}

            </button>


            {/* LOGIN LINK */}
            <p className="text-center text-xs text-black/60 pt-2">

              Already have an account?{' '}

              <Link
                to="/login"
                className="font-semibold text-black hover:underline"
              >
                Sign In
              </Link>

            </p>

          </form>


          {/* GOOGLE LOGIN - OUTSIDE FORM */}
          <div className="mt-6 flex flex-col gap-4">

            {/* HORIZONTAL LINE */}
            <div className="flex items-center gap-3">

              <div className="h-px flex-1 bg-black/10" />

              <span className="text-[10px] uppercase tracking-wider text-black/40">
                Or continue with
              </span>

              <div className="h-px flex-1 bg-black/10" />

            </div>


            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  'http://localhost:3000/apiauth/google';
              }}
              className="w-full flex items-center justify-center gap-3 border border-black/20 bg-white text-black hover:bg-black hover:text-white text-xs font-semibold uppercase tracking-[0.15em] py-4 transition-all cursor-pointer"
            >

              {/* COLORFUL GOOGLE G ICON */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >

                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.21z"
                />

                <path
                  fill="#34A853"
                  d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5z"
                />

                <path
                  fill="#FBBC05"
                  d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.1-1.08.31-1.58V7.89H3.3A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.05 4.11l3.24-2.53z"
                />

                <path
                  fill="#EA4335"
                  d="M12 6.39c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.83 3.49 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39z"
                />

              </svg>

              <span>
                Continue with Google
              </span>

            </button>

          </div>

        </div>

      </section>

    </main>
  );
};

export default Register;
