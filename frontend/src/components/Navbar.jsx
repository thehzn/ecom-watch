import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingBag, User } from 'lucide-react';
import { logout as logoutAction } from '../../redux/authSlice';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
];

const NAV_LINK_CLASS =
  "font-['Inter'] text-xs font-semibold text-[#5D5E63] transition-colors duration-200 hover:text-black";

const ACTION_BUTTON_CLASS =
  "w-full rounded font-['Inter'] text-xs font-semibold bg-black text-white px-4 py-2.5";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close the profile panel when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    setProfileOpen(false);
  };

  return (
    <header className="w-full bg-white border-b border-[#C4C7C7]/20">
      <div className="max-w-screen-2xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Title */}
        <button
          onClick={() => navigate('/')}
          className="font-['Libre_Caslon_Text'] text-2xl font-bold text-black tracking-wide"
        >
          CHRONOS
        </button>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.to)}
              className={NAV_LINK_CLASS}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          {/* Search Field */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center w-48 bg-[#F3F3F4] px-4 py-2"
          >
            <Search size={20} className="text-[#5D5E63] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search heritage..."
              className="bg-transparent outline-none w-full ml-2 font-['Inter'] text-xs placeholder:text-[#C6C6CB]"
            />
          </form>

          {/* Shopping Bag Icon */}
          <button onClick={() => navigate('/cart')} aria-label="Shopping cart">
            <ShoppingBag size={24} className="text-black" />
          </button>

          {/* Profile Icon + Action Panel */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Account"
            >
              <User size={24} className="text-black" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#CFC4C5] shadow-sm p-3 flex flex-col gap-2 z-50">
                {user ? (
                  <>
                    <p className="truncate font-['Inter'] text-xs font-semibold text-[#1A1C1C]">
                      {user.firstName} {user.lastName}
                    </p>
                    <button onClick={handleLogout} className={ACTION_BUTTON_CLASS}>
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/login');
                    }}
                    className={ACTION_BUTTON_CLASS}
                  >
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}