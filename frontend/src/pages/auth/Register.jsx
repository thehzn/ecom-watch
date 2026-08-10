import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import watchImage from '../../assets/admin-watch.avif';

const NAME_REGEX = /^[A-Za-z]+$/;
const PASSWORD_ERROR =
  'Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .matches(NAME_REGEX, 'Only letters are allowed')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Must be at most 50 characters'),
  lastName: Yup.string()
    .trim()
    .required('Last name is required')
    .matches(NAME_REGEX, 'Only letters are allowed')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Must be at most 50 characters'),
  email: Yup.string()
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .required('Email address is required')
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(8, PASSWORD_ERROR)
    .matches(/[a-z]/, PASSWORD_ERROR)
    .matches(/[A-Z]/, PASSWORD_ERROR)
    .matches(/\d/, PASSWORD_ERROR)
    .matches(/[^A-Za-z0-9\s]/, PASSWORD_ERROR),
});

const inputClasses =
  'peer w-full border-0 border-b border-[rgba(116,120,120,0.4)] bg-transparent pt-4 pb-2 text-[16px] font-normal text-black outline-none transition-colors duration-300 placeholder-transparent focus:border-black';

const labelClasses =
  'absolute left-0 top-4 text-[16px] text-[#9A9C9C] transition-all duration-300 peer-focus:top-[-8px] peer-focus:text-[12px] peer-focus:uppercase peer-focus:tracking-[0.05em] peer-focus:text-[#5D5E63] peer-[:not(:placeholder-shown)]:top-[-8px] peer-[:not(:placeholder-shown)]:text-[12px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.05em] peer-[:not(:placeholder-shown)]:text-[#5D5E63]';

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-[12px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
      {children}
    </p>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const formik = useFormik({
    initialValues: { firstName: '', lastName: '', email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setFormError('');
      try {
        const res = await fetch('http://localhost:3000/apiauth/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim().toLowerCase(),
            password: values.password,
          }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          if (res.status === 409) {
            setFieldError('email', 'An account with this email already exists');
          } else {
            setFormError((data && data.message) || 'Something went wrong. Please try again.');
          }
          return;
        }

        navigate('/login');
      } catch {
        setFormError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row" style={{ backgroundColor: '#F9F9F9' }}>
      {/* Left Column - Brand Showcase (desktop only) */}
      <div className="relative hidden min-h-screen w-1/2 flex-col justify-center overflow-hidden bg-black lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${watchImage})` }}
        />
        <div className="absolute inset-0 bg-black" style={{ mixBlendMode: 'overlay' }} />

        <span
          className="absolute left-12 top-12 z-10 uppercase text-white"
          style={{
            fontFamily: "'Libre Caslon Text', serif",
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          Chronos
        </span>

        <div className="relative z-10 max-w-[480px] px-16">
          <h1
            className="text-white"
            style={{
              fontFamily: "'Libre Caslon Text', serif",
              fontSize: '40px',
              fontWeight: 400,
              lineHeight: '48px',
            }}
          >
            The Art of Time.
          </h1>
          <p
            className="mt-6"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '28px',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            Join the Maison Chronos. Gain exclusive access to our limited collections, heritage
            archives, and bespoke horological services.
          </p>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div
        className="flex w-full flex-1 items-center justify-center px-5 py-16 lg:w-1/2 lg:px-16"
        style={{ backgroundColor: '#F9F9F9' }}
      >
        <div className="w-full max-w-[448px]">
          <h2
            className="mb-2 text-black"
            style={{
              fontFamily: "'Libre Caslon Text', serif",
              fontSize: '32px',
              fontWeight: 400,
              lineHeight: '40px',
            }}
          >
            Create Account
          </h2>
          <p
            className="mb-10"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}
          >
            Enter your details to begin your journey.
          </p>

          <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-8">
            {/* First / Last Name */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  autoComplete="given-name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClasses}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <label htmlFor="firstName" className={labelClasses} style={{ fontFamily: 'Inter, sans-serif' }}>
                  First Name
                </label>
                {formik.touched.firstName && <FieldError>{formik.errors.firstName}</FieldError>}
              </div>

              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClasses}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <label htmlFor="lastName" className={labelClasses} style={{ fontFamily: 'Inter, sans-serif' }}>
                  Last Name
                </label>
                {formik.touched.lastName && <FieldError>{formik.errors.lastName}</FieldError>}
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClasses}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <label htmlFor="email" className={labelClasses} style={{ fontFamily: 'Inter, sans-serif' }}>
                Email Address
              </label>
              {formik.touched.email && <FieldError>{formik.errors.email}</FieldError>}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${inputClasses} pr-10`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <label htmlFor="password" className={labelClasses} style={{ fontFamily: 'Inter, sans-serif' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-0 top-4 text-[#5D5E63] hover:text-black"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
              {formik.touched.password && <FieldError>{formik.errors.password}</FieldError>}
            </div>

            {formError && <FieldError>{formError}</FieldError>}

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
                padding: '20px',
              }}
            >
              {formik.isSubmitting ? 'Creating Account…' : 'Create Account'}
            </button>

            <p
              className="text-center"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}
            >
              Already a member?{' '}
              <Link to="/login" className="font-semibold text-black underline-offset-2 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
