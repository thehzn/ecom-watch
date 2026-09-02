import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import {Eye,EyeOff,ArrowRight,ChevronDown,} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import watchImage from '../../assets/luxury_titanium_watch.jpg';

const NAME_REGEX = /^[A-Za-z]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

const PASSWORD_ERROR =
  'Must be 8+ characters with uppercase, lowercase, number & symbol.';

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
  { code: '+61', flag: '🇦🇺' },
  { code: '+971', flag: '🇦🇪' },
  { code: '+966', flag: '🇸🇦' },
  { code: '+974', flag: '🇶🇦' },
  { code: '+65', flag: '🇸🇬' },
  { code: '+60', flag: '🇲🇾' },
  { code: '+49', flag: '🇩🇪' },
  { code: '+33', flag: '🇫🇷' },
  { code: '+41', flag: '🇨🇭' },
];

const validationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .matches(NAME_REGEX, 'Only letters allowed')
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters'),

  lastName: Yup.string()
    .trim()
    .required('Last name is required')
    .matches(NAME_REGEX, 'Only letters allowed')
    .min(2, 'Min 2 characters')
    .max(50, 'Max 50 characters'),

  email: Yup.string()
    .transform((value) =>
      value ? value.trim().toLowerCase() : value
    )
    .required('Email address is required')
    .email('Enter a valid email'),

  countryCode: Yup.string()
    .trim()
    .required('Country code is required'),

  mobileNumber: Yup.string()
    .trim()
    .required('Mobile number is required')
    .matches(MOBILE_REGEX, 'Enter valid 10-digit number'),

  password: Yup.string()
    .required('Password is required')
    .min(8, PASSWORD_ERROR)
    .matches(/[a-z]/, PASSWORD_ERROR)
    .matches(/[A-Z]/, PASSWORD_ERROR)
    .matches(/\d/, PASSWORD_ERROR)
    .matches(/[^A-Za-z0-9\s]/, PASSWORD_ERROR),

  confirmPassword: Yup.string()
    .required('Confirm password')
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
});

