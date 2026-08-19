import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LockKeyhole, ArrowLeft, Eye, EyeOff, Check, CheckCircle2 } from 'lucide-react';

// Matches the backend's password complexity rule exactly (same regex used in
// AdminProfile.jsx's reset-password flow, which hits the same
// /apiadmin/admin/resetadminpassword endpoint) — so the client never accepts
// something the server would reject.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const PASSWORD_ERROR =
  'Must be at least 8 characters and include uppercase, lowercase, a number, and a special character.';

const LIVE_RULES = [
  { key: 'length', label: 'Minimum 8 characters', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'Includes an uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Includes a lowercase letter', test: (v) => /[a-z]/.test(v) },
  { key: 'digit', label: 'Includes a number', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'Includes a special character', test: (v) => /[^A-Za-z\d]/.test(v) },
];

// These endpoints are hit before the admin is authenticated (no token yet),
// so this uses raw fetch directly rather than useApi — same reasoning as the
// user-facing ForgotPassword.jsx. useApi treats any 401 as "session expired"
// and force-navigates to /admin/login, which would break this flow, since
// sendotp/verifyotp can legitimately return 401 for "email not found" /
// "OTP invalid", which is a normal in-flow error here, not an expired session.
async function apiPost(path, body) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.status === false)) {
    throw new Error((data && data.message) || `Request failed: ${res.status}`);
  }
  return data;
}

