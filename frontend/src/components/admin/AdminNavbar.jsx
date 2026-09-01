// import { useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useApi } from '../../hooks/useApi';
// import { setUnreadCount } from '../../redux/notificationSlice';
// import adminAvatar from '../../assets/admin-avatar.webp';

// export default function AdminNavbar({ onMenuClick }) {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { get } = useApi();

//   const unreadCount = useSelector((state) => state.notification.unreadCount);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchCount = async () => {
//       try {
//         const data = await get('/apinotify/getcountofnotify');
//         if (!cancelled) {
//           dispatch(setUnreadCount(data?.count ?? 0));
//         }
//       } catch {
//         // silently ignore — badge just won't show a number this session
//       }
//     };

//     fetchCount();

//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <header
//       className="h-16 w-full flex items-center justify-between lg:justify-end
//                  px-4 lg:px-10 sticky top-0 bg-[#F9F9F9]/80 backdrop-blur-sm z-40"
//     >
//       {/* Hamburger — mobile only */}
//       <button
//         onClick={onMenuClick}
//         className="lg:hidden p-2 -ml-2"
//         aria-label="Open menu"
//       >
//         <span className="material-symbols-outlined text-[24px] text-icon-dark">
//           menu
//         </span>
//       </button>

//       <div className="flex items-center gap-6">
//         {/* Notification button */}
//         <button
//           onClick={() => navigate('/admin/notifications')}
//           aria-label="Notifications"
//           className="relative bg-transparent border-none cursor-pointer
//                      transition-opacity duration-300 ease-in-out hover:opacity-70"
//         >
//           <span className="material-symbols-outlined text-[22px] text-icon-dark">
//             notifications
//           </span>
//           {unreadCount > 0 && (
//             <span
//               className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1
//                          flex items-center justify-center rounded-full
//                          bg-badge-red text-white text-[9px] font-semibold leading-none"
//             >
//               {unreadCount > 99 ? '99+' : unreadCount}
//             </span>
//           )}
//         </button>

//         {/* Home link */}
//         <Link to="/" className="text-nav-text hover:opacity-70 transition-opacity">
//           <span className="material-symbols-outlined text-[22px] text-icon-dark">
//             home
//           </span>
//         </Link>

//         {/* Admin profile */}
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate('/admin/profile')}
//             className="w-8 h-8 rounded-full overflow-hidden border border-sidebar-border
//                        flex items-center justify-center shrink-0"
//           >
//             <img
//               src={adminAvatar}
//               alt="Admin"
//               className="w-full h-full object-cover"
//             />
//           </button>
//           <span className="font-worksans text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-black">
//             Administrator
//           </span>
//         </div>
//       </div>
//     </header>
//   );
// }

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
        // silently ignore — badge just won't show a number this session
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
                 px-4 lg:px-10 sticky top-0 z-40
                 bg-[#F9F9F9]/90 backdrop-blur-sm border-b border-[#CFC4C5]"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-black transition-opacity duration-300 hover:opacity-60"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-5 sm:gap-6">
        {/* Notification button */}
        <button
          onClick={() => navigate('/admin/notifications')}
          aria-label="Notifications"
          className="relative text-black transition-opacity duration-300 hover:opacity-60"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1
                         flex items-center justify-center rounded-full
                         bg-black text-white text-[9px] font-semibold leading-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Home link */}
        <Link
          to="/"
          aria-label="Back to storefront"
          className="text-black transition-opacity duration-300 hover:opacity-60"
        >
          <Home size={20} />
        </Link>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-[#CFC4C5]" />

        {/* Admin profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/profile')}
            aria-label="Admin profile"
            className="w-8 h-8 rounded-full overflow-hidden border border-[#CFC4C5]
                       flex items-center justify-center shrink-0 bg-white"
          >
            {adminAvatar ? (
              <img
                src={adminAvatar}
                alt="Admin"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={14} className="text-[#5E5E5E]" />
            )}
          </button>
          <span className="hidden sm:inline text-[11px] font-semibold tracking-[0.1em] uppercase text-black">
            Administrator
          </span>
        </div>
      </div>
    </header>
  );
}