import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';

// Same policy the backend enforces on register/reset — kept in sync so the
// client never accepts something the server would reject.
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

// Two at-a-glance rules shown in the requirements card, checked live as the
// user types — the full policy above is still what actually gates submit.
const LIVE_RULES = [
  { key: 'length', label: 'Minimum 8 characters', test: (v) => v.length >= 8 },
  {
    key: 'numberOrSymbol',
    label: 'Includes numbers or symbols',
    test: (v) => /\d/.test(v) || /[^A-Za-z0-9]/.test(v),
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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/apiuser/user/updateprofile`, {
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
        setSuccessMessage('Password updated successfully.');
        setTimeout(() => navigate('/login'), 1500);
      } catch {
        setApiError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="w-full flex justify-center bg-[#F9F9F9] px-5 py-16">
      <div className="w-full max-w-[448px] flex flex-col items-center gap-8">
        <h1
          className="text-center text-black text-[32px] font-normal"
          style={{ fontFamily: 'var(--font-caslon)', lineHeight: '40px' }}
        >
          Security &amp; Access
        </h1>

        {successMessage ? (
          <p className="text-sm text-black text-center" style={{ fontFamily: 'var(--font-inter)' }}>
            {successMessage}
          </p>
        ) : (
          <form onSubmit={formik.handleSubmit} noValidate className="w-full flex flex-col gap-5">
            {/* New Password */}
            <div>
              <div className="relative flex items-center">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="New Password"
                  autoComplete="new-password"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border-0 border-b bg-transparent pr-8 text-[16px] text-black outline-none transition-colors duration-300 placeholder:text-[#9A9C9C] focus:border-black"
                  style={{ fontFamily: 'var(--font-inter)', borderColor: '#C4C7C7', padding: '12px 0px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-0 text-[#5D5E63] hover:text-black"
                  tabIndex={-1}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="mt-1 text-[12px] text-red-600" style={{ fontFamily: 'var(--font-inter)' }}>
                  {formik.errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  autoComplete="new-password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border-0 border-b bg-transparent pr-8 text-[16px] text-black outline-none transition-colors duration-300 placeholder:text-[#9A9C9C] focus:border-black"
                  style={{ fontFamily: 'var(--font-inter)', borderColor: '#C4C7C7', padding: '12px 0px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-0 text-[#5D5E63] hover:text-black"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-[12px] text-red-600" style={{ fontFamily: 'var(--font-inter)' }}>
                  {formik.errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Requirements card */}
            <div className="bg-[#F0F0F0] rounded-md p-4 flex flex-col gap-2">
              {LIVE_RULES.map((rule) => {
                const met = rule.test(formik.values.newPassword);
                return (
                  <div key={rule.key} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        met ? 'bg-black' : 'border border-[#C4C7C7]'
                      }`}
                    >
                      {met && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                    </span>
                    <span
                      className={met ? 'text-black' : 'text-[#5D5E63]'}
                      style={{ fontFamily: 'var(--font-inter)', fontSize: '13px' }}
                    >
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {apiError && (
              <p className="text-[12px] text-red-600" style={{ fontFamily: 'var(--font-inter)' }}>
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-black text-white transition-colors duration-300 hover:bg-[#2F3131] active:scale-[0.98] disabled:opacity-70"
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '20px 0',
              }}
            >
              {formik.isSubmitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-[#5D5E63] underline hover:text-black transition-colors duration-200"
          style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', fontWeight: 600 }}
        >
          Cancel and return to sign in
        </button>
      </div>
    </div>
  );
}