export default function AdminForgotPassword() {
  const navigate = useNavigate();

  // email -> otp -> reset -> done
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Step 1: email ---
  const emailForm = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Enter a valid email address').required('Email is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError('');
      try {
        // Real endpoint: POST /apiadmin/admin/sendotp, body { email }.
        await apiPost('/apiadmin/admin/sendotp', { email: values.email });
        setEmail(values.email);
        setStep('otp');
      } catch (err) {
        setSubmitError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- Step 2: OTP ---
  const otpForm = useFormik({
    initialValues: { otp: '' },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{6}$/, 'Enter the 6-digit code')
        .required('Code is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError('');
      try {
        // Real endpoint: POST /apiadmin/admin/verifyotp, body { email, otp }.
        // Returns { resetToken } once the code checks out.
        const data = await apiPost('/apiadmin/admin/verifyotp', { email, otp: values.otp });
        setResetToken(data.resetToken);
        setStep('reset');
      } catch (err) {
        setSubmitError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResend = async () => {
    setSubmitError('');
    try {
      await apiPost('/apiadmin/admin/sendotp', { email });
    } catch (err) {
      setSubmitError(err.message || 'Could not resend the code. Please try again.');
    }
  };

  // --- Step 3: new password ---
  const resetForm = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      newPassword: Yup.string().required('New password is required').matches(PASSWORD_REGEX, PASSWORD_ERROR),
      confirmPassword: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError('');
      try {
        // Real endpoint: POST /apiadmin/admin/resetadminpassword,
        // body { resetToken, password, confirmPassword }.
        await apiPost('/apiadmin/admin/resetadminpassword', {
          resetToken,
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
        });
        setStep('done');
        setTimeout(() => navigate('/admin/login'), 1500);
      } catch (err) {
        // Token expired or otherwise invalid — send them back to request a
        // fresh code rather than dead-ending on this step.
        setSubmitError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <main className="relative flex w-full min-h-screen flex-row items-center justify-center overflow-hidden bg-[#F9F9F9] p-4 sm:p-5 lg:p-10">
      {/* Ambient background, matches AdminLogin */}
      <div className="pointer-events-none absolute -right-[10%] -top-[10%] z-0 h-[120%] w-[60%] opacity-[0.03]">
        <div className="h-full w-full rotate-12 bg-black" />
      </div>

      <section className="relative z-10 flex w-full max-w-full flex-col items-center bg-[#F9F9F9] sm:max-w-[380px] lg:max-w-[420px]">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 inline-block">
            <LockKeyhole size={48} strokeWidth={1} className="mx-auto text-black" />
          </div>
          <h1
            className="mb-2 text-[20px] leading-[32px] tracking-[-0.02em] text-black sm:text-[22px] lg:text-[24px]"
            style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400 }}
          >
            ADMIN
          </h1>
          <p
            className="text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#5D5E63]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Credential Reset
          </p>
        </header>

        {/* Card */}
        <div className="w-full border border-[rgba(93,94,99,0.10)] bg-white p-6 sm:p-8 shadow-sm">
          {/* Step 1 — request a code */}
          {step === 'email' && (
            <>
              <p
                className="mb-6 text-center text-[13px] leading-5 text-[#5D5E63]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Enter your admin email and we'll send a one-time code to reset your password.
              </p>

              <form onSubmit={emailForm.handleSubmit} noValidate className="flex flex-col gap-6">
                <div className="relative flex flex-col">
                  <label
                    htmlFor="email"
                    className="mb-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@example.com"
                    value={emailForm.values.email}
                    onChange={emailForm.handleChange}
                    onBlur={emailForm.handleBlur}
                    className="w-full border-0 border-b border-[rgba(93,94,99,0.30)] bg-transparent py-3 text-[16px] font-normal text-[#1A1C1C] outline-none transition-colors duration-200 placeholder:text-[#C4C7C7] focus:border-black"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  {emailForm.touched.email && emailForm.errors.email && (
                    <p className="mt-1 text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {emailForm.errors.email}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p className="-mt-4 text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={emailForm.isSubmitting}
                  className="w-full bg-black px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-[#5F5E5E] active:scale-[0.98] disabled:opacity-80"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {emailForm.isSubmitting ? 'Sending…' : 'Send Code'}
                </button>
              </form>

              <div className="flex justify-center mt-6">
                <Link
                  to="/admin/login"
                  className="group inline-flex items-center gap-2 transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, color: '#5D5E63' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#5D5E63')}
                >
                  <ArrowLeft size={12} />
                  <span className="group-hover:underline">Return to Sign In</span>
                </Link>
              </div>
            </>
          )}

          {/* Step 2 — enter the OTP */}
          {step === 'otp' && (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <CheckCircle2 size={32} className="text-[#3B6D11]" strokeWidth={1.5} />
                <p
                  className="mt-4 text-[13px] leading-5 text-[#5D5E63]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Enter the 6-digit code sent to {email}.
                </p>
              </div>

              <form onSubmit={otpForm.handleSubmit} noValidate className="flex flex-col gap-6">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="otp"
                    placeholder="123456"
                    maxLength={6}
                    value={otpForm.values.otp}
                    onChange={(e) => otpForm.setFieldValue('otp', e.target.value.replace(/\D/g, ''))}
                    onBlur={otpForm.handleBlur}
                    className="w-full border-0 border-b border-[rgba(93,94,99,0.30)] bg-transparent py-3 text-center text-[18px] tracking-[0.5em] text-[#1A1C1C] outline-none transition-colors duration-200 focus:border-black"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  {otpForm.touched.otp && otpForm.errors.otp && (
                    <p
                      className="mt-1 text-center text-[10px] text-red-600"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {otpForm.errors.otp}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p className="text-center text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={otpForm.isSubmitting}
                  className="w-full bg-black px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-[#5F5E5E] active:scale-[0.98] disabled:opacity-80"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {otpForm.isSubmitting ? 'Verifying…' : 'Verify Code'}
                </button>
              </form>

              <div className="flex flex-col items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-black underline-offset-4 hover:underline"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600 }}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setSubmitError('');
                  }}
                  className="group inline-flex items-center gap-2 transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 600, color: '#5D5E63' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#5D5E63')}
                >
                  <ArrowLeft size={12} />
                  <span className="group-hover:underline">Try another email</span>
                </button>
              </div>
            </>
          )}

          {/* Step 3 — set a new password */}
          {step === 'reset' && (
            <>
              <p
                className="mb-6 text-center text-[13px] leading-5 text-[#5D5E63]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Choose a new password for your admin account.
              </p>

              <form onSubmit={resetForm.handleSubmit} noValidate className="flex flex-col gap-5">
                <div className="relative flex flex-col">
                  <label
                    htmlFor="newPassword"
                    className="mb-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={resetForm.values.newPassword}
                      onChange={resetForm.handleChange}
                      onBlur={resetForm.handleBlur}
                      className="w-full border-0 border-b border-[rgba(93,94,99,0.30)] bg-transparent py-3 pr-10 text-[16px] font-normal text-[#1A1C1C] outline-none transition-colors duration-200 placeholder:text-[#C4C7C7] focus:border-black"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((s) => !s)}
                      className="absolute right-0 text-[#5D5E63] hover:text-black"
                      tabIndex={-1}
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                    </button>
                  </div>
                  {resetForm.touched.newPassword && resetForm.errors.newPassword && (
                    <p className="mt-1 text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {resetForm.errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="relative flex flex-col">
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={resetForm.values.confirmPassword}
                      onChange={resetForm.handleChange}
                      onBlur={resetForm.handleBlur}
                      className="w-full border-0 border-b border-[rgba(93,94,99,0.30)] bg-transparent py-3 pr-10 text-[16px] font-normal text-[#1A1C1C] outline-none transition-colors duration-200 placeholder:text-[#C4C7C7] focus:border-black"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      className="absolute right-0 text-[#5D5E63] hover:text-black"
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                    </button>
                  </div>
                  {resetForm.touched.confirmPassword && resetForm.errors.confirmPassword && (
                    <p className="mt-1 text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {resetForm.errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="bg-[#F0F0F0] rounded-md p-4 flex flex-col gap-2">
                  {LIVE_RULES.map((rule) => {
                    const met = rule.test(resetForm.values.newPassword);
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
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                        >
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {submitError && (
                  <p className="text-[10px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={resetForm.isSubmitting}
                  className="w-full bg-black px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-[#5F5E5E] active:scale-[0.98] disabled:opacity-80"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {resetForm.isSubmitting ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Step 4 — done */}
          {step === 'done' && (
            <div className="flex flex-col items-center text-center py-4">
              <CheckCircle2 size={36} className="text-[#3B6D11]" strokeWidth={1.5} />
              <h2
                className="mt-4 text-[18px] text-black"
                style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400 }}
              >
                Password Updated
              </h2>
              <p
                className="mt-2 text-[13px] text-[#5D5E63]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Taking you to sign in…
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p
            className="mx-auto max-w-[280px] text-[10px] leading-relaxed text-[#858383]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            This area is restricted to authorized administrators. All access attempts are logged and monitored.
          </p>
        </footer>
      </section>
    </main>
  );
}