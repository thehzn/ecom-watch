import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import watchImage from '../../assets/luxury_titanium_watch.jpg';

const NAME_REGEX = /^[A-Za-z]+$/;
const MOBILE_REGEX = /^[0-9]{10}$/;
const PASSWORD_ERROR = 'Must be 8+ characters with uppercase, lowercase, number & symbol.';

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
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .required('Email address is required')
    .email('Enter a valid email'),
  countryCode: Yup.string().trim().required('Required'),
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');

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
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setFormError('');
      try {
        const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:3000')}/apiauth/user/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim().toLowerCase(),
            countryCode: values.countryCode.trim(),
            mobileNumber: values.mobileNumber.trim(),
            password: values.password,
            confirmPassword: values.confirmPassword,
          }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          if (res.status === 409) {
            setFieldError('email', 'A client account with this email already exists');
          } else {
            setFormError((data && data.message) || 'Something went wrong. Please try again.');
          }
          return;
        }

        navigate('/login');
      } catch {
        setFormError('Unable to connect to the Maison server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main className="min-h-screen w-full flex bg-[#08090C] text-white font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black">
      
      {/* LEFT COLUMN: HAUTE HORLOGERIE ARTISAN SHOWCASE */}
      <div className="relative hidden lg:flex w-1/2 min-h-screen flex-col justify-between p-16 bg-[#0B0D12] border-r border-white/10 overflow-hidden">
        
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity filter brightness-75 scale-105 transition-transform duration-1000" 
          style={{ backgroundImage: `url(${watchImage})` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/65 to-[#08090C]/40" />

        <Link to="/" className="relative z-10 flex flex-col group">
          <span className="text-2xl font-bold tracking-[0.25em] text-white group-hover:text-gray-300 transition-colors">
            CHRONOS
          </span>
          <span className="text-[9px] tracking-[0.35em] text-gray-400 uppercase font-semibold">
            Geneva Atelier • Est. 1924
          </span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-5 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-200">
            <Sparkles size={12} />
            Privé Horology Circle
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            The Privilege of <br />
            <span className="platinum-gradient-text font-light">Perpetual Time</span>
          </h1>

          <p className="mt-4 text-sm text-gray-300 leading-relaxed font-normal">
            Register your client profile to obtain confidential allocations for limited titanium complications, priority salon invitations, and bespoke manufacture privileges.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <Award size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Priority Allocations</p>
                <p className="text-[10px] text-gray-400">1/50 Limited Editions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <ShieldCheck size={15} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">5-Year Warranty</p>
                <p className="text-[10px] text-gray-400">Global Concierge Care</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
          © 2026 Chronos Haute Horlogerie • Swiss Certified
        </div>
      </div>

      {/* RIGHT COLUMN: CLIENT REGISTRATION FORM */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 py-16 lg:w-1/2 overflow-y-auto z-10">
        <div className="w-full max-w-[480px]">
          
          <div className="mb-8">
            <Link to="/" className="lg:hidden block mb-6">
              <span className="text-2xl font-bold tracking-[0.25em] text-white">CHRONOS</span>
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 block mb-2">
              Registration
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Create Client Account
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal">
              Enter your information to begin your haute horlogerie journey.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Jean"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-gray-600"
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="mt-1 text-xs text-red-400">{formik.errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Dufour"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-gray-600"
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="mt-1 text-xs text-red-400">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Client Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="client@chronos.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-gray-600"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-[90px_1fr] gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Code
                </label>
                <input
                  id="countryCode"
                  name="countryCode"
                  type="text"
                  value={formik.values.countryCode}
                  onChange={formik.handleChange}
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-3 py-3 outline-none text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Mobile Number
                </label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={formik.values.mobileNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none placeholder:text-gray-600"
                />
                {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                  <p className="mt-1 text-xs text-red-400">{formik.errors.mobileNumber}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Security Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 pr-11 outline-none placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 pr-11 outline-none placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3.5 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.confirmPassword}</p>
              )}
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center font-medium">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60 hover:scale-[1.01]"
            >
              <span>{formik.isSubmitting ? 'Registering Privileges…' : 'Register Account'}</span>
              <ArrowRight size={15} />
            </button>

            <p className="text-center text-xs text-gray-400 mt-2">
              Already registered with the Maison?{' '}
              <Link to="/login" className="font-bold text-white hover:underline ml-1">
                Client Sign In
              </Link>
            </p>
          </form>

        </div>
      </div>

    </main>
  );
}
