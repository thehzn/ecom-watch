import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  Clock,
  AlertTriangle,
  LogOut,
  Trash2,
  RefreshCw,
  Edit3,
  Save,
  X,
  ShieldAlert,
  Key,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Shield,
  Phone,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { logout, updateUser } from '../../redux/authSlice';
import toast from 'react-hot-toast';

// Swiss Atelier Company Defaults
const COMPANY = {
  name: 'Chronos Horology Ltd.',
  headquarters: 'Geneva, Switzerland',
  bio: 'Independent haute horlogerie atelier crafting heritage timepieces since 2026, blending Swiss hand-finishing with modern mechanical precision.',
  jurisdiction: 'Swiss Federal Administration',
  encryption: 'AES-256-GCM / Argon2id',
};

// Password complexity rules (12+ characters, uppercase, lowercase, digit, special symbol)
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

const LIVE_PASSWORD_RULES = [
  { key: 'length', label: 'Minimum 12 characters', test: (v) => v.length >= 12 },
  { key: 'upper', label: 'One uppercase letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'One lowercase letter (a–z)', test: (v) => /[a-z]/.test(v) },
  { key: 'digit', label: 'One numeric digit (0–9)', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'One special symbol (!@#$%^&*)', test: (v) => /[^A-Za-z\d]/.test(v) },
];

export default function AdminProfile() {
  const authUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { get, post, put, del } = useApi();

  // Active Tab navigation
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'sessions' | 'activity' | 'security' | 'email'

  // =========================================================
  // ADMIN PROFILE STATE & EDITING
  // =========================================================
  const [adminProfile, setAdminProfile] = useState({
    name: authUser?.name || 'Alexandra Chronos',
    email: authUser?.email || '',
    phone: authUser?.phone || '+41 22 819 80 00',
    bio:
      authUser?.bio ||
      'Overseeing catalogue curation, horological verification, and order operations for the Chronos collection.',
    avatar: authUser?.avatar || '',
    roleTitle: authUser?.roleTitle || 'Super Administrator',
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
  });
  const [profileSaveSubmitting, setProfileSaveSubmitting] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState(null);

  // =========================================================
  // PASSWORD EXPIRY & SECURITY STATE
  // =========================================================
  const [passwordExpiry, setPasswordExpiry] = useState({
    passwordChangedAt: new Date(),
    daysSinceChange: 0,
    daysRemaining: 90,
    isExpired: false,
    expiresSoon: false,
    policy: 'Passwords must be at least 12 characters and changed every 90 days',
  });

  // =========================================================
  // SESSIONS STATE
  // =========================================================
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionActionId, setSessionActionId] = useState(null);
  const [sessionSuccessMsg, setSessionSuccessMsg] = useState(null);
  const [sessionErrorMsg, setSessionErrorMsg] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'others' | 'all' | 'single'
    sessionId: null,
    title: '',
    description: '',
  });

  // =========================================================
  // LOGIN ACTIVITY & AUDIT STATE
  // =========================================================
  const [activities, setActivities] = useState([]);
  const [activityStats, setActivityStats] = useState({
    totalLogins: 0,
    failedLogins: 0,
    suspiciousCount: 0,
  });
  const [activityLoading, setActivityLoading] = useState(false);

  // =========================================================
  // CHANGE EMAIL STATE
  // =========================================================
  const [currentEmail, setCurrentEmail] = useState(authUser?.email || '');
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpRequested, setEmailOtpRequested] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailChangeError, setEmailChangeError] = useState(null);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [emailOtpSubmitting, setEmailOtpSubmitting] = useState(false);
  const [emailVerifySubmitting, setEmailVerifySubmitting] = useState(false);
  const [emailChangeSubmitting, setEmailChangeSubmitting] = useState(false);

  // =========================================================
  // RESET PASSWORD (SECURITY TAB) STATE
  // =========================================================
  const [otpEmail, setOtpEmail] = useState(authUser?.email || '');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  // =========================================================
  // INACTIVITY SESSION TIMEOUT (30 MINUTES)
  // =========================================================
  const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
  const lastInteractionRef = useRef(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const handleInactivityLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logout());
    navigate('/admin/login?reason=inactivity_timeout');
  }, [dispatch, navigate]);

  useEffect(() => {
    const updateInteraction = () => {
      lastInteractionRef.current = Date.now();
      if (showInactivityWarning) setShowInactivityWarning(false);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, updateInteraction, { passive: true }));

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastInteractionRef.current;
      if (elapsed >= INACTIVITY_LIMIT_MS) {
        clearInterval(checkInterval);
        handleInactivityLogout();
      } else if (elapsed >= INACTIVITY_LIMIT_MS - 2 * 60 * 1000) {
        // Show warning when 2 minutes remain
        setShowInactivityWarning(true);
      }
    }, 15000);

    return () => {
      clearInterval(checkInterval);
      events.forEach((ev) => window.removeEventListener(ev, updateInteraction));
    };
  }, [handleInactivityLogout, showInactivityWarning, INACTIVITY_LIMIT_MS]);

  // =========================================================
  // DATA FETCHING
  // =========================================================
  const fetchProfile = useCallback(async () => {
    try {
      const data = await get('/apiadmin/admin/profile');
      if (data?.admin) {
        setAdminProfile((prev) => ({
          ...prev,
          ...data.admin,
        }));
        setEditForm({
          name: data.admin.name || '',
          phone: data.admin.phone || '',
          bio: data.admin.bio || '',
        });
        setCurrentEmail(data.admin.email || '');
        setOtpEmail(data.admin.email || '');
      }
      if (data?.passwordExpiry) {
        setPasswordExpiry(data.passwordExpiry);
      }
    } catch (err) {
      console.error('Failed to fetch admin profile:', err);
    }
  }, [get]);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await get('/apiadmin/admin/sessions');
      if (data?.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch admin sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, [get]);

  const fetchLoginActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const data = await get('/apiadmin/admin/login-activity');
      if (data?.activities) {
        setActivities(data.activities);
      }
      if (data?.stats) {
        setActivityStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch login activity:', err);
    } finally {
      setActivityLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
    fetchLoginActivity();
  }, [fetchProfile, fetchSessions, fetchLoginActivity]);

  // =========================================================
  // PROFILE EDIT SUBMISSION
  // =========================================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaveSubmitting(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      const res = await put('/apiadmin/admin/profile', {
        name: editForm.name,
        phone: editForm.phone,
        bio: editForm.bio,
      });

      if (res?.admin) {
        setAdminProfile((prev) => ({ ...prev, ...res.admin }));
        dispatch(
          updateUser({
            name: res.admin.name,
            phone: res.admin.phone,
            bio: res.admin.bio,
          })
        );
        setIsEditingProfile(false);
        setProfileSuccessMsg('Profile updated successfully.');
        toast.success('Admin profile updated successfully');
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      }
    } catch (err) {
      setProfileErrorMsg(err.message || 'Failed to update profile.');
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setProfileSaveSubmitting(false);
    }
  };

  // =========================================================
  // SESSION MANAGEMENT HANDLERS
  // =========================================================
  const handleTerminateSession = async (sessionId) => {
    setSessionActionId(sessionId);
    setSessionErrorMsg(null);
    setSessionSuccessMsg(null);

    try {
      const data = await del(`/apiadmin/admin/sessions/${sessionId}`);
      if (data?.sessions) {
        setSessions(data.sessions);
        setSessionSuccessMsg('Session terminated successfully.');
        toast.success('Session terminated successfully');
        setTimeout(() => setSessionSuccessMsg(null), 3500);
      }
    } catch (err) {
      setSessionErrorMsg(err.message || 'Failed to terminate session.');
      toast.error(err.message || 'Failed to terminate session');
    } finally {
      setSessionActionId(null);
    }
  };

  const handleLogoutOtherSessions = async () => {
    setSessionErrorMsg(null);
    setSessionSuccessMsg(null);
    try {
      const data = await del('/apiadmin/admin/sessions/others');
      if (data?.sessions) {
        setSessions(data.sessions);
        setSessionSuccessMsg('All other devices have been signed out.');
        toast.success('All other devices have been signed out');
        setTimeout(() => setSessionSuccessMsg(null), 3500);
      }
    } catch (err) {
      setSessionErrorMsg(err.message || 'Failed to sign out other sessions.');
      toast.error(err.message || 'Failed to sign out other sessions');
    } finally {
      setConfirmModal({ isOpen: false, type: null, sessionId: null, title: '', description: '' });
    }
  };

  const handleLogoutAllSessions = async () => {
    setSessionErrorMsg(null);
    try {
      await del('/apiadmin/admin/sessions/all');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch(logout());
      toast.success('Signed out of all administrative sessions');
      navigate('/admin/login');
    } catch (err) {
      setSessionErrorMsg(err.message || 'Failed to sign out all sessions.');
      toast.error(err.message || 'Failed to sign out all sessions');
    } finally {
      setConfirmModal({ isOpen: false, type: null, sessionId: null, title: '', description: '' });
    }
  };

  // =========================================================
  // CHANGE EMAIL WORKFLOW HANDLERS
  // =========================================================
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
      toast.success('Security code sent to your current email');
    } catch (err) {
      setEmailChangeError(err.message || 'Failed to send OTP.');
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setEmailOtpSubmitting(false);
    }
  };

  const handleVerifyEmailChangeOTP = async (e) => {
    e.preventDefault();
    setEmailChangeError(null);

    if (emailOtp.length !== 6) {
      const msg = 'Enter the 6-digit OTP sent to your current email.';
      setEmailChangeError(msg);
      toast.error(msg);
      return;
    }

    setEmailVerifySubmitting(true);
    try {
      await post('/apiadmin/admin/verify-email', { otp: emailOtp });
      setEmailOtpVerified(true);
      setEmailChangeError(null);
      toast.success('Email authorization verified');
    } catch (err) {
      setEmailChangeError(err.message || 'OTP verification failed.');
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setEmailVerifySubmitting(false);
    }
  };

  const handleChangeAdminEmail = async (e) => {
    e.preventDefault();
    setEmailChangeError(null);
    setEmailChangeSuccess(false);

    const cleanNewEmail = newEmail.toLowerCase().trim();
    if (!emailOtpVerified) {
      const msg = 'Please verify your current email first.';
      setEmailChangeError(msg);
      toast.error(msg);
      return;
    }
    if (!cleanNewEmail) {
      const msg = 'Please enter your new email address.';
      setEmailChangeError(msg);
      toast.error(msg);
      return;
    }
    if (cleanNewEmail === currentEmail.toLowerCase().trim()) {
      const msg = 'New email must be different from current email.';
      setEmailChangeError(msg);
      toast.error(msg);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanNewEmail)) {
      const msg = 'Please enter a valid email address.';
      setEmailChangeError(msg);
      toast.error(msg);
      return;
    }

    setEmailChangeSubmitting(true);
    try {
      const data = await post('/apiadmin/admin/update-email', {
        newEmail: cleanNewEmail,
      });

      const updated = data?.email || cleanNewEmail;
      setCurrentEmail(updated);
      setOtpEmail(updated);
      setAdminProfile((prev) => ({ ...prev, email: updated }));
      dispatch(updateUser({ email: updated }));

      setNewEmail('');
      setEmailOtp('');
      setEmailOtpRequested(false);
      setEmailOtpVerified(false);
      setEmailChangeSuccess(true);
      toast.success('Administrative email updated successfully');
    } catch (err) {
      setEmailChangeError(err.message || 'Failed to change email.');
      toast.error(err.message || 'Failed to change email');
    } finally {
      setEmailChangeSubmitting(false);
    }
  };

  // =========================================================
  // RESET / ROTATE PASSWORD WORKFLOW
  // =========================================================
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);
    setOtpSubmitting(true);

    try {
      await post('/apiadmin/admin/sendotp', { email: otpEmail });
      setOtpRequested(true);
      setOtp('');
      toast.success('OTP sent to your administrator email');
    } catch (err) {
      setResetError(err.message || 'Failed to send OTP.');
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setResetError(null);

    if (otp.length !== 6) {
      const msg = 'Enter the 6-digit OTP sent to your email.';
      setResetError(msg);
      toast.error(msg);
      return;
    }

    setVerifySubmitting(true);
    try {
      const data = await post('/apiadmin/admin/verifyotp', {
        email: otpEmail,
        otp,
      });
      setResetToken(data.resetToken);
      setOtpVerified(true);
      toast.success('Master security OTP verified');
    } catch (err) {
      setResetError(err.message || 'OTP verification failed.');
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setVerifySubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 12) {
      const msg = 'Administrator password must be at least 12 characters.';
      setResetError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setResetError(msg);
      toast.error(msg);
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      const msg = 'Password must include uppercase, lowercase, a number, and a special character.';
      setResetError(msg);
      toast.error(msg);
      return;
    }

    setResetSubmitting(true);
    try {
      await post('/apiadmin/admin/resetadminpassword', {
        resetToken,
        password: newPassword,
        confirmPassword,
      });

      setResetSuccess(true);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpRequested(false);
      setOtpVerified(false);
      setResetToken(null);
      toast.success('Master administrator password rotated successfully');
      // Refresh profile to pull updated passwordChangedAt
      fetchProfile();
    } catch (err) {
      setResetError(err.message || 'Failed to reset password.');
      toast.error(err.message || 'Failed to rotate password');
    } finally {
      setResetSubmitting(false);
    }
  };

  // Helper: Device icon resolver
  const getDeviceIcon = (deviceType = '', os = '') => {
    const type = deviceType.toLowerCase();
    const osName = os.toLowerCase();
    if (type.includes('mobile') || osName.includes('ios') || osName.includes('android')) {
      return <Smartphone size={18} className="text-[#888]" />;
    }
    if (type.includes('tablet') || osName.includes('ipad')) {
      return <Tablet size={18} className="text-[#888]" />;
    }
    return <Laptop size={18} className="text-[#888]" />;
  };

  // Helper: Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Helper: Relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return 'Active now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <main
      className="min-h-screen bg-[#F7F7F5] text-[#181818]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* =========================================================
          INACTIVITY WARNING BANNER
      ========================================================= */}
      {showInactivityWarning && (
        <div className="bg-[#B91C1C] text-white px-4 py-2.5 text-xs text-center flex items-center justify-center gap-2 sticky top-0 z-50 animate-pulse">
          <AlertTriangle size={15} />
          <span>
            <strong>Security Inactivity Warning:</strong> Your admin session will expire in 2 minutes due to inactivity. Move mouse or press any key to stay active.
          </span>
        </div>
      )}

      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        {/* =====================================================
            PAGE INTRO
        ===================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[#777] mb-2 flex items-center gap-2">
              <Shield size={12} className="text-[#888]" />
              CHRONOS / SECURITY & ADMINISTRATION
            </p>
            <h1
              className="text-[30px] sm:text-[36px] lg:text-[42px] leading-tight font-normal text-[#111]"
              style={{ fontFamily: "'Libre Caslon Text', serif" }}
            >
              Administrator Control Center
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#666]">
            <Clock size={14} />
            <span>30m Session Timeout Active</span>
          </div>
        </div>

        {/* =====================================================
            PREMIUM ADMIN HERO HEADER
        ===================================================== */}
        <section className="relative overflow-hidden bg-[#111] text-white mb-10 border border-[#262626]">
          {/* Subtle horology background rings */}
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute right-16 -bottom-32 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />

          <div className="relative p-6 sm:p-8 lg:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              {/* Left: Avatar & Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/20 bg-[#202020] flex items-center justify-center overflow-hidden">
                    {adminProfile.avatar ? (
                      <img
                        src={adminProfile.avatar}
                        alt={adminProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-3xl sm:text-4xl text-white/90"
                        style={{ fontFamily: "'Libre Caslon Text', serif" }}
                      >
                        {adminProfile.name?.[0] || 'A'}
                      </span>
                    )}
                  </div>
                  <div
                    className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#111] flex items-center justify-center"
                    title="Active Session"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#87966D]" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[9px] uppercase tracking-[0.22em] text-white/50">
                      Horology Master
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-white/15 text-[8px] uppercase tracking-[0.16em] text-white/80">
                      <Crown size={10} className="text-[#C5A880]" />
                      {adminProfile.roleTitle || 'Super Admin'}
                    </span>
                    {activityStats.suspiciousCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-950/80 border border-red-500/40 text-[8px] uppercase tracking-[0.15em] text-red-300">
                        <AlertTriangle size={10} />
                        {activityStats.suspiciousCount} Suspicious Event{activityStats.suspiciousCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-normal mb-2"
                    style={{ fontFamily: "'Libre Caslon Text', serif" }}
                  >
                    {adminProfile.name}
                  </h2>

                  <p className="text-sm text-white/60 max-w-[520px] leading-relaxed">
                    {adminProfile.bio}
                  </p>
                </div>
              </div>

              {/* Right: Security Snapshot Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-3">
                <div className="bg-[#1A1A1A] p-3.5 border border-white/10 min-w-[170px]">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1">
                    Password Rotation
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        passwordExpiry.isExpired
                          ? 'text-red-400'
                          : passwordExpiry.expiresSoon
                          ? 'text-amber-400'
                          : 'text-[#AEB89A]'
                      }`}
                    >
                      {passwordExpiry.isExpired
                        ? 'Expired'
                        : `${passwordExpiry.daysRemaining} days left`}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/30 mt-0.5">90-Day Policy</p>
                </div>

                <div className="bg-[#1A1A1A] p-3.5 border border-white/10 min-w-[170px]">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 mb-1">
                    Active Devices
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/90">
                      {sessions.length || 1} Connected
                    </span>
                  </div>
                  <p className="text-[9px] text-white/30 mt-0.5">Tracked Sessions</p>
                </div>
              </div>
            </div>

            {/* Email & Verified Badge */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-white/40" />
                <span className="text-white/75 font-mono">{currentEmail}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-[#AEB89A]">
                  <CheckCircle2 size={13} />
                  <span>Verified Administrator</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            NAVIGATION TABS
        ===================================================== */}
        <nav aria-label="Administrator management tabs" className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#D6D1CD]">
          {[
            { id: 'profile', label: 'Profile Details', icon: UserRound },
            {
              id: 'sessions',
              label: `Active Devices (${sessions.length || 1})`,
              icon: Laptop,
            },
            {
              id: 'activity',
              label: 'Login Activity',
              icon: Clock,
              badge: activityStats.suspiciousCount > 0 ? activityStats.suspiciousCount : null,
            },
            {
              id: 'security',
              label: 'Password & Policy',
              icon: ShieldCheck,
              alert: passwordExpiry.expiresSoon || passwordExpiry.isExpired,
            },
            { id: 'email', label: 'Change Email', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs uppercase tracking-[0.14em] font-medium transition-all duration-200 whitespace-nowrap border-b-2 -mb-[17px] ${
                  isActive
                    ? 'border-black text-black bg-white shadow-sm'
                    : 'border-transparent text-[#666] hover:text-black hover:bg-black/5'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : 'text-[#888]'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold">
                    {tab.badge}
                  </span>
                )}
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title="Password rotation required" />
                )}
              </button>
            );
          })}
        </nav>

        {/* =====================================================
            TAB 1: PROFILE DETAILS
        ===================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-12">
            {/* Feedback Notifications */}
            {profileSuccessMsg && (
              <div className="p-4 bg-[#F1F4ED] border border-[#C9D0C0] text-sm text-[#475731] flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span>{profileSuccessMsg}</span>
              </div>
            )}
            {profileErrorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-3">
                <AlertTriangle size={18} />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            {/* Profile Information Block */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pb-12 border-b border-[#D6D1CD]">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-2">
                  <UserRound size={17} strokeWidth={1.4} className="text-[#777]" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#777]">
                    Identity
                  </span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-normal text-[#111] mb-3"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  Personal Details
                </h2>
                <p className="text-sm text-[#777] leading-relaxed max-w-[320px]">
                  Administrator credentials and contact metadata stored in the horology ledger.
                </p>

                <div className="mt-8">
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({
                          name: adminProfile.name,
                          phone: adminProfile.phone,
                          bio: adminProfile.bio,
                        });
                        setIsEditingProfile(true);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#111] text-white text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-[#2A2A2A]"
                    >
                      <Edit3 size={13} />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#999] text-[#444] text-[9px] uppercase tracking-[0.2em] hover:bg-black/5"
                    >
                      <X size={13} />
                      Cancel Editing
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8">
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 border border-[#D6D1CD] shadow-sm space-y-6">
                    <div className="border-b border-[#E5E5E5] pb-4 mb-4">
                      <h3 className="text-base font-medium text-[#111]">Edit Administrator Profile</h3>
                      <p className="text-xs text-[#777]">Update your public administrator display name and contact bio.</p>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full border-b border-[#CCC] bg-transparent py-2.5 text-sm focus:outline-none focus:border-black font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+41 22 819 80 00"
                        className="w-full border-b border-[#CCC] bg-transparent py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Executive Bio
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Overseeing catalogue curation and horological operations..."
                        className="w-full border border-[#D6D1CD] bg-[#FAFAFA] p-3 text-sm focus:outline-none focus:border-black resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={profileSaveSubmitting}
                        className="inline-flex items-center gap-2 px-7 py-3 bg-[#111] text-white text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-[#2A2A2A] disabled:opacity-50"
                      >
                        <Save size={13} />
                        {profileSaveSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="text-xs text-[#777] hover:text-black underline"
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="group">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Display Name
                      </p>
                      <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">
                        <UserRound size={15} className="text-[#888]" />
                        <p className="text-sm font-medium">{adminProfile.name}</p>
                      </div>
                    </div>

                    <div className="group">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Administrative Authority
                      </p>
                      <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">
                        <Crown size={15} className="text-[#888]" />
                        <p className="text-sm font-medium">{adminProfile.roleTitle || 'Super Administrator'}</p>
                      </div>
                    </div>

                    <div className="group">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Primary Email
                      </p>
                      <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">
                        <Mail size={15} className="text-[#888]" />
                        <p className="text-sm font-mono break-all">{currentEmail}</p>
                      </div>
                    </div>

                    <div className="group">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Direct Contact
                      </p>
                      <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">
                        <Phone size={15} className="text-[#888]" />
                        <p className="text-sm">{adminProfile.phone || 'Not configured'}</p>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Executive Bio
                      </p>
                      <p className="text-sm text-[#555] leading-7 bg-white p-5 border border-[#D6D1CD]">
                        {adminProfile.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Atelier Company Block */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 py-6 border-b border-[#D6D1CD]">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 size={17} strokeWidth={1.4} className="text-[#777]" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#777]">
                    Organisation
                  </span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-normal text-[#111] mb-3"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  Company Details
                </h2>
                <p className="text-sm text-[#777] leading-relaxed max-w-[320px]">
                  Institutional registry of the Chronos Geneva manufacture.
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                      Company
                    </p>
                    <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">
                      <Building2 size={15} className="text-[#888]" />
                      <p className="text-sm font-medium">{COMPANY.name}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                      Headquarters
                    </p>
                    <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">
                      <MapPin size={15} className="text-[#888]" />
                      <p className="text-sm font-medium">{COMPANY.headquarters}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                      Jurisdiction
                    </p>
                    <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">
                      <Globe size={15} className="text-[#888]" />
                      <p className="text-sm">{COMPANY.jurisdiction}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                      Encryption Architecture
                    </p>
                    <div className="flex items-center gap-3 pb-3 border-b border-[#D6D1CD]">
                      <ShieldCheck size={15} className="text-[#888]" />
                      <p className="text-sm font-mono">{COMPANY.encryption}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                    Manufacture Heritage
                  </p>
                  <p className="text-sm text-[#555] leading-7">
                    {COMPANY.bio}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =====================================================
            TAB 2: ACTIVE DEVICES & SESSIONS
        ===================================================== */}
        {activeTab === 'sessions' && (
          <div className="space-y-8">
            {/* Feedback Notifications */}
            {sessionSuccessMsg && (
              <div className="p-4 bg-[#F1F4ED] border border-[#C9D0C0] text-sm text-[#475731] flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span>{sessionSuccessMsg}</span>
              </div>
            )}
            {sessionErrorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-3">
                <AlertTriangle size={18} />
                <span>{sessionErrorMsg}</span>
              </div>
            )}

            {/* Header / Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-[#D6D1CD] shadow-sm">
              <div>
                <h2
                  className="text-xl font-normal text-[#111]"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  Active Administrator Sessions
                </h2>
                <p className="text-xs text-[#777] mt-1">
                  You are currently signed into {sessions.length || 1} device{sessions.length !== 1 ? 's' : ''}. Sessions idle for &gt; 30 minutes are automatically revoked.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={fetchSessions}
                  disabled={sessionsLoading}
                  className="p-2.5 border border-[#CCC] text-[#555] hover:bg-black/5 hover:text-black transition-colors"
                  title="Refresh Sessions"
                >
                  <RefreshCw size={14} className={sessionsLoading ? 'animate-spin' : ''} />
                </button>

                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        type: 'others',
                        sessionId: null,
                        title: 'Sign Out Other Sessions',
                        description:
                          'Are you sure you want to sign out of all other devices? All other active administrator sessions will be revoked immediately.',
                      })
                    }
                    className="px-4 py-2.5 border border-[#B91C1C] text-[#B91C1C] text-[9px] uppercase tracking-[0.16em] hover:bg-red-50 transition-colors"
                  >
                    Logout Other Sessions
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: 'all',
                      sessionId: null,
                      title: 'Sign Out All Sessions',
                      description:
                        'Are you sure you want to terminate all sessions including this device? You will be redirected to the admin login page.',
                    })
                  }
                  className="px-4 py-2.5 bg-[#111] text-white text-[9px] uppercase tracking-[0.16em] hover:bg-[#2A2A2A] transition-colors"
                >
                  Logout All Sessions
                </button>
              </div>
            </div>

            {/* Session Cards List */}
            <div className="space-y-4">
              {sessionsLoading && sessions.length === 0 ? (
                <div className="p-12 text-center text-sm text-[#888] bg-white border border-[#D6D1CD]">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#666]" />
                  Loading active devices...
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-12 text-center text-sm text-[#888] bg-white border border-[#D6D1CD]">
                  No active sessions found.
                </div>
              ) : (
                sessions.map((session) => {
                  return (
                    <div
                      key={session.sessionId}
                      className={`p-5 sm:p-6 border transition-all ${
                        session.isCurrent
                          ? 'bg-white border-[#111] shadow-sm'
                          : 'bg-[#FAFAF9] border-[#D6D1CD] hover:border-[#888]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Device Info */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#EFEFEF] border border-[#DDD] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getDeviceIcon(session.deviceType, session.os)}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-[#111]">
                                {session.device || `${session.browser} on ${session.os}`}
                              </p>
                              {session.isCurrent && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#EEF2E6] border border-[#C5D1B3] text-[#4E6135] text-[9px] uppercase tracking-[0.15em] font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#687D48] animate-pulse" />
                                  Current Device
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#666]">
                              <span className="font-mono">{session.ipAddress}</span>
                              <span>•</span>
                              <span>{session.os} ({session.browser})</span>
                              <span>•</span>
                              <span className="text-[#888]">
                                Last active: <strong className="text-[#333] font-normal">{getRelativeTime(session.lastActive)}</strong>
                              </span>
                            </div>

                            <p className="text-[10px] text-[#999] mt-2">
                              First logged in: {formatDate(session.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 sm:self-center">
                          {session.isCurrent ? (
                            <span className="text-[10px] uppercase tracking-[0.16em] text-[#87966D] font-medium px-3 py-1.5 bg-[#F4F6F0] border border-[#D5DDCB]">
                              Active Now
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTerminateSession(session.sessionId)}
                              disabled={sessionActionId === session.sessionId}
                              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D6D1CD] text-[9px] uppercase tracking-[0.16em] text-[#777] hover:text-red-700 hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={12} />
                              {sessionActionId === session.sessionId ? 'Terminating...' : 'Sign Out'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Inactivity Advisory Box */}
            <div className="bg-[#EDEDEB] p-5 border border-[#D5D5D1] text-xs text-[#555] leading-relaxed flex items-start gap-3">
              <Clock size={18} className="text-[#777] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#222] mb-1">
                  Administrator Inactivity Timeout Policy
                </p>
                <p>
                  For enhanced institutional security, all administrator sessions are monitored continuously. If no activity (mouse movement, keystrokes, navigation) is recorded for <strong>30 minutes</strong>, the server automatically revokes authentication and forces a re-login.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 3: LOGIN ACTIVITY & AUDIT TRAIL
        ===================================================== */}
        {activeTab === 'activity' && (
          <div className="space-y-8">
            {/* Suspicious Activity Alert Banner if count > 0 */}
            {activityStats.suspiciousCount > 0 && (
              <div className="p-5 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] flex items-start gap-4">
                <ShieldAlert size={22} className="flex-shrink-0 mt-0.5 text-[#DC2626]" />
                <div>
                  <h3 className="text-sm font-semibold mb-1">
                    Suspicious Admin Activity Flagged ({activityStats.suspiciousCount})
                  </h3>
                  <p className="text-xs text-[#B91C1C] leading-relaxed">
                    Automated anomaly detection identified unfamiliar IP addresses or repeated failed attempts preceding a login. If you do not recognize this activity, please immediately terminate all other sessions and rotate your administrator master password.
                  </p>
                </div>
              </div>
            )}

            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 border border-[#D6D1CD]">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#888] mb-1">
                  Total Logged Events
                </p>
                <p className="text-2xl font-light text-[#111]">{activityStats.totalLogins}</p>
                <p className="text-[10px] text-[#999] mt-1">Audit log retained</p>
              </div>

              <div className="bg-white p-5 border border-[#D6D1CD]">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#888] mb-1">
                  Failed Login Attempts
                </p>
                <p className="text-2xl font-light text-amber-700">{activityStats.failedLogins}</p>
                <p className="text-[10px] text-[#999] mt-1">5 failed attempts trigger lock</p>
              </div>

              <div className="bg-white p-5 border border-[#D6D1CD]">
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#888] mb-1">
                  Suspicious Alerts
                </p>
                <p
                  className={`text-2xl font-light ${
                    activityStats.suspiciousCount > 0 ? 'text-red-600 font-normal' : 'text-[#687D48]'
                  }`}
                >
                  {activityStats.suspiciousCount}
                </p>
                <p className="text-[10px] text-[#999] mt-1">
                  {activityStats.suspiciousCount === 0 ? 'No security anomalies' : 'Action recommended'}
                </p>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white border border-[#D6D1CD] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
                <div>
                  <h3
                    className="text-lg font-normal text-[#111]"
                    style={{ fontFamily: "'Libre Caslon Text', serif" }}
                  >
                    Authentication Audit Trail
                  </h3>
                  <p className="text-xs text-[#777] mt-0.5">
                    Chronological record of recent administrator sign-ins and anomalies.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchLoginActivity}
                  disabled={activityLoading}
                  className="p-2 border border-[#CCC] text-[#555] hover:bg-black/5 hover:text-black transition-colors"
                  title="Refresh Audit Trail"
                >
                  <RefreshCw size={14} className={activityLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] bg-[#F9F9F8] text-[9px] uppercase tracking-[0.16em] text-[#777]">
                      <th className="py-3.5 px-4 font-medium">Timestamp</th>
                      <th className="py-3.5 px-4 font-medium">Status</th>
                      <th className="py-3.5 px-4 font-medium">IP Address</th>
                      <th className="py-3.5 px-4 font-medium">Device & Browser</th>
                      <th className="py-3.5 px-4 font-medium">Security Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEFEF]">
                    {activityLoading && activities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#888]">
                          <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-[#666]" />
                          Loading audit trail...
                        </td>
                      </tr>
                    ) : activities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#888]">
                          No login activity recorded yet.
                        </td>
                      </tr>
                    ) : (
                      activities.map((act, index) => {
                        const isSuccess = act.status === 'SUCCESS';
                        return (
                          <tr
                            key={act._id || index}
                            className={`hover:bg-[#F9F9F8] transition-colors ${
                              act.isSuspicious ? 'bg-red-50/40' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono text-[#555]">
                              {formatDate(act.timestamp)}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] font-medium ${
                                  isSuccess
                                    ? 'bg-[#EEF2E6] text-[#475731] border border-[#D2DEC2]'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}
                              >
                                {isSuccess ? (
                                  <CheckCircle2 size={10} />
                                ) : (
                                  <AlertTriangle size={10} />
                                )}
                                {act.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-mono text-[#333]">
                              {act.ipAddress || '127.0.0.1'}
                            </td>

                            <td className="py-3.5 px-4 text-[#444]">
                              <div>{act.device || 'Desktop Device'}</div>
                              <div className="text-[10px] text-[#888]">
                                {act.browser} · {act.os}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {act.isSuspicious ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 border border-red-300 text-red-800 text-[9px] uppercase tracking-[0.12em] font-medium">
                                  <AlertTriangle size={11} className="text-red-600 flex-shrink-0" />
                                  <span>{act.suspiciousReason || 'Suspicious Anomaly'}</span>
                                </div>
                              ) : isSuccess ? (
                                <span className="text-[10px] text-[#788860] flex items-center gap-1">
                                  <Check size={12} /> Standard Authorized Login
                                </span>
                              ) : (
                                <span className="text-[10px] text-red-600">
                                  {act.failureReason || 'Invalid Credentials'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 4: PASSWORD & SECURITY POLICY
        ===================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-12">
            {/* Policy Banner Card */}
            <section className="bg-white border border-[#D6D1CD] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-[#E5E5E5]">
                <div>
                  <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#777] mb-1">
                    <Key size={13} className="text-[#888]" />
                    <span>Admin Security Governance</span>
                  </div>
                  <h2
                    className="text-2xl font-normal text-[#111]"
                    style={{ fontFamily: "'Libre Caslon Text', serif" }}
                  >
                    90-Day Password Rotation Policy
                  </h2>
                  <p className="text-xs text-[#666] mt-1 max-w-[580px] leading-relaxed">
                    Administrator passwords must be at least 12 characters and changed every 90 days to maintain ISO/IEC 27001 compliance and protect catalog integrity.
                  </p>
                </div>

                <div className="flex flex-col sm:items-end">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-medium uppercase tracking-[0.14em] ${
                      passwordExpiry.isExpired
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : passwordExpiry.expiresSoon
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-[#EEF2E6] border-[#C5D1B3] text-[#475731]'
                    }`}
                  >
                    <ShieldCheck size={14} />
                    {passwordExpiry.isExpired
                      ? 'Expired — Mandatory Reset'
                      : passwordExpiry.expiresSoon
                      ? 'Rotation Required Soon'
                      : 'Policy Compliant'}
                  </div>
                  <p className="text-[10px] text-[#888] mt-1.5 font-mono">
                    Last changed: {formatDate(passwordExpiry.passwordChangedAt)}
                  </p>
                </div>
              </div>

              {/* Countdown Progress Visual */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-[#555] mb-2">
                  <span>
                    Days since last change:{' '}
                    <strong>{passwordExpiry.daysSinceChange} days</strong>
                  </span>
                  <span>
                    Rotation deadline:{' '}
                    <strong
                      className={
                        passwordExpiry.daysRemaining <= 14 ? 'text-red-600' : 'text-[#333]'
                      }
                    >
                      {passwordExpiry.daysRemaining} days remaining
                    </strong>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-[#EAEAEA] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      passwordExpiry.daysRemaining <= 14
                        ? 'bg-red-600'
                        : passwordExpiry.daysRemaining <= 30
                        ? 'bg-amber-500'
                        : 'bg-[#7C8D63]'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (passwordExpiry.daysSinceChange / 90) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Password Reset Form Section */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pb-12 border-b border-[#D6D1CD]">
              <div className="lg:col-span-4">
                <div className="flex items-center gap-3 mb-2">
                  <LockKeyhole size={17} strokeWidth={1.4} className="text-[#777]" />
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#777]">
                    Master Key
                  </span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-normal text-[#111] mb-3"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  Rotate Password
                </h2>
                <p className="text-sm text-[#777] leading-relaxed max-w-[340px]">
                  Requires two-step verification via OTP sent to your registered administrator inbox.
                </p>

                {/* Complexity requirements summary */}
                <div className="mt-6 p-4 bg-white border border-[#D6D1CD] text-xs space-y-2">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-[#888] font-semibold">
                    Policy Checklist
                  </p>
                  {LIVE_PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(newPassword);
                    return (
                      <div
                        key={rule.key}
                        className={`flex items-center gap-2 text-[11px] transition-colors ${
                          newPassword.length === 0
                            ? 'text-[#777]'
                            : passed
                            ? 'text-[#475731] font-medium'
                            : 'text-red-700'
                        }`}
                      >
                        {passed ? (
                          <CheckCircle2 size={13} className="text-[#687D48] flex-shrink-0" />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-current flex-shrink-0" />
                        )}
                        <span>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-8">
                {resetSuccess ? (
                  <div className="border border-[#C9D0C0] bg-[#F1F4ED] p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 size={22} className="text-[#61714C] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-base font-medium mb-1">
                          Administrator Password Rotated Successfully
                        </p>
                        <p className="text-sm text-[#68705E] leading-relaxed">
                          Your master password has been updated in compliance with the 90-day security policy. The countdown has been reset to 90 days.
                        </p>
                        <button
                          type="button"
                          onClick={() => setResetSuccess(false)}
                          className="mt-4 px-5 py-2 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] hover:bg-[#2A2A2A]"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 sm:p-8 border border-[#D6D1CD] shadow-sm">
                    {/* Step 1: Request OTP */}
                    {!otpVerified && (
                      <div>
                        <div className="border-b border-[#E5E5E5] pb-4 mb-6">
                          <p className="text-xs uppercase tracking-[0.16em] text-[#888] font-semibold">
                            Step 1 of 2: Administrator Identity Verification
                          </p>
                          <p className="text-xs text-[#666] mt-1">
                            A verification code will be dispatched to your administrator inbox.
                          </p>
                        </div>

                        <form onSubmit={handleRequestOtp}>
                          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
                            <div className="flex-1">
                              <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                                Verification Email
                              </label>
                              <div className="flex items-center gap-3 border-b border-[#CFC9C5] pb-2.5">
                                <Mail size={15} className="text-[#888]" />
                                <input
                                  type="email"
                                  value={otpEmail}
                                  readOnly
                                  className="w-full bg-transparent text-sm font-mono focus:outline-none"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={otpSubmitting}
                              className="w-full sm:w-auto min-w-[150px] px-6 py-3 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] hover:bg-[#2A2A2A] disabled:opacity-50 transition-all"
                            >
                              {otpSubmitting ? 'Sending...' : otpRequested ? 'Resend OTP' : 'Request OTP'}
                            </button>
                          </div>
                        </form>

                        {/* OTP Verification sub-form */}
                        {otpRequested && (
                          <div className="pt-6 border-t border-[#EAEAEA] animate-fadeIn">
                            <div className="p-4 bg-[#F4F6F0] border border-[#D5DDCB] text-xs text-[#526338] mb-6 flex items-center gap-3">
                              <CheckCircle2 size={16} />
                              <span>
                                6-digit OTP dispatched to <strong>{otpEmail}</strong>. Valid for 5 minutes.
                              </span>
                            </div>

                            <form onSubmit={handleVerifyOtp}>
                              <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                                Enter 6-Digit OTP
                              </label>
                              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={6}
                                  value={otp}
                                  onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, ''));
                                    setResetError(null);
                                  }}
                                  placeholder="000000"
                                  className="w-full sm:w-[220px] border-b border-[#CFC9C5] bg-transparent py-2.5 text-lg font-mono tracking-[0.4em] focus:outline-none focus:border-black"
                                />

                                <button
                                  type="submit"
                                  disabled={verifySubmitting || otp.length !== 6}
                                  className="w-full sm:w-auto px-6 py-3 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] hover:bg-[#2A2A2A] disabled:opacity-50 transition-all"
                                >
                                  {verifySubmitting ? 'Verifying...' : 'Verify OTP'}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Set New Password (12+ chars) */}
                    {otpVerified && (
                      <form onSubmit={handleResetPassword}>
                        <div className="border-b border-[#E5E5E5] pb-4 mb-6">
                          <p className="text-xs uppercase tracking-[0.16em] text-[#687D48] font-semibold flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Step 2 of 2: Create New 12+ Character Password
                          </p>
                          <p className="text-xs text-[#666] mt-1">
                            Your password must satisfy all 5 governance criteria below.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                              New Master Password (Min. 12 Chars)
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => {
                                  setNewPassword(e.target.value);
                                  setResetError(null);
                                }}
                                required
                                minLength={12}
                                className="w-full border-b border-[#CFC9C5] bg-transparent py-2.5 pr-8 text-sm focus:outline-none focus:border-black font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-1 top-2.5 text-[#888] hover:text-black"
                              >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                              Confirm Master Password
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => {
                                  setConfirmPassword(e.target.value);
                                  setResetError(null);
                                }}
                                required
                                minLength={12}
                                className="w-full border-b border-[#CFC9C5] bg-transparent py-2.5 pr-8 text-sm focus:outline-none focus:border-black font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-1 top-2.5 text-[#888] hover:text-black"
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={resetSubmitting || !PASSWORD_REGEX.test(newPassword)}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111] text-white text-[9px] uppercase tracking-[0.2em] hover:bg-[#2A2A2A] disabled:opacity-40 transition-all"
                        >
                          <LockKeyhole size={13} />
                          {resetSubmitting ? 'Rotating Master Password...' : 'Confirm Password Rotation'}
                        </button>
                      </form>
                    )}

                    {/* Error display */}
                    {resetError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 mt-6 flex items-center gap-2">
                        <AlertTriangle size={15} />
                        <span>{resetError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* =====================================================
            TAB 5: CHANGE EMAIL
        ===================================================== */}
        {activeTab === 'email' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pb-12 border-b border-[#D6D1CD]">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={17} strokeWidth={1.4} className="text-[#777]" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#777]">
                  Access Control
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-normal text-[#111] mb-3"
                style={{ fontFamily: "'Libre Caslon Text', serif" }}
              >
                Change Admin Email
              </h2>
              <p className="text-sm text-[#777] leading-relaxed max-w-[340px]">
                Verify your current address with an OTP code before updating the primary login credentials.
              </p>
            </div>

            <div className="lg:col-span-8">
              {emailChangeSuccess ? (
                <div className="border border-[#C9D0C0] bg-[#F1F4ED] p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 size={20} className="text-[#61714C] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Administrator Email Address Updated
                      </p>
                      <p className="text-sm text-[#68705E] leading-relaxed">
                        Your administrator login email is now{' '}
                        <span className="font-mono font-medium">{currentEmail}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 sm:p-8 border border-[#D6D1CD] shadow-sm">
                  {/* Step 1: Send OTP */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
                    <div className="flex-1">
                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Current Registered Email
                      </label>
                      <div className="flex items-center gap-3 border-b border-[#CFC9C5] pb-2.5">
                        <Mail size={15} className="text-[#888]" />
                        <input
                          type="email"
                          value={currentEmail}
                          readOnly
                          className="w-full bg-transparent text-sm font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRequestEmailChangeOTP}
                      disabled={emailOtpSubmitting}
                      className="w-full sm:w-auto min-w-[140px] px-6 py-3 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] hover:bg-[#2A2A2A] disabled:opacity-50 transition-all"
                    >
                      {emailOtpSubmitting ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>

                  {/* Step 2: Verify OTP */}
                  {emailOtpRequested && !emailOtpVerified && (
                    <div className="mb-8 pt-6 border-t border-[#EAEAEA]">
                      <div className="p-4 bg-[#F3F5F0] border border-[#D5D9CF] text-xs text-[#596944] mb-6 flex items-center gap-3">
                        <CheckCircle2 size={16} />
                        <span>A 6-digit verification code was sent to your current email.</span>
                      </div>

                      <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                        Enter Verification Code
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={emailOtp}
                          onChange={(e) => {
                            setEmailOtp(e.target.value.replace(/\D/g, ''));
                            setEmailChangeError(null);
                          }}
                          placeholder="000000"
                          className="w-full sm:w-[220px] border-b border-[#CFC9C5] bg-transparent py-2.5 text-lg font-mono tracking-[0.4em] focus:outline-none focus:border-black"
                        />

                        <button
                          type="button"
                          onClick={handleVerifyEmailChangeOTP}
                          disabled={emailVerifySubmitting || emailOtp.length !== 6}
                          className="w-full sm:w-auto px-6 py-3 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] hover:bg-[#2A2A2A] disabled:opacity-50 transition-all"
                        >
                          {emailVerifySubmitting ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Enter New Email */}
                  {emailOtpVerified && (
                    <div className="pt-6 border-t border-[#EAEAEA]">
                      <div className="p-4 bg-[#EEF2E6] border border-[#C5D1B3] text-xs text-[#475731] mb-6 flex items-center gap-3">
                        <CheckCircle2 size={16} />
                        <span>Current email verified. Enter your new administrator email below.</span>
                      </div>

                      <form onSubmit={handleChangeAdminEmail}>
                        <label className="block text-[9px] uppercase tracking-[0.18em] text-[#888] mb-2">
                          New Email Address
                        </label>
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => {
                              setNewEmail(e.target.value);
                              setEmailChangeError(null);
                            }}
                            placeholder="admin@chronos.ch"
                            required
                            className="flex-1 w-full border-b border-[#CFC9C5] bg-transparent py-2.5 text-sm font-mono focus:outline-none focus:border-black"
                          />

                          <button
                            type="submit"
                            disabled={emailChangeSubmitting}
                            className="w-full sm:w-auto px-6 py-3 bg-[#111] text-white text-[9px] uppercase tracking-[0.18em] hover:bg-[#2A2A2A] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                          >
                            <span>{emailChangeSubmitting ? 'Updating...' : 'Update Email'}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Error Notification */}
                  {emailChangeError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 mt-6 flex items-center gap-2">
                      <AlertTriangle size={15} />
                      <span>{emailChangeError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =====================================================
            CONFIRMATION MODAL FOR LOGOUT ACTIONS
        ===================================================== */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white max-w-md w-full p-6 sm:p-8 border border-[#D6D1CD] shadow-2xl space-y-5 animate-scaleUp">
              <div className="flex items-center gap-3 text-amber-700">
                <AlertTriangle size={22} />
                <h3
                  className="text-lg font-normal text-[#111]"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  {confirmModal.title}
                </h3>
              </div>

              <p className="text-xs text-[#666] leading-relaxed">
                {confirmModal.description}
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal({
                      isOpen: false,
                      type: null,
                      sessionId: null,
                      title: '',
                      description: '',
                    })
                  }
                  className="px-5 py-2.5 border border-[#CCC] text-xs uppercase tracking-[0.14em] text-[#555] hover:bg-black/5"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirmModal.type === 'others') handleLogoutOtherSessions();
                    else if (confirmModal.type === 'all') handleLogoutAllSessions();
                  }}
                  className="px-5 py-2.5 bg-[#111] text-white text-xs uppercase tracking-[0.14em] hover:bg-[#2A2A2A]"
                >
                  Confirm Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            FOOTER DETAIL
        ===================================================== */}
        <footer className="pt-8 border-t border-[#D6D1CD] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#999]">
            Chronos Horology Ltd. · Geneva
          </p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#AAA]">
            Administrator Security Infrastructure · Session Timeout: 30m
          </p>
        </footer>
      </div>
    </main>
  );
}