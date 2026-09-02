import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, Shield, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .required('New password is required')
    .matches(
      passwordRegex,
      'Must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number and 1 special character'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
});

const LIVE_RULES = [
  { key: 'length', label: 'Minimum 8 characters', test: (v) => v.length >= 8 },
  { key: 'upper', label: '1 uppercase & 1 lowercase letter', test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) },
  {
    key: 'numberOrSymbol',
    label: '1 number & 1 special symbol',
    test: (v) => /\d/.test(v) && /[^A-Za-z0-9]/.test(v),
  },
];

export default function Security() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token);

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiError('');
      try {
        const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:3000')}/apiuser/user/updateprofile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: values.newPassword }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.status === false)) {
          setApiError((data && data.message) || 'Could not update password. Please try again.');
          return;
        }

        resetForm();
        setSuccessMessage('Password updated successfully. Please log in with your new key.');
        setTimeout(() => navigate('/login'), 1500);
      } catch {
        setApiError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_70%)] pointer-events-none" />

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

      <main className="relative flex-1 flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[460px] bg-[#0E1015]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-4">
              <KeyRound size={22} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Security &amp; Keys
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Update your master password to protect your client portfolio.
            </p>
          </div>

          {successMessage ? (
            <div className="p-4 bg-white/10 border border-white/20 rounded-2xl text-center text-sm font-medium text-white">
              {successMessage}
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  New Security Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 pr-11 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-3.5 text-gray-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <p className="text-red-400 text-xs mt-1">{formik.errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 pr-11 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3.5 text-gray-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{formik.errors.confirmPassword}</p>
                )}
              </div>

              <div className="bg-[#141720] border border-white/10 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Security Standard:</span>
                {LIVE_RULES.map((rule) => {
                  const met = rule.test(formik.values.newPassword);
                  return (
                    <div key={rule.key} className="flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          met ? 'bg-white text-black' : 'border border-white/30 text-transparent'
                        }`}
                      >
                        {met && <Check size={10} strokeWidth={3} />}
                      </span>
                      <span className={`text-xs ${met ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {apiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
              >
                <span>{formik.isSubmitting ? 'Updating Key…' : 'Update Password'}</span>
                <ArrowRight size={15} />
              </button>
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
