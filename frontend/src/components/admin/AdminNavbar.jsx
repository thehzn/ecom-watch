import { useNavigate, Link } from 'react-router-dom';

export default function AdminNavbar({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header
      className="h-16 w-full flex items-center justify-between lg:justify-end
                 px-4 lg:px-10 sticky top-0 bg-[#F9F9F9]/80 backdrop-blur-sm z-40"
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined text-[24px] text-icon-dark">
          menu
        </span>
      </button>

      <div className="flex items-center gap-6">
        {/* Notification button */}
        <button
          className="relative bg-transparent border-none cursor-pointer
                     transition-opacity duration-300 ease-in-out hover:opacity-70"
        >
          <span className="material-symbols-outlined text-[22px] text-icon-dark">
            notifications
          </span>
          <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-badge-red" />
        </button>

        {/* Home link */}
        <Link to="/" className="text-nav-text hover:opacity-70 transition-opacity">
          <span className="material-symbols-outlined text-[22px] text-icon-dark">
            home
          </span>
        </Link>

        {/* Admin profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/profile')}
            className="w-8 h-8 rounded-full overflow-hidden border border-sidebar-border
                       flex items-center justify-center shrink-0"
          >
            <img
              src="/admin-avatar.jpg"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </button>
          <span className="font-worksans text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-black">
            Administrator
          </span>
        </div>
      </div>
    </header>
  );
}