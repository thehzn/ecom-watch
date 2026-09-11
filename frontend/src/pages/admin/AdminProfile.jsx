
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  CheckCircle2,
  ShieldCheck,
  Mail,
  LockKeyhole,
  UserRound,
  Building2,
  MapPin,
  Crown,
  ArrowRight,
} from 'lucide-react';
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

  // ==========================================
  // CURRENT EMAIL
  // ==========================================

  const [currentEmail, setCurrentEmail] = useState(
    user?.email || ''
  );

  useEffect(() => {
    if (user?.email) {
      setCurrentEmail(user.email);
      setEmail(user.email);
    }
  }, [user?.email]);

  // ==========================================
  // CHANGE EMAIL WORKFLOW
  // ==========================================

  const [newEmail, setNewEmail] = useState('');
  const [emailOtpRequested, setEmailOtpRequested] =
    useState(false);
  const [emailOtpVerified, setEmailOtpVerified] =
    useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  const [emailChangeError, setEmailChangeError] =
    useState(null);

  const [emailChangeSuccess, setEmailChangeSuccess] =
    useState(false);

  const [emailOtpSubmitting, setEmailOtpSubmitting] =
    useState(false);

  const [emailVerifySubmitting, setEmailVerifySubmitting] =
    useState(false);

  const [emailChangeSubmitting, setEmailChangeSubmitting] =
    useState(false);

  // ==========================================
  // RESET PASSWORD WORKFLOW
  // ==========================================

  const [email, setEmail] = useState(user?.email || '');
  const [otpRequested, setOtpRequested] =
    useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] =
    useState(false);
  const [resetToken, setResetToken] =
    useState(null);

  const [newPassword, setNewPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [resetSubmitting, setResetSubmitting] =
    useState(false);

  const [resetError, setResetError] =
    useState(null);

  const [resetSuccess, setResetSuccess] =
    useState(false);

  const [otpSubmitting, setOtpSubmitting] =
    useState(false);

  const [verifySubmitting, setVerifySubmitting] =
    useState(false);

  // ==========================================
  // PASSWORD VALIDATION
  // ==========================================

  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  // ==========================================
  // CHANGE EMAIL - SEND OTP
  // OTP GOES TO CURRENT ADMIN EMAIL
  // ==========================================

  const handleRequestEmailChangeOTP = async (e) => {
    e.preventDefault();

    setEmailChangeError(null);
    setEmailChangeSuccess(false);
    setEmailOtpSubmitting(true);

    try {
      await post('/apiadmin/admin/change-email');

      setEmailOtpRequested(true);
      setEmailOtpVerified(false);
      setEmailOtp('');
      setNewEmail('');
    } catch (err) {
      setEmailChangeError(
        err.message || 'Failed to send OTP.'
      );
    } finally {
      setEmailOtpSubmitting(false);
    }
  };

  // ==========================================
  // CHANGE EMAIL - VERIFY OTP
  // ==========================================

  const handleVerifyEmailChangeOTP = async (e) => {
  e.preventDefault();

  setEmailChangeError(null);

  if (emailOtp.length !== 6) {
    setEmailChangeError(
      'Enter the 6-digit OTP sent to your current email.'
    );
    return;
  }

  setEmailVerifySubmitting(true);

  try {
    await post('/apiadmin/admin/verify-email', {
      otp: emailOtp,
    });

    setEmailOtpVerified(true);
    setEmailChangeError(null);
  } catch (err) {
    setEmailChangeError(
      err.message || 'OTP verification failed.'
    );
  } finally {
    setEmailVerifySubmitting(false);
  }
};
  // ==========================================
  // CHANGE EMAIL - UPDATE EMAIL
  // ==========================================

  const handleChangeAdminEmail = async (e) => {
    e.preventDefault();

    setEmailChangeError(null);
    setEmailChangeSuccess(false);

    const cleanNewEmail =
      newEmail.toLowerCase().trim();

    if (!emailOtpVerified) {
      setEmailChangeError(
        'Please verify your current email first.'
      );
      return;
    }

    if (!cleanNewEmail) {
      setEmailChangeError(
        'Please enter your new email address.'
      );
      return;
    }

    if (
      cleanNewEmail ===
      currentEmail.toLowerCase().trim()
    ) {
      setEmailChangeError(
        'New email must be different from your current email.'
      );
      return;
    }

    const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|in|co|io|me)$/i;

    if (!emailRegex.test(cleanNewEmail)) {
      setEmailChangeError(
        'Please enter a valid email address.'
      );
      return;
    }

    setEmailChangeSubmitting(true);

    try {
      const data = await post(
        '/apiadmin/admin/update-email',
        {
          newEmail: cleanNewEmail,
        }
      );

      const updatedEmail =
        data?.email || cleanNewEmail;

      // Immediately update the profile UI.
      setCurrentEmail(updatedEmail);
      setEmail(updatedEmail);

      setNewEmail('');
      setEmailOtp('');
      setEmailOtpRequested(false);
      setEmailOtpVerified(false);

      setEmailChangeError(null);
      setEmailChangeSuccess(true);
    } catch (err) {
      setEmailChangeError(
        err.message || 'Failed to change email.'
      );
    } finally {
      setEmailChangeSubmitting(false);
    }
  };

  // ==========================================
  // FORGOT PASSWORD - SEND OTP
  // ==========================================

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    setResetError(null);
    setResetSuccess(false);
    setOtpSubmitting(true);

    try {
      await post('/apiadmin/admin/sendotp', {
        email,
      });

      setOtpRequested(true);
      setOtp('');
    } catch (err) {
      setResetError(
        err.message || 'Failed to send OTP.'
      );
    } finally {
      setOtpSubmitting(false);
    }
  };

  // ==========================================
  // FORGOT PASSWORD - VERIFY OTP
  // ==========================================

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
      setResetError(
        err.message || 'OTP verification failed.'
      );
    } finally {
      setVerifySubmitting(false);
    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setResetError(null);

    if (newPassword !== confirmPassword) {
      setResetError(
        'Passwords do not match.'
      );
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
      setResetError(
        err.message || 'Failed to reset password.'
      );
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#F7F7F5] text-[#181818]"
      style={{
        fontFamily: "'Work Sans', sans-serif",
      }}
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">

        {/* =====================================================
            PAGE INTRO
        ===================================================== */}

        <div className="mb-8 sm:mb-10">

          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[#777] mb-3">
            CHRONOS / ADMINISTRATION
          </p>

          <h1
            className="text-[30px] sm:text-[36px] lg:text-[42px] leading-tight font-normal text-[#111]"
            style={{
              fontFamily: "'Libre Caslon Text', serif",
            }}
          >
            Administrator Profile
          </h1>

        </div>

        {/* =====================================================
            PREMIUM ADMIN HEADER
        ===================================================== */}

        <section className="relative overflow-hidden bg-[#111] text-white mb-12 sm:mb-16">

          {/* Decorative circle */}

          <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full border border-white/10" />

          <div className="absolute right-12 -bottom-28 w-72 h-72 rounded-full border border-white/5" />

          <div className="relative p-6 sm:p-8 lg:p-12">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

              {/* LEFT */}

              <div className="flex flex-col sm:flex-row sm:items-center gap-6">

                {/* Avatar */}

                <div className="relative flex-shrink-0">

                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/20 bg-[#202020] flex items-center justify-center overflow-hidden">

                    {PROFILE.avatar ? (
                      <img
                        src={PROFILE.avatar}
                        alt={PROFILE.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-3xl sm:text-4xl text-white/90"
                        style={{
                          fontFamily:
                            "'Libre Caslon Text', serif",
                        }}
                      >
                        {PROFILE.name?.[0]}
                      </span>
                    )}

                  </div>

                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#111] flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#87966D]" />
                  </div>

                </div>

                {/* NAME */}

                <div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">

                    <span className="text-[9px] uppercase tracking-[0.22em] text-white/50">
                      Administrator
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-white/15 text-[8px] uppercase tracking-[0.16em] text-white/70">
                      <Crown size={10} />
                      Super Admin
                    </span>

                  </div>

                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-normal mb-2"
                    style={{
                      fontFamily:
                        "'Libre Caslon Text', serif",
                    }}
                  >
                    {PROFILE.name}
                  </h2>

                  <p className="text-sm text-white/55 max-w-[480px] leading-relaxed">
                    {PROFILE.bio}
                  </p>

                </div>

              </div>

              {/* RIGHT STATUS */}

              <div className="md:text-right">

                <div className="inline-flex items-center gap-2 px-3 py-2 border border-white/15">

                  <span className="w-2 h-2 rounded-full bg-[#87966D]" />

                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/75">
                    Account Active
                  </span>

                </div>

                <p className="text-[10px] text-white/35 mt-3">
                  Chronos Horology Ltd.
                </p>

              </div>

            </div>

            {/* EMAIL BAR */}

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="flex items-center gap-3">

                <Mail
                  size={15}
                  className="text-white/40"
                />

                <span className="text-sm text-white/75 break-all">
                  {currentEmail || 'Loading email...'}
                </span>

              </div>

              <div className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#AEB89A]">

                <CheckCircle2 size={13} />

                Verified account

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            PROFILE DETAILS
        ===================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pb-12 sm:pb-16 border-b border-[#D6D1CD]">

          {/* SECTION TITLE */}

          <div className="lg:col-span-4">

            <div className="flex items-center gap-3 mb-3">

              <UserRound
                size={17}
                strokeWidth={1.4}
                className="text-[#777]"
              />

              <span className="text-[9px] uppercase tracking-[0.25em] text-[#777]">
                Administrator
              </span>

            </div>

            <h2
              className="text-2xl sm:text-3xl font-normal text-[#111] mb-3"
              style={{
                fontFamily:
                  "'Libre Caslon Text', serif",
              }}
            >
              Profile Details
            </h2>

            <p className="text-sm text-[#777] leading-relaxed max-w-[320px]">
              Personal and professional information associated with your administrator account.
            </p>

          </div>

          {/* DETAILS */}

          <div className="lg:col-span-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">

              <div className="group">

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                  Name
                </p>

                <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD] group-hover:border-[#555] transition-colors">

                  <UserRound
                    size={15}
                    strokeWidth={1.3}
                    className="text-[#888]"
                  />

                  <p className="text-sm">
                    {PROFILE.name}
                  </p>

                </div>

              </div>

              <div className="group">

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                  Role
                </p>

                <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD] group-hover:border-[#555] transition-colors">

                  <Crown
                    size={15}
                    strokeWidth={1.3}
                    className="text-[#888]"
                  />

                  <p className="text-sm">
                    Super Administrator
                  </p>

                </div>

              </div>

              <div className="group">

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                  Email
                </p>

                <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD] group-hover:border-[#555] transition-colors">

                  <Mail
                    size={15}
                    strokeWidth={1.3}
                    className="text-[#888]"
                  />

                  <p className="text-sm break-all">
                    {currentEmail}
                  </p>

                </div>

              </div>

              <div className="group">

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                  Account Status
                </p>

                <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD] group-hover:border-[#555] transition-colors">

                  <span className="w-2 h-2 rounded-full bg-[#87966D]" />

                  <p className="text-sm">
                    Active
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-10">

              <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                Professional Bio
              </p>

              <p className="text-sm text-[#555] leading-7 max-w-[720px]">
                {PROFILE.bio}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            COMPANY DETAILS
        ===================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 py-12 sm:py-16 border-b border-[#D6D1CD]">

          <div className="lg:col-span-4">

            <div className="flex items-center gap-3 mb-3">

              <Building2
                size={17}
                strokeWidth={1.4}
                className="text-[#777]"
              />

              <span className="text-[9px] uppercase tracking-[0.25em] text-[#777]">
                Organisation
              </span>

            </div>

            <h2
              className="text-2xl sm:text-3xl font-normal text-[#111] mb-3"
              style={{
                fontFamily:
                  "'Libre Caslon Text', serif",
              }}
            >
              Company Details
            </h2>

            <p className="text-sm text-[#777] leading-relaxed max-w-[320px]">
              Business information associated with the Chronos administration.
            </p>

          </div>

          <div className="lg:col-span-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                  Company
                </p>

                <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">

                  <Building2
                    size={15}
                    strokeWidth={1.3}
                    className="text-[#888]"
                  />

                  <p className="text-sm">
                    {COMPANY.name}
                  </p>

                </div>

              </div>

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                  Headquarters
                </p>

                <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">

                  <MapPin
                    size={15}
                    strokeWidth={1.3}
                    className="text-[#888]"
                  />

                  <p className="text-sm">
                    {COMPANY.headquarters}
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-10">

              <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                Company Profile
              </p>

              <p className="text-sm text-[#555] leading-7 max-w-[720px]">
                {COMPANY.bio}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            CHANGE EMAIL
        ===================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 py-12 sm:py-16 border-b border-[#D6D1CD]">

          <div className="lg:col-span-4">

            <div className="flex items-center gap-3 mb-3">

              <Mail
                size={17}
                strokeWidth={1.4}
                className="text-[#777]"
              />

              <span className="text-[9px] uppercase tracking-[0.25em] text-[#777]">
                Account Access
              </span>

            </div>

            <h2
              className="text-2xl sm:text-3xl font-normal text-[#111] mb-3"
              style={{
                fontFamily:
                  "'Libre Caslon Text', serif",
              }}
            >
              Change Email
            </h2>

            <p className="text-sm text-[#777] leading-relaxed max-w-[340px]">
              Verify your current email before updating the address used to access the administrator account.
            </p>

          </div>

          <div className="lg:col-span-8">

            {/* SUCCESS */}

            {emailChangeSuccess ? (

              <div className="border border-[#C9D0C0] bg-[#F1F4ED] p-5 sm:p-6">

                <div className="flex items-start gap-4">

                  <CheckCircle2
                    size={20}
                    className="text-[#61714C] flex-shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-sm font-medium mb-1">
                      Email address updated
                    </p>

                    <p className="text-sm text-[#68705E] leading-relaxed">
                      Your administrator email is now{' '}
                      <span className="font-medium break-all">
                        {currentEmail}
                      </span>
                      .
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div>

                {/* CURRENT EMAIL */}

                <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">

                  <div className="flex-1">

                    <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                      Current Email
                    </label>

                    <div className="flex items-center gap-3 border-b border-[#CFC9C5] pb-3">

                      <Mail
                        size={15}
                        strokeWidth={1.3}
                        className="text-[#888]"
                      />

                      <input
                        type="email"
                        value={currentEmail}
                        readOnly
                        className="w-full bg-transparent text-sm focus:outline-none"
                      />

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={handleRequestEmailChangeOTP}
                    disabled={emailOtpSubmitting}
                    className="group w-full sm:w-auto min-w-[140px] px-6 py-3.5 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#2A2A2A] disabled:opacity-50"
                  >
                    {emailOtpSubmitting
                      ? 'Sending...'
                      : 'Send OTP'}
                  </button>

                </div>

                {/* OTP SENT */}

                {emailOtpRequested && (

                  <div className="border border-[#D5D9CF] bg-[#F3F5F0] p-5 mb-8">

                    <div className="flex items-start gap-4">

                      <CheckCircle2
                        size={18}
                        className="text-[#687756] flex-shrink-0 mt-0.5"
                      />

                      <div>

                        <p className="text-sm mb-1">
                          Verification code sent
                        </p>

                        <p className="text-xs text-[#70766A] leading-relaxed">
                          A 6-digit OTP has been sent to your current email address.
                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {/* VERIFY OTP */}

                {emailOtpRequested &&
                  !emailOtpVerified && (

                    <div className="mb-8">

                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                        Enter Verification Code
                      </label>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-4">

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={emailOtp}
                          onChange={(e) => {
                            setEmailOtp(
                              e.target.value.replace(
                                /\D/g,
                                ''
                              )
                            );
                            setEmailChangeError(null);
                          }}
                          placeholder="000000"
                          className="w-full sm:w-[240px] border-b border-[#CFC9C5] bg-transparent py-3 text-lg tracking-[0.5em] focus:outline-none focus:border-black"
                        />

                        <button
                          type="button"
                          onClick={handleVerifyEmailChangeOTP}
                          disabled={
                            emailVerifySubmitting
                          }
                          className="w-full sm:w-auto px-6 py-3.5 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#2A2A2A] disabled:opacity-50"
                        >
                          {emailVerifySubmitting
                            ? 'Verifying...'
                            : 'Verify OTP'}
                        </button>

                      </div>

                    </div>

                  )}

                {/* VERIFIED + NEW EMAIL */}

                {emailOtpVerified && (

                  <div className="border-t border-[#D6D1CD] pt-8">

                    <div className="flex items-center gap-3 mb-7">

                      <div className="w-7 h-7 rounded-full bg-[#E8EDE2] flex items-center justify-center">

                        <CheckCircle2
                          size={15}
                          className="text-[#61714C]"
                        />

                      </div>

                      <div>

                        <p className="text-sm">
                          Current email verified
                        </p>

                        <p className="text-[11px] text-[#777]">
                          You can now enter your new email address.
                        </p>

                      </div>

                    </div>

                    <form
                      onSubmit={
                        handleChangeAdminEmail
                      }
                    >

                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                        New Email Address
                      </label>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-4">

                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => {
                            setNewEmail(
                              e.target.value
                            );
                            setEmailChangeError(null);
                          }}
                          placeholder="Enter new email address"
                          required
                          className="flex-1 w-full border-b border-[#CFC9C5] bg-transparent py-3 text-sm focus:outline-none focus:border-black"
                        />

                        <button
                          type="submit"
                          disabled={
                            emailChangeSubmitting
                          }
                          className="group w-full sm:w-auto min-w-[150px] px-6 py-3.5 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#2A2A2A] disabled:opacity-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            {emailChangeSubmitting
                              ? 'Updating...'
                              : 'Change Email'}

                            {!emailChangeSubmitting && (
                              <ArrowRight
                                size={13}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              />
                            )}
                          </span>
                        </button>

                      </div>

                    </form>

                  </div>

                )}

                {/* ERROR */}

                {emailChangeError && (

                  <p className="text-sm text-[#A32D2D] mt-5">
                    {emailChangeError}
                  </p>

                )}

              </div>

            )}

          </div>

        </section>

        {/* =====================================================
            SECURITY
        ===================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 py-12 sm:py-16">

          <div className="lg:col-span-4">

            <div className="flex items-center gap-3 mb-3">

              <ShieldCheck
                size={17}
                strokeWidth={1.4}
                className="text-[#777]"
              />

              <span className="text-[9px] uppercase tracking-[0.25em] text-[#777]">
                Account Protection
              </span>

            </div>

            <h2
              className="text-2xl sm:text-3xl font-normal text-[#111] mb-3"
              style={{
                fontFamily:
                  "'Libre Caslon Text', serif",
              }}
            >
              Security
            </h2>

            <p className="text-sm text-[#777] leading-relaxed max-w-[340px]">
              Keep your administrator credentials protected with email verification and password recovery.
            </p>

            {/* SECURITY STATUS */}

            <div className="mt-8 space-y-3">

              <div className="flex items-center gap-3 text-xs text-[#555]">

                <CheckCircle2
                  size={15}
                  className="text-[#687756]"
                />

                Email verification enabled

              </div>

              <div className="flex items-center gap-3 text-xs text-[#555]">

                <CheckCircle2
                  size={15}
                  className="text-[#687756]"
                />

                OTP password recovery enabled

              </div>

            </div>

          </div>

          <div className="lg:col-span-8">

            {resetSuccess ? (

              <div className="border border-[#C9D0C0] bg-[#F1F4ED] p-5 sm:p-6">

                <div className="flex items-start gap-4">

                  <CheckCircle2
                    size={20}
                    className="text-[#61714C] flex-shrink-0"
                  />

                  <div>

                    <p className="text-sm font-medium mb-1">
                      Password reset successfully
                    </p>

                    <p className="text-sm text-[#68705E]">
                      Your administrator password has been updated.
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div>

                {/* SECURITY CARD */}

                <div className="border border-[#D6D1CD] bg-white p-5 sm:p-7 mb-8">

                  <div className="flex items-start gap-4">

                    <div className="w-10 h-10 bg-[#F2F1EF] flex items-center justify-center flex-shrink-0">

                      <LockKeyhole
                        size={18}
                        strokeWidth={1.4}
                        className="text-[#555]"
                      />

                    </div>

                    <div>

                      <p className="text-sm mb-1">
                        Reset Administrator Password
                      </p>

                      <p className="text-xs text-[#777] leading-relaxed">
                        A one-time verification code will be sent to your administrator email before you can create a new password.
                      </p>

                    </div>

                  </div>

                </div>

                {/* EMAIL */}

                <form
                  onSubmit={handleRequestOtp}
                >

                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">

                    <div className="flex-1">

                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                        Verification Email
                      </label>

                      <div className="flex items-center gap-3 border-b border-[#CFC9C5] pb-3">

                        <Mail
                          size={15}
                          strokeWidth={1.3}
                          className="text-[#888]"
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                          required
                          className="w-full bg-transparent text-sm focus:outline-none"
                        />

                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={otpSubmitting}
                      className="w-full sm:w-auto min-w-[140px] px-6 py-3.5 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#2A2A2A] disabled:opacity-50"
                    >
                      {otpSubmitting
                        ? 'Sending...'
                        : 'Request OTP'}
                    </button>

                  </div>

                </form>

                {/* OTP SENT */}

                {otpRequested && (

                  <div className="border border-[#D5D9CF] bg-[#F3F5F0] p-5 mb-8">

                    <div className="flex items-start gap-4">

                      <CheckCircle2
                        size={18}
                        className="text-[#687756] flex-shrink-0 mt-0.5"
                      />

                      <div>

                        <p className="text-sm mb-1">
                          OTP sent successfully
                        </p>

                        <p className="text-xs text-[#70766A]">
                          Verification code sent to{' '}
                          <span className="font-medium break-all">
                            {email}
                          </span>
                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {/* VERIFY OTP */}

                {otpRequested &&
                  !otpVerified && (

                    <form
                      onSubmit={handleVerifyOtp}
                      className="mb-8"
                    >

                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                        Enter Verification Code
                      </label>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-4">

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value.replace(
                                /\D/g,
                                ''
                              )
                            )
                          }
                          placeholder="000000"
                          className="w-full sm:w-[240px] border-b border-[#CFC9C5] bg-transparent py-3 text-lg tracking-[0.5em] focus:outline-none focus:border-black"
                        />

                        <button
                          type="submit"
                          disabled={verifySubmitting}
                          className="w-full sm:w-auto px-6 py-3.5 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#2A2A2A] disabled:opacity-50"
                        >
                          {verifySubmitting
                            ? 'Verifying...'
                            : 'Verify OTP'}
                        </button>

                      </div>

                    </form>

                  )}

                {/* NEW PASSWORD */}

                {otpVerified && (

                  <form
                    onSubmit={
                      handleResetPassword
                    }
                  >

                    <div className="border-t border-[#D6D1CD] pt-8">

                      <div className="flex items-center gap-3 mb-7">

                        <div className="w-7 h-7 rounded-full bg-[#E8EDE2] flex items-center justify-center">

                          <CheckCircle2
                            size={15}
                            className="text-[#61714C]"
                          />

                        </div>

                        <div>

                          <p className="text-sm">
                            OTP verified
                          </p>

                          <p className="text-[11px] text-[#777]">
                            Create your new administrator password.
                          </p>

                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-3">

                        <div>

                          <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                            New Password
                          </label>

                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) =>
                              setNewPassword(
                                e.target.value
                              )
                            }
                            required
                            minLength={8}
                            className="w-full border-b border-[#CFC9C5] bg-transparent py-3 text-sm focus:outline-none focus:border-black"
                          />

                        </div>

                        <div>

                          <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-3">
                            Confirm Password
                          </label>

                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                              setConfirmPassword(
                                e.target.value
                              )
                            }
                            required
                            minLength={8}
                            className="w-full border-b border-[#CFC9C5] bg-transparent py-3 text-sm focus:outline-none focus:border-black"
                          />

                        </div>

                      </div>

                      <p className="text-[11px] text-[#777] leading-relaxed mb-7">
                        Minimum 8 characters with uppercase, lowercase, a number, and a special character.
                      </p>

                      <button
                        type="submit"
                        disabled={resetSubmitting}
                        className="group w-full sm:w-auto px-7 py-3.5 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[#2A2A2A] active:scale-[0.98] disabled:opacity-50"
                      >
                        <span className="inline-flex items-center gap-2">

                          {resetSubmitting
                            ? 'Resetting...'
                            : 'Reset Password'}

                          {!resetSubmitting && (
                            <ArrowRight
                              size={13}
                              className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                          )}

                        </span>
                      </button>

                    </div>

                  </form>

                )}

                {/* RESET ERROR */}

                {resetError && (

                  <p className="text-sm text-[#A32D2D] mt-5 leading-relaxed">
                    {resetError}
                  </p>

                )}

              </div>

            )}

          </div>

        </section>

        {/* =====================================================
            FOOTER DETAIL
        ===================================================== */}

        <div className="pt-8 border-t border-[#D6D1CD] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <p className="text-[9px] uppercase tracking-[0.2em] text-[#999]">
            Chronos Horology Ltd.
          </p>

          <p className="text-[9px] uppercase tracking-[0.15em] text-[#AAA]">
            Administrator Access · Established 2026
          </p>

        </div>

      </div>
    </main>
  );
}