export default function Register() {
  const navigate = useNavigate();

  const { post } = useApi();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+91',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
    },

    validationSchema,

    onSubmit: async (
      values,
      { setSubmitting, setFieldError }
    ) => {
      setFormError('');

      try {
        await post('/apiauth/user/register', {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          countryCode: values.countryCode.trim(),
          mobileNumber: values.mobileNumber.trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
        });

        navigate('/login');
      } catch (error) {
        const message =
          error?.message ||
          'Something went wrong. Please try again.';

        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes('already exists') ||
          lowerMessage.includes('email already') ||
          lowerMessage.includes('user already') ||
          lowerMessage.includes('already registered')
        ) {
          setFieldError(
            'email',
            'A client account with this email already exists'
          );
        } else {
          setFormError(message);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedCountry = COUNTRY_CODES.find(
    (item) => item.code === formik.values.countryCode
  );

  return (
    <main className="min-h-screen w-full flex bg-white text-black font-['Plus_Jakarta_Sans']">

      {/* =====================================================
          LEFT IMAGE SECTION
      ====================================================== */}
      <section className="relative hidden lg:flex w-1/2 min-h-screen bg-black overflow-hidden">

        <img
          src={watchImage}
          alt="Chronos Watch"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />

        {/* Image overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Brand */}
        <Link
          to="/"
          className="absolute top-10 left-12 z-10"
        >
          <div className="text-white text-3xl font-semibold tracking-[0.25em]">
            CHRONOS
          </div>

          <div className="text-white/60 text-[9px] uppercase tracking-[0.3em] mt-1">
            Haute Horlogerie
          </div>
        </Link>

        {/* Bottom text */}
        <div className="absolute bottom-12 left-12 z-10">

          <p className="text-white text-sm tracking-wide">
            Timeless design. Precise craftsmanship.
          </p>

          <div className="w-12 h-px bg-white mt-4" />

        </div>

      </section>

      {/* =====================================================
          RIGHT REGISTER SECTION
      ====================================================== */}
      <section className="flex-1 min-h-screen flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12 overflow-y-auto">

        <div className="w-full max-w-[480px]">

          {/* MOBILE LOGO */}
          <Link
            to="/"
            className="lg:hidden block mb-10"
          >
            <span className="text-2xl font-semibold tracking-[0.25em]">
              CHRONOS
            </span>
          </Link>

          {/* HEADER */}
          <div className="mb-8">

            <p className="text-[10px] uppercase tracking-[0.25em] text-black/50 mb-3">
              Registration
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Create Account
            </h1>

            <p className="text-sm text-black/50 mt-2">
              Create your Chronos client account.
            </p>

          </div>

          {/* =================================================
              FORM
          ================================================== */}
          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="flex flex-col gap-5"
          >

            {/* =================================================
                FIRST NAME + LAST NAME
            ================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
                  name="firstName"
                  type="text"
                  placeholder="First name"
                  autoComplete="given-name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-white border border-black/20 focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30"
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
                  name="lastName"
                  type="text"
                  placeholder="Last name"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-white border border-black/20 focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30"
                />

                {formik.touched.lastName &&
                  formik.errors.lastName && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formik.errors.lastName}
                    </p>
                  )}

              </div>

            </div>

            {/* =================================================
                EMAIL
            ================================================== */}
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
                className="w-full bg-white border border-black/20 focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30"
              />

              {formik.touched.email &&
                formik.errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {formik.errors.email}
                  </p>
                )}

            </div>

            {/* =================================================
                COUNTRY CODE + MOBILE
            ================================================== */}
            <div className="grid grid-cols-[105px_1fr] gap-3">

              {/* COUNTRY CODE */}
              <div className="relative">

                <label
                  htmlFor="countryCode"
                  className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                >
                  Code
                </label>

                {/* SELECTED COUNTRY */}
                <button
                  type="button"
                  id="countryCode"
                  aria-haspopup="listbox"
                  aria-expanded={countryOpen}
                  onClick={() =>
                    setCountryOpen((open) => !open)
                  }
                  className="w-full h-[52px] bg-white border border-black/20 hover:border-black focus:border-black text-black text-sm px-3 outline-none flex items-center justify-between transition-colors"
                >

                  <span className="flex items-center gap-2">

                    <span className="text-lg leading-none">
                      {selectedCountry?.flag}
                    </span>

                    <span className="font-medium">
                      {selectedCountry?.code}
                    </span>

                  </span>

                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                      countryOpen ? 'rotate-180' : ''
                    }`}
                  />

                </button>

                {/* CUSTOM COUNTRY DROPDOWN */}
                {countryOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-black/20 shadow-xl z-50 max-h-60 overflow-y-auto"
                    role="listbox"
                  >

                    {COUNTRY_CODES.map((item) => {

                      const isSelected =
                        formik.values.countryCode === item.code;

                      return (
                        <button
                          key={item.code}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            formik.setFieldValue(
                              'countryCode',
                              item.code
                            );

                            formik.setFieldTouched(
                              'countryCode',
                              true
                            );

                            setCountryOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-3 text-sm text-left transition-colors ${
                            isSelected
                              ? 'bg-black text-white'
                              : 'bg-white text-black hover:bg-black hover:text-white'
                          }`}
                        >

                          <span className="text-lg leading-none">
                            {item.flag}
                          </span>

                          <span className="font-medium">
                            {item.code}
                          </span>

                        </button>
                      );

                    })}

                  </div>
                )}

                {formik.touched.countryCode &&
                  formik.errors.countryCode && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formik.errors.countryCode}
                    </p>
                  )}

              </div>

              {/* MOBILE NUMBER */}
              <div>

                <label
                  htmlFor="mobileNumber"
                  className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                >
                  Mobile Number
                </label>

                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  autoComplete="tel-national"
                  value={formik.values.mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(
                      /\D/g,
                      ''
                    );

                    formik.setFieldValue(
                      'mobileNumber',
                      value
                    );
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full bg-white border border-black/20 focus:border-black text-black text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-black/30"
                />

                {formik.touched.mobileNumber &&
                  formik.errors.mobileNumber && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formik.errors.mobileNumber}
                    </p>
                  )}

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}
            <div>

              <label
                htmlFor="password"
                className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-white border border-black/20 focus:border-black text-black text-sm px-4 py-3.5 pr-12 outline-none transition-colors placeholder:text-black/30"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  tabIndex={-1}
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

            {/* =================================================
                CONFIRM PASSWORD
            ================================================== */}
            <div>

              <label
                htmlFor="confirmPassword"
                className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
              >
                Confirm Password
              </label>

              <div className="relative">

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-white border border-black/20 focus:border-black text-black text-sm px-4 py-3.5 pr-12 outline-none transition-colors placeholder:text-black/30"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
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

            {/* =================================================
                SERVER ERROR
            ================================================== */}
            {formError && (
              <div className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-600">
                {formError}
              </div>
            )}

            {/* =================================================
                SUBMIT BUTTON
            ================================================== */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-black/85 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold uppercase tracking-[0.2em] py-4 transition-all"
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

            {/* =================================================
                LOGIN LINK
            ================================================== */}
            <p className="text-center text-xs text-black/50 pt-1">

              Already have an account?{' '}

              <Link
                to="/login"
                className="font-semibold text-black hover:underline"
              >
                Sign In
              </Link>

            </p>

          </form>

        </div>

      </section>

    </main>
  );
}