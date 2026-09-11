import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
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
});

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth?.token);
  const user = useSelector((state) => state.auth?.user) || {};

  const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const currentEmail = user.email || '';

  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setFormError('');
      setSuccessMessage('');

      try {
        const res = await fetch(
          `${API_URL}/apiuser/user/updateprofile`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              firstName: values.firstName.trim(),
              lastName: values.lastName.trim(),
            }),
          }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.status === false)) {
          setFormError(
            (data && data.message) ||
              'Something went wrong. Please try again.'
          );
          return;
        }

        dispatch(updateUser(data.user));

        setSuccessMessage('Client dossier updated successfully.');

        setTimeout(() => {
          navigate('/myaccount');
        }, 1200);
      } catch (error) {
        setFormError(
          'Unable to reach the server. Please try again.'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --------------------------------------------------
  // SEND OTP TO CURRENT EMAIL
  // --------------------------------------------------
  const handleSendEmailOTP = async () => {
    setEmailError('');
    setEmailSuccess('');
    setFormError('');

    setEmailLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/apiuser/user/send-email-change-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.status === false)) {
        setEmailError(
          (data && data.message) ||
            'Failed to send OTP. Please try again.'
        );
        return;
      }

      setEmailOtpSent(true);
      setEmailOtpVerified(false);
      setEmailOtp('');
      setEmailSuccess(
        'OTP sent to your current email address.'
      );
    } catch (error) {
      setEmailError(
        'Unable to reach the server. Please try again.'
      );
    } finally {
      setEmailLoading(false);
    }
  };

  // --------------------------------------------------
  // VERIFY OTP
  // --------------------------------------------------
  const handleVerifyEmailOTP = async () => {
    setEmailError('');
    setEmailSuccess('');

    if (!emailOtp.trim()) {
      setEmailError('Please enter the OTP.');
      return;
    }

    if (emailOtp.trim().length !== 6) {
      setEmailError('OTP must contain 6 digits.');
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/apiuser/user/verify-email-change-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            otp: emailOtp.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.status === false)) {
        setEmailError(
          (data && data.message) ||
            'Invalid OTP. Please try again.'
        );
        return;
      }

      setEmailOtpVerified(true);
      setEmailSuccess(
        'OTP verified. You can now enter your new email address.'
      );
    } catch (error) {
      setEmailError(
        'Unable to reach the server. Please try again.'
      );
    } finally {
      setEmailLoading(false);
    }
  };

  // --------------------------------------------------
  // CHANGE EMAIL AFTER OTP VERIFICATION
  // --------------------------------------------------
  const handleChangeEmail = async () => {
    setEmailError('');
    setEmailSuccess('');

    const cleanEmail = newEmail.trim().toLowerCase();

    if (!emailOtpVerified) {
      setEmailError(
        'Please verify the OTP before changing your email.'
      );
      return;
    }

    if (!cleanEmail) {
      setEmailError('Please enter your new email address.');
      return;
    }
const emailRegex =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|in|co|io|me)$/i;

    if (!emailRegex.test(cleanEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (cleanEmail === currentEmail.toLowerCase()) {
      setEmailError(
        'New email must be different from your current email.'
      );
      return;
    }

    setEmailLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/apiuser/user/change-email`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            newEmail: cleanEmail,
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.status === false)) {
        setEmailError(
          (data && data.message) ||
            'Unable to change email. Please try again.'
        );
        return;
      }

      dispatch(updateUser(data.user));

      setNewEmail('');
      setEmailOtp('');
      setEmailOtpSent(false);
      setEmailOtpVerified(false);

      setEmailSuccess(
        'Email address changed successfully.'
      );
    } catch (error) {
      setEmailError(
        'Unable to reach the server. Please try again.'
      );
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_70%)] pointer-events-none" />

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
              Update your personal credentials and verify your email changes.
            </p>
          </div>

          {successMessage ? (
            <div className="p-4 bg-white/10 border border-white/20 rounded-2xl text-center text-sm font-medium text-white">
              {successMessage}
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* -------------------------------- */}
              {/* PERSONAL INFORMATION */}
              {/* -------------------------------- */}

              <form
                onSubmit={formik.handleSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* First Name */}
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

                    {formik.touched.firstName &&
                      formik.errors.firstName && (
                        <p className="text-red-400 text-xs mt-1">
                          {formik.errors.firstName}
                        </p>
                      )}
                  </div>

                  {/* Last Name */}
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

                    {formik.touched.lastName &&
                      formik.errors.lastName && (
                        <p className="text-red-400 text-xs mt-1">
                          {formik.errors.lastName}
                        </p>
                      )}
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
                >
                  <span>
                    {formik.isSubmitting
                      ? 'Saving Changes…'
                      : 'Save Personal Details'}
                  </span>

                  <ArrowRight size={15} />
                </button>
              </form>

              {/* -------------------------------- */}
              {/* EMAIL CHANGE */}
              {/* -------------------------------- */}

              <div className="border-t border-white/10 pt-6">

                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Email Address
                  </p>

                  <p className="text-sm text-white mt-1 break-all">
                    {currentEmail}
                  </p>
                </div>

                {!emailOtpSent && !emailOtpVerified && (
                  <button
                    type="button"
                    onClick={handleSendEmailOTP}
                    disabled={emailLoading}
                    className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all disabled:opacity-60"
                  >
                    {emailLoading
                      ? 'Sending OTP…'
                      : 'Send OTP'}
                  </button>
                )}

                {/* OTP */}
                {emailOtpSent && !emailOtpVerified && (
                  <div className="flex flex-col gap-3">

                    <p className="text-xs text-gray-400">
                      A 6-digit verification code has been sent to your current email address.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter OTP"
                      value={emailOtp}
                      onChange={(e) =>
                        setEmailOtp(
                          e.target.value.replace(/\D/g, '')
                        )
                      }
                      className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors tracking-[0.3em] text-center"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyEmailOTP}
                      disabled={emailLoading}
                      className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all disabled:opacity-60"
                    >
                      {emailLoading
                        ? 'Verifying…'
                        : 'Verify OTP'}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendEmailOTP}
                      disabled={emailLoading}
                      className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Resend OTP
                    </button>
                  </div>
                )}

                {/* New Email */}
                {emailOtpVerified && (
                  <div className="flex flex-col gap-3">

                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-300">
                      Your current email has been verified successfully.
                    </div>

                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      New Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="newemail@example.com"
                      value={newEmail}
                      onChange={(e) =>
                        setNewEmail(e.target.value)
                      }
                      className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                    />

                    <button
                      type="button"
                      onClick={handleChangeEmail}
                      disabled={emailLoading}
                      className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all disabled:opacity-60"
                    >
                      {emailLoading
                        ? 'Updating Email…'
                        : 'Change Email'}
                    </button>
                  </div>
                )}

                {/* Email messages */}
                {emailError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                    {emailError}
                  </div>
                )}

                {emailSuccess && (
                  <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white text-center">
                    {emailSuccess}
                  </div>
                )}
              </div>

              {/* Cancel */}
              <div className="text-center">
                <Link
                  to="/myaccount"
                  className="text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  Cancel and return
                </Link>
              </div>

            </div>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-[10px] text-gray-500 tracking-widest uppercase">
        256-Bit Encrypted Atelier Access • Geneva Standard
      </footer>
    </div>
  );
}
