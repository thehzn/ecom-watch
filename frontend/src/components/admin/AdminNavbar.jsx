import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Bell, Home, User } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { setUnreadCount } from '../../redux/notificationSlice';
import adminAvatar from '../../assets/admin-avatar.webp';

export default function AdminNavbar({ onMenuClick }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { get } = useApi();

  const unreadCount = useSelector((state) => state.notification.unreadCount);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const data = await get('/apinotify/getcountofnotify');
        if (!cancelled) {
          dispatch(setUnreadCount(data?.count ?? 0));
        }
      } catch {
        // silently ignore
      }
    };

    fetchCount();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header
      className="h-16 w-full flex items-center justify-between lg:justify-end
                 px-4 sm:px-8 sticky top-0 z-40
                 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs"
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notification button */}
        <button
          onClick={() => navigate('/admin/notifications')}
          aria-label="Notifications"
          className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1
                         flex items-center justify-center rounded-full
                         bg-[#A82D2D] text-white text-[9px] font-bold leading-none shadow-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Storefront home link */}
        <Link
          to="/"
          aria-label="Back to storefront"
          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Visit Storefront"
        >
          <Home size={19} />
          <span className="hidden md:inline text-xs text-gray-500 font-normal">Storefront</span>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200" />

        {/* Admin profile */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/profile')}
            aria-label="Admin profile"
            className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 hover:border-black
                       flex items-center justify-center shrink-0 bg-gray-100 transition-colors"
          >
            {adminAvatar ? (
              <img
                src={adminAvatar}
                alt="Admin"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={14} className="text-gray-600" />
            )}
          </button>
          <span className="hidden sm:inline text-xs font-medium text-gray-800">
            Administrator
          </span>
        </div>
      </div>
    </header>
  );
}