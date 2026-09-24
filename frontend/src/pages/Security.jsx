import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Check,
  Shield,
  ArrowRight,
  KeyRound,
  Laptop,
  Smartphone,
  Tablet,
  LogOut,
  Clock,
  Sparkles,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { logout } from '../redux/authSlice';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .required('New password is required')
    .matches(
      passwordRegex,
      'Must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number and 1 special character'
    ),

  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf(
      [Yup.ref('newPassword')],
      'Passwords do not match'
    ),
});

const LIVE_RULES = [
  {
    key: 'length',
    label: 'Minimum 8 characters',
    test: (v) => v.length >= 8,
  },
  {
    key: 'upper',
    label: '1 uppercase & 1 lowercase letter',
    test: (v) =>
      /[A-Z]/.test(v) && /[a-z]/.test(v),
  },
  {
    key: 'numberOrSymbol',
    label: '1 number & 1 special symbol',
    test: (v) =>
      /\d/.test(v) &&
      /[^A-Za-z0-9]/.test(v),
  },
];

function formatLastActive(dateString, isCurrent) {
  if (isCurrent) return 'Active now (This device)';
  if (!dateString) return 'Active recently';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return 'Active just now';
  if (diffMins < 60) return `Active ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Active ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `Active ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DeviceIcon({ type }) {
  if (type === 'Mobile') {
    return <Smartphone size={20} className="text-gray-300" />;
  }
  if (type === 'Tablet') {
    return <Tablet size={20} className="text-gray-300" />;
  }
  return <Laptop size={20} className="text-gray-300" />;
}

export default function Security() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth?.token);

  const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [activeTab, setActiveTab] = useState('devices'); // 'devices' | 'password'

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState('');
  const [terminatingId, setTerminatingId] = useState(null);
  const [terminatingOthers, setTerminatingOthers] = useState(false);
  const [sessionSuccessMessage, setSessionSuccessMessage] = useState('');

  // Password change state
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // ----------------------------------------------------
  // FETCH SESSIONS
  // ----------------------------------------------------
  const fetchSessions = async () => {
    if (!token) return;
    setSessionsLoading(true);
    setSessionsError('');

    try {
      const res = await fetch(`${API_URL}/apiuser/user/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.status === false)) {
        if (res.status === 401) {
          dispatch(logout());
          navigate('/login');
          return;
        }
        setSessionsError(data?.message || 'Failed to load active sessions.');
        return;
      }

      setSessions(data?.sessions || []);
    } catch {
      setSessionsError('Unable to reach server to load active sessions.');
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [token]);

  // ----------------------------------------------------
  // TERMINATE A SPECIFIC SESSION
  // ----------------------------------------------------
  const handleTerminateSession = async (sessionId) => {
    setTerminatingId(sessionId);
    setSessionSuccessMessage('');
    setSessionsError('');

    try {
      const res = await fetch(
        `${API_URL}/apiuser/user/sessions/${sessionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.status === false)) {
        if (res.status === 401) {
          dispatch(logout());
          navigate('/login');
          return;
        }
        setSessionsError(data?.message || 'Failed to terminate session.');
        return;
      }

      if (data.isCurrentDeleted) {
        dispatch(logout());
        navigate('/login');
        return;
      }

      setSessions(data.sessions || []);
      setSessionSuccessMessage('Device session signed out successfully.');
      setTimeout(() => setSessionSuccessMessage(''), 4000);
    } catch {
      setSessionsError('Unable to reach server to terminate session.');
    } finally {
      setTerminatingId(null);
    }
  };

  // ----------------------------------------------------
  // TERMINATE ALL OTHER SESSIONS
  // ----------------------------------------------------
  const handleLogoutAllOthers = async () => {
    if (
      !window.confirm(
        'Are you sure you want to sign out all other devices logged into this account?'
      )
    ) {
      return;
    }

    setTerminatingOthers(true);
    setSessionSuccessMessage('');
    setSessionsError('');

    try {
      const res = await fetch(`${API_URL}/apiuser/user/sessions/others`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.status === false)) {
        if (res.status === 401) {
          dispatch(logout());
          navigate('/login');
          return;
        }
        setSessionsError(
          data?.message || 'Failed to sign out other devices.'
        );
        return;
      }

      setSessions(data.sessions || []);
      setSessionSuccessMessage(
        'All other active devices have been signed out.'
      );
      setTimeout(() => setSessionSuccessMessage(''), 4000);
    } catch {
      setSessionsError('Unable to reach server to sign out other devices.');
    } finally {
      setTerminatingOthers(false);
    }
  };

  // ----------------------------------------------------
  // PASSWORD OTP WORKFLOW
  // ----------------------------------------------------
  const handleSendOTP = async () => {
    setOtpError('');
    setApiError('');
    setSuccessMessage('');
    setOtpLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/apiuser/user/send-password-change-otp`,
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
        setOtpError(data?.message || 'Failed to send OTP');
        return;
      }

      setOtpSent(true);
      setOtp('');
      setOtpError('');
    } catch {
      setOtpError('Unable to reach the server. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    setOtpError('');
    setApiError('');
    setOtpLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/apiuser/user/verify-password-change-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            otp: otp.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.status === false)) {
        setOtpError(data?.message || 'Invalid OTP');
        return;
      }

      setOtpVerified(true);
      setOtpError('');
    } catch {
      setOtpError('Unable to reach the server. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiError('');

      if (!otpVerified) {
        setApiError(
          'Please verify the OTP before changing your password.'
        );
        setSubmitting(false);
        return;
      }

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
              password: values.newPassword,
            }),
          }
        );

        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.status === false)) {
          setApiError(
            data?.message ||
              'Could not update password. Please try again.'
          );
          return;
        }

        resetForm();

        setOtp('');
        setOtpSent(false);
        setOtpVerified(false);

        setSuccessMessage(
          'Password updated successfully. Please log in with your new key.'
        );

        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch {
        setApiError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_70%)] pointer-events-none" />

      <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 py-12 z-10">
        <div className="w-full max-w-[620px] bg-[#0E1015]/95 border border-white/15 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
              <Shield size={22} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Security &amp; Devices
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Monitor active device sessions and manage your master security keys.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-[#141720] border border-white/10 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('devices')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'devices'
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Laptop size={15} />
              <span>Logged-in Devices</span>
              {sessions.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'devices'
                      ? 'bg-black text-white'
                      : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {sessions.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'password'
                  ? 'bg-white text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <KeyRound size={15} />
              <span>Password &amp; Key</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: LOGGED-IN DEVICES & ACTIVE SESSIONS                */}
          {/* ========================================================= */}
          {activeTab === 'devices' && (
            <div className="flex flex-col gap-6">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                    Active Devices
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Authorized logins associated with your account
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchSessions}
                    disabled={sessionsLoading}
                    title="Refresh devices"
                    className="p-2 bg-[#141720] border border-white/10 hover:border-white/30 text-gray-400 hover:text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={sessionsLoading ? 'animate-spin' : ''}
                    />
                  </button>

                  {otherSessionsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleLogoutAllOthers}
                      disabled={terminatingOthers}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                    >
                      {terminatingOthers
                        ? 'Signing out others…'
                        : 'Sign Out Other Devices'}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Notifications */}
              {sessionSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 text-center flex items-center justify-center gap-2">
                  <Check size={14} />
                  <span>{sessionSuccessMessage}</span>
                </div>
              )}

              {sessionsError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                  {sessionsError}
                </div>
              )}

              {/* Loading Skeleton */}
              {sessionsLoading && (
                <div className="flex flex-col gap-3">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="p-4 bg-[#141720]/80 border border-white/10 rounded-2xl animate-pulse flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/10" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="w-36 h-3 bg-white/15 rounded" />
                        <div className="w-24 h-2.5 bg-white/10 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sessions List */}
              {!sessionsLoading && sessions.length === 0 && (
                <div className="bg-[#141720] border border-white/10 rounded-2xl p-8 text-center">
                  <Laptop size={30} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-300">
                    No active sessions found.
                  </p>
                </div>
              )}

              {!sessionsLoading && sessions.length > 0 && (
                <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        session.isCurrent
                          ? 'bg-[#141720] border-white/30 shadow-lg'
                          : 'bg-[#10131A] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                          <DeviceIcon type={session.deviceType} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white truncate">
                              {session.device || `${session.browser} on ${session.os}`}
                            </p>
                            {session.isCurrent && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                This Device
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                            {session.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe size={11} className="text-gray-500" />
                                {session.ipAddress}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-gray-400">
                              <Clock size={11} className="text-gray-500" />
                              {formatLastActive(
                                session.lastActive,
                                session.isCurrent
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end shrink-0">
                        {session.isCurrent ? (
                          <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold px-3 py-1.5">
                            Current Session
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleTerminateSession(session.sessionId)
                            }
                            disabled={terminatingId === session.sessionId}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                          >
                            <LogOut size={12} />
                            <span>
                              {terminatingId === session.sessionId
                                ? 'Signing out…'
                                : 'Sign Out'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Security Note */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-400 flex items-start gap-3">
                <Sparkles size={16} className="text-gray-300 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  If you spot an unrecognized device or location, sign it out immediately and update your master password key.
                </p>
              </div>

              {/* Return link */}
              <div className="text-center pt-2">
                <Link
                  to="/myaccount"
                  className="text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MASTER PASSWORD & KEY UPDATE                       */}
          {/* ========================================================= */}
          {activeTab === 'password' && (
            <div>
              {successMessage ? (
                <div className="p-4 bg-white/10 border border-white/20 rounded-2xl text-center text-sm font-medium text-white">
                  {successMessage}
                </div>
              ) : (
                <form
                  onSubmit={formik.handleSubmit}
                  noValidate
                  className="flex flex-col gap-4"
                >
                  {/* STEP 1: SEND OR VERIFY OTP */}
                  {!otpVerified && (
                    <>
                      {!otpSent ? (
                        <div className="flex flex-col gap-3">
                          <div className="p-4 bg-[#141720] border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <Shield size={17} className="text-gray-300" />
                              <p className="text-sm text-white font-medium">
                                Verify your identity
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                              An OTP will be sent to your registered email address before you can change your password.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpLoading}
                            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
                          >
                            <span>
                              {otpLoading ? 'Sending OTP…' : 'Send OTP'}
                            </span>
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="p-4 bg-[#141720] border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <Shield size={17} className="text-gray-300" />
                              <p className="text-sm text-white font-medium">
                                Verify OTP
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                              Enter the 6-digit OTP sent to your registered email address.
                            </p>
                          </div>

                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, ''))
                            }
                            placeholder="Enter 6-digit OTP"
                            className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none tracking-[0.3em] text-center"
                          />

                          {otpError && (
                            <p className="text-red-400 text-xs text-center">
                              {otpError}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={otpLoading || otp.length !== 6}
                            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
                          >
                            <span>
                              {otpLoading ? 'Verifying…' : 'Verify OTP'}
                            </span>
                            <Shield size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={otpLoading}
                            className="text-xs text-gray-400 hover:text-white transition-colors text-center"
                          >
                            Resend OTP
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* STEP 2: PASSWORD CHANGE FORM */}
                  {otpVerified && (
                    <>
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

                        {formik.touched.newPassword &&
                          formik.errors.newPassword && (
                            <p className="text-red-400 text-xs mt-1">
                              {formik.errors.newPassword}
                            </p>
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
                            {showConfirm ? (
                              <EyeOff size={17} />
                            ) : (
                              <Eye size={17} />
                            )}
                          </button>
                        </div>

                        {formik.touched.confirmPassword &&
                          formik.errors.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">
                              {formik.errors.confirmPassword}
                            </p>
                          )}
                      </div>

                      {/* Security Rules */}
                      <div className="bg-[#141720] border border-white/10 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                          Security Standard:
                        </span>

                        {LIVE_RULES.map((rule) => {
                          const met = rule.test(formik.values.newPassword);
                          return (
                            <div
                              key={rule.key}
                              className="flex items-center gap-2.5"
                            >
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  met
                                    ? 'bg-white text-black'
                                    : 'border border-white/30 text-transparent'
                                }`}
                              >
                                {met && <Check size={10} strokeWidth={3} />}
                              </span>

                              <span
                                className={`text-xs ${
                                  met
                                    ? 'text-white font-medium'
                                    : 'text-gray-400'
                                }`}
                              >
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
                        <span>
                          {formik.isSubmitting
                            ? 'Updating Key…'
                            : 'Update Password'}
                        </span>
                        <ArrowRight size={15} />
                      </button>
                    </>
                  )}

                  <div className="text-center pt-2">
                    <Link
                      to="/myaccount"
                      className="text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                    >
                      Return to Dashboard
                    </Link>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      
    </div>
  );
}
