import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Clock, LogOut, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { logout } from '../redux/authSlice';

// 30 Minutes Inactivity Limit; Warning triggered at 28 Minutes (2 mins remaining)
const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
const WARNING_THRESHOLD_MS = 28 * 60 * 1000;
const CHECK_INTERVAL_MS = 5000;

export default function UserSessionTimeout() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const lastInteractionRef = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  const handleTimeoutLogout = useCallback(() => {
    setShowWarning(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logout());
    toast.error('Session expired due to 30 minutes of inactivity. Please sign in again.');
    navigate('/login?reason=inactivity_timeout');
  }, [dispatch, navigate]);

  const handleManualLogout = () => {
    setShowWarning(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logout());
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const handleStaySignedIn = () => {
    lastInteractionRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining(120);
    toast.success('Session extended. You remain signed in.');

    // Background keepalive ping to refresh backend session timestamp
    if (token) {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      fetch(`${BASE_URL}/apiuser/user/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  useEffect(() => {
    // Only run inactivity timer for authenticated customer users (not admins, who have their own console timers)
    if (!user || !token || user.role === 'admin') {
      setShowWarning(false);
      return;
    }

    lastInteractionRef.current = Date.now();

    const updateInteraction = () => {
      lastInteractionRef.current = Date.now();
      if (showWarning) {
        setShowWarning(false);
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, updateInteraction, { passive: true }));

    const timer = setInterval(() => {
      const elapsed = Date.now() - lastInteractionRef.current;

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        clearInterval(timer);
        handleTimeoutLogout();
      } else if (elapsed >= WARNING_THRESHOLD_MS) {
        const remainingMs = Math.max(0, INACTIVITY_LIMIT_MS - elapsed);
        setSecondsRemaining(Math.ceil(remainingMs / 1000));
        setShowWarning(true);
      } else {
        if (showWarning) setShowWarning(false);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      events.forEach((ev) => window.removeEventListener(ev, updateInteraction));
    };
  }, [user, token, showWarning, handleTimeoutLogout]);

  if (!showWarning || !user || user.role === 'admin') {
    return null;
  }

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <aside
      aria-label="Session Inactivity Warning"
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] bg-[#0E1015]/95 border border-[#C5A880]/40 backdrop-blur-2xl rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white animate-in fade-in slide-in-from-bottom-5 duration-300 font-['Plus_Jakarta_Sans']"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center shrink-0 text-[#C5A880] mt-0.5">
          <Clock size={20} className="animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-white tracking-wide">
              Session Inactivity Warning
            </h4>
            <span className="px-2 py-0.5 rounded-md bg-[#C5A880]/20 text-[#C5A880] text-[11px] font-mono font-bold tracking-wider">
              {formatCountdown(secondsRemaining)}
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            For your protection, your session will automatically terminate in{' '}
            <strong className="text-[#C5A880]">{secondsRemaining} seconds</strong> due to inactivity.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleStaySignedIn}
              className="flex-1 py-2 px-3 bg-[#C5A880] hover:bg-[#B3936A] text-black font-semibold text-xs rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Stay Signed In</span>
            </button>

            <button
              onClick={handleManualLogout}
              className="py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
