import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

// Static display content — not fetched from the backend.
const PROFILE = {
  name: 'Alexandra Chronos',
  bio: 'Overseeing catalogue curation and order operations for the Chronos horology collection.',
  avatar: null,
};

const COMPANY = {
  name: 'Chronos Horology Ltd.',
  headquarters: 'Geneva, Switzerland',
  bio: 'Independent watchmaker crafting heritage timepieces since 2026, blending traditional technique with modern precision.',
};

export default function AdminProfile() {
  const user = useSelector((state) => state.auth.user);
  const { post } = useApi();

  // ==============================
  // CHANGE EMAIL WORKFLOW
  // ==============================

  const [newEmail, setNewEmail] = useState('');
  const [emailOtpRequested, setEmailOtpRequested] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailChangeError, setEmailChangeError] = useState(null);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [emailOtpSubmitting, setEmailOtpSubmitting] = useState(false);
  const [emailVerifySubmitting, setEmailVerifySubmitting] = useState(false);

  // ==============================
  // RESET PASSWORD WORKFLOW
  // ==============================

  const [email, setEmail] = useState(user?.email || '');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  // Password validation
  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  // ==============================
  // CHANGE EMAIL - SEND OTP
  // ==============================

  const handleRequestEmailChangeOTP = async (e) => {
    e.preventDefault();

    setEmailChangeError(null);
    setEmailChangeSuccess(false);

    const cleanNewEmail = newEmail.toLowerCase().trim();

    if (!cleanNewEmail) {
      setEmailChangeError('Please enter a new email address.');
      return;
    }

    if (
      cleanNewEmail === user?.email?.toLowerCase().trim()
    ) {
      setEmailChangeError(
        'New email must be different from your current email.'
      );
      return;
    }

    setEmailOtpSubmitting(true);

    try {
      await post('/apiadmin/admin/change-email', {
        newEmail: cleanNewEmail,
      });

      setEmailOtpRequested(true);
      setEmailOtp('');
    } catch (err) {
      setEmailChangeError(
        err.message || 'Failed to send OTP.'
      );
    } finally {
      setEmailOtpSubmitting(false);
    }
  };

  // ==============================
  // CHANGE EMAIL - VERIFY OTP
  // ==============================

  const handleVerifyEmailChangeOTP = async (e) => {
    e.preventDefault();

    setEmailChangeError(null);

    if (emailOtp.length !== 6) {
      setEmailChangeError(
        'Enter the 6-digit OTP sent to your new email.'
      );
      return;
    }

    setEmailVerifySubmitting(true);

    try {
      const data = await post(
        '/apiadmin/admin/verify-email',
        {
          otp: emailOtp,
        }
      );

      setEmailChangeSuccess(true);

      setNewEmail('');
      setEmailOtp('');
      setEmailOtpRequested(false);

      console.log('Updated admin email:', data.email);

      // Reload so Redux/profile displays the updated email
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setEmailChangeError(
        err.message || 'Email verification failed.'
      );
    } finally {
      setEmailVerifySubmitting(false);
    }
  };

  // ==============================
  // FORGOT PASSWORD - SEND OTP
  // ==============================

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    setResetError(null);
    setOtpSubmitting(true);

    try {
      await post('/apiadmin/admin/sendotp', {
        email,
      });

      setOtpRequested(true);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setOtpSubmitting(false);
    }
  };

  // ==============================
  // FORGOT PASSWORD - VERIFY OTP
  // ==============================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setResetError(null);

    if (otp.length !== 6) {
      setResetError(
        'Enter the 6-digit OTP sent to your email.'
      );
      return;
    }

    setVerifySubmitting(true);

    try {
      const data = await post(
        '/apiadmin/admin/verifyotp',
        {
          email,
          otp,
        }
      );

      setResetToken(data.resetToken);
      setOtpVerified(true);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setVerifySubmitting(false);
    }
  };

  // ==============================
  // RESET PASSWORD
  // ==============================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setResetError(null);

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      setResetError(
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
      );
      return;
    }

    setResetSubmitting(true);

    try {
      await post(
        '/apiadmin/admin/resetadminpassword',
        {
          resetToken,
          password: newPassword,
          confirmPassword,
        }
      );

      setResetSuccess(true);

      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpRequested(false);
      setOtpVerified(false);
      setResetToken(null);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen max-w-[1440px] mx-auto px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-24 bg-[#F9F9F9] text-[#1A1C1C]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      <div className="w-full max-w-[1440px] mx-auto">

        {/* ==============================
            PAGE HEADER
        ============================== */}

        <div className="mb-10 sm:mb-12 lg:mb-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#5E5E5E] mb-4">
            Established 2026
          </p>

          <h1
            className="text-[24px] leading-8 sm:text-[28px] sm:leading-9 lg:text-[32px] lg:leading-10 font-normal text-black mb-3"
            style={{
              fontFamily: "'Libre Caslon Text', serif",
            }}
          >
            Welcome to your Admin Profile
          </h1>

          <p className="text-sm sm:text-base text-[#5E5E5E] max-w-[560px]">
            Manage your personal details, company information, and account security from one place.
          </p>
        </div>

        {/* ==============================
            PROFILE INFO
        ============================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 pb-10 sm:pb-12 lg:pb-16 border-b border-[#CFC4C5] mb-10 sm:mb-12 lg:mb-16">

          <div className="lg:col-span-4">
            <h2
              className="text-xl sm:text-2xl font-normal text-black mb-2"
              style={{
                fontFamily: "'Libre Caslon Text', serif",
              }}
            >
              Profile Details
            </h2>

            <p className="text-sm text-[#5E5E5E]">
              Your personal information and professional bio.
            </p>
          </div>

          <div className="lg:col-span-8">

            <div className="flex justify-center sm:justify-end mb-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-[#CFC4C5] overflow-hidden bg-[#EEEEEE] shadow-sm flex items-center justify-center">

                {PROFILE.avatar ? (
                  <img
                    src={PROFILE.avatar}
                    alt={PROFILE.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-medium text-[#5E5E5E]">
                    {PROFILE.name?.[0]}
                  </span>
                )}

              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">

              <div>
                <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                  Name
                </p>

                <p className="text-sm pb-2 border-b border-[#CFC4C5] break-words">
                  {PROFILE.name}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                  Email
                </p>

                <p className="text-sm pb-2 border-b border-[#CFC4C5] break-words">
                  {user?.email}
                </p>
              </div>

            </div>

            <div>
              <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                Professional Bio
              </p>

              <p className="text-sm leading-relaxed pb-2 border-b border-[#CFC4C5]">
                {PROFILE.bio}
              </p>
            </div>

          </div>
        </section>

        {/* ==============================
            COMPANY DETAILS
        ============================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 pb-10 sm:pb-12 lg:pb-16 border-b border-[#CFC4C5] mb-10 sm:mb-12 lg:mb-16">

          <div className="lg:col-span-4">
            <h2
              className="text-xl sm:text-2xl font-normal text-black mb-2"
              style={{
                fontFamily: "'Libre Caslon Text', serif",
              }}
            >
              Company Details
            </h2>

            <p className="text-sm text-[#5E5E5E]">
              Business information on record.
            </p>
          </div>

          <div className="lg:col-span-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">

              <div>
                <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                  Company Name
                </p>

                <p className="text-sm pb-2 border-b border-[#CFC4C5] break-words">
                  {COMPANY.name}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                  Headquarters
                </p>

                <p className="text-sm pb-2 border-b border-[#CFC4C5] break-words">
                  {COMPANY.headquarters}
                </p>
              </div>

            </div>

            <div>
              <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                Company Bio
              </p>

              <p className="text-sm leading-relaxed pb-2 border-b border-[#CFC4C5]">
                {COMPANY.bio}
              </p>
            </div>

          </div>
        </section>

        {/* ==============================
            CHANGE EMAIL
        ============================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 pb-10 sm:pb-12 lg:pb-16 border-b border-[#CFC4C5] mb-10 sm:mb-12 lg:mb-16">

          <div className="lg:col-span-4">

            <h2
              className="text-xl sm:text-2xl font-normal text-black mb-2"
              style={{
                fontFamily: "'Libre Caslon Text', serif",
              }}
            >
              Change Email
            </h2>

            <p className="text-sm text-[#5E5E5E]">
              Verify your new email address with a one-time verification code before changing it.
            </p>

          </div>

          <div className="lg:col-span-8">

            {/* SUCCESS */}

            {emailChangeSuccess ? (

              <div className="bg-[#F3F3F4] px-5 py-4 flex items-center gap-3">

                <CheckCircle2
                  size={18}
                  className="text-[#3B6D11] flex-shrink-0"
                />

                <span className="text-sm text-[#1A1C1C]">
                  Email changed successfully.
                </span>

              </div>

            ) : (

              <>

                {/* NEW EMAIL */}

                <form
                  onSubmit={handleRequestEmailChangeOTP}
                  className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6"
                >

                  <div className="flex-1 w-full">

                    <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                      New Email
                    </p>

                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        setEmailChangeError(null);
                      }}
                      placeholder="Enter new email"
                      required
                      className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                    />

                  </div>

                  <button
                    type="submit"
                    disabled={emailOtpSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-black text-white text-[11px] uppercase tracking-wide transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
                  >
                    {emailOtpSubmitting
                      ? 'Sending...'
                      : 'Send OTP'}
                  </button>

                </form>

                {/* ERROR */}

                {emailChangeError && !emailOtpRequested && (
                  <p className="text-sm text-[#A32D2D] mb-6">
                    {emailChangeError}
                  </p>
                )}

                {/* OTP SENT */}

                {emailOtpRequested && (
                  <div className="bg-[#F3F3F4] px-5 py-4 flex items-center gap-3 mb-8">

                    <CheckCircle2
                      size={18}
                      className="text-[#3B6D11] flex-shrink-0"
                    />

                    <span className="text-sm text-[#1A1C1C] break-words">
                      OTP sent to {newEmail}
                    </span>

                  </div>
                )}

                {/* VERIFY EMAIL OTP */}

                {emailOtpRequested && (
                  <form onSubmit={handleVerifyEmailChangeOTP}>

                    <div className="mb-6">

                      <p className="text-[10px] uppercase text-[#5E5E5E] mb-3">
                        Enter OTP
                      </p>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) =>
                          setEmailOtp(
                            e.target.value.replace(/\D/g, '')
                          )
                        }
                        required
                        className="w-full max-w-[240px] text-center border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-lg tracking-[0.5em] focus:outline-none focus:border-black"
                      />

                    </div>

                    {emailChangeError && (
                      <p className="text-sm text-[#A32D2D] mb-6">
                        {emailChangeError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={emailVerifySubmitting}
                      className="w-full sm:w-auto px-6 py-3 bg-black text-white text-[11px] uppercase tracking-wide transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
                    >
                      {emailVerifySubmitting
                        ? 'Verifying...'
                        : 'Verify Email'}
                    </button>

                  </form>
                )}

              </>

            )}

          </div>
        </section>

        {/* ==============================
            SECURITY / RESET PASSWORD
        ============================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">

          <div className="lg:col-span-4">

            <h2
              className="text-xl sm:text-2xl font-normal text-black mb-2"
              style={{
                fontFamily: "'Libre Caslon Text', serif",
              }}
            >
              Security
            </h2>

            <p className="text-sm text-[#5E5E5E]">
              Reset your password using a one-time verification code sent to your email.
            </p>

          </div>

          <div className="lg:col-span-8">

            {resetSuccess ? (

              <div className="bg-[#F3F3F4] px-5 py-4 flex items-center gap-3">

                <CheckCircle2
                  size={18}
                  className="text-[#3B6D11] flex-shrink-0"
                />

                <span className="text-sm text-[#1A1C1C]">
                  Password reset successfully.
                </span>

              </div>

            ) : (

              <>

                {/* EMAIL + REQUEST OTP */}

                <form
                  onSubmit={handleRequestOtp}
                  className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6"
                >

                  <div className="flex-1 w-full">

                    <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                      Email
                    </p>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      required
                      className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                    />

                  </div>

                  <button
                    type="submit"
                    disabled={otpSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-black text-white text-[11px] uppercase tracking-wide transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
                  >
                    {otpSubmitting
                      ? 'Sending...'
                      : 'Request OTP'}
                  </button>

                </form>

                {/* OTP SUCCESS MESSAGE */}

                {otpRequested && (
                  <div className="bg-[#F3F3F4] px-5 py-4 flex items-center gap-3 mb-8">

                    <CheckCircle2
                      size={18}
                      className="text-[#3B6D11] flex-shrink-0"
                    />

                    <span className="text-sm text-[#1A1C1C] break-words">
                      OTP sent to {email}
                    </span>

                  </div>
                )}

                {/* VERIFY PASSWORD RESET OTP */}

                {otpRequested && !otpVerified && (

                  <form onSubmit={handleVerifyOtp}>

                    <div className="mb-8">

                      <p className="text-[10px] uppercase text-[#5E5E5E] mb-3">
                        Enter OTP
                      </p>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value.replace(/\D/g, '')
                          )
                        }
                        required
                        className="w-full max-w-[240px] text-center border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-lg tracking-[0.5em] focus:outline-none focus:border-black"
                      />

                    </div>

                    {resetError && (
                      <p className="text-sm text-[#A32D2D] mb-6">
                        {resetError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={verifySubmitting}
                      className="w-full sm:w-auto px-6 py-3 bg-black text-white text-[11px] uppercase tracking-wide transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
                    >
                      {verifySubmitting
                        ? 'Verifying...'
                        : 'Verify OTP'}
                    </button>

                  </form>

                )}

                {/* NEW PASSWORD */}

                {otpVerified && (

                  <form onSubmit={handleResetPassword}>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-2">

                      <div>

                        <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                          New Password
                        </p>

                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(e.target.value)
                          }
                          required
                          minLength={8}
                          className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                        />

                      </div>

                      <div>

                        <p className="text-[10px] uppercase text-[#5E5E5E] mb-2">
                          Confirm Password
                        </p>

                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          required
                          minLength={8}
                          className="w-full border-0 border-b border-[#CFC4C5] bg-transparent py-2 text-sm focus:outline-none focus:border-black"
                        />

                      </div>

                    </div>

                    <p className="text-[11px] text-[#5E5E5E] mb-8">
                      At least 8 characters, with uppercase, lowercase, a number, and a special character.
                    </p>

                    {resetError && (
                      <p className="text-sm text-[#A32D2D] mb-6">
                        {resetError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={resetSubmitting}
                      className="w-full sm:w-auto px-8 py-4 bg-black text-white text-[11px] uppercase tracking-wide transition-opacity duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50"
                    >
                      {resetSubmitting
                        ? 'Resetting...'
                        : 'Reset Password'}
                    </button>

                  </form>

                )}

                {!otpRequested && resetError && (
                  <p className="text-sm text-[#A32D2D] mt-4">
                    {resetError}
                  </p>
                )}

              </>

            )}

          </div>
        </section>

      </div>
    </main>
  );
}