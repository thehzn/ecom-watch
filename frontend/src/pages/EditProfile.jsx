import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { updateUser } from '../redux/authSlice';

const NAME_REGEX = /^[A-Za-z]+$/;

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
});

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const user = useSelector((state) => state.auth?.user) || {};

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setFormError('');
      setSuccessMessage('');
      try {
        const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:3000')}/apiuser/user/updateprofile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim().toLowerCase(),
          }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.status === false)) {
          if (res.status === 409) {
            setFieldError('email', 'An account with this email already exists');
          } else {
            setFormError((data && data.message) || 'Something went wrong. Please try again.');
          }
          return;
        }

        dispatch(updateUser(data.user));
        setSuccessMessage('Client dossier updated successfully.');
        setTimeout(() => navigate('/myaccount'), 1200);
      } catch {
        setFormError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-white/10 bg-[#08090C]/80 backdrop-blur-xl px-6 py-5 sm:px-12 flex items-center justify-between z-20">
        <Link to="/" className="flex flex-col group">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-white">CHRONOS</span>
          <span className="text-[8px] tracking-[0.35em] text-gray-400 uppercase font-semibold">Haute Horlogerie</span>
        </Link>
        <Link
          to="/myaccount"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Dashboard</span>
        </Link>
      </header>

      {/* Main Form */}
      <main className="relative flex-1 flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[460px] bg-[#0E1015]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] uppercase tracking-[0.25em] text-gray-300 mb-4">
              <Sparkles size={11} />
              Client Dossier
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Edit Profile
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal">
              Update your personal credentials and communication email.
            </p>
          </div>

          {successMessage ? (
            <div className="p-4 bg-white/10 border border-white/20 rounded-2xl text-center text-sm font-medium text-white">
              {successMessage}
            </div>
          ) : (
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
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">{formik.errors.firstName}</p>
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
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">{formik.errors.lastName}</p>
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
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{formik.errors.email}</p>
                )}
              </div>

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
              >
                <span>{formik.isSubmitting ? 'Saving Changes…' : 'Save Changes'}</span>
                <ArrowRight size={15} />
              </button>

              <div className="text-center mt-2">
                <Link
                  to="/myaccount"
                  className="text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  Cancel and return
                </Link>
              </div>
            </form>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-[10px] text-gray-500 tracking-widest uppercase">
        256-Bit Encrypted Atelier Access • Geneva Standard
      </footer>
    </div>
  );
}
