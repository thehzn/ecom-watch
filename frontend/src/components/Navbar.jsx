import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingBag, User, Heart, Menu, X } from 'lucide-react';
import { logout as logoutAction } from '../redux/authSlice';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Collections', to: '/categories' },
  { label: 'Timepieces', to: '/shop' },
  { label: 'The Manufacture', to: '/about' },
  { label: 'Concierge', to: '/contact' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef(null);

  const cartCount = useSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistCount = useSelector((state) => state.wishlist?.items?.length || 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#08090C]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5'
          : 'bg-[#08090C]/80 backdrop-blur-md border-b border-white/5 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex flex-col items-start group">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-white group-hover:text-gray-300 transition-colors">
            CHRONOS
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.35em] text-gray-400 uppercase font-semibold">
            Haute Horlogerie
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="relative text-xs uppercase tracking-[0.18em] text-gray-300 hover:text-white font-semibold transition-colors py-1 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center w-48 xl:w-60 bg-[#12151B] border border-white/15 focus-within:border-white/50 rounded-full px-4 py-2 transition-all"
          >
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timepieces..."
              className="bg-transparent outline-none w-full ml-2.5 text-xs text-white placeholder:text-gray-500"
            />
          </form>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label="Search"
            className="p-2 text-gray-300 hover:text-white md:hidden transition-colors"
          >
            <Search size={20} />
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative p-2 text-gray-300 hover:text-white transition-colors"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 -right-1 bg-white text-black text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-md">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag */}
          <Link
            to="/cart"
            aria-label="Shopping bag"
            className="relative p-2 text-gray-300 hover:text-white transition-colors"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1 -right-1 bg-white text-black text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile */}
          <div className="relative hidden md:block" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Account"
              className="flex items-center gap-2 p-2 text-gray-300 hover:text-white transition-colors"
            >
              <User size={20} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#101318] border border-white/20 shadow-2xl p-3 rounded-xl flex flex-col gap-2 z-50 backdrop-blur-xl">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                        Client
                      </p>
                      <p className="truncate text-sm font-medium text-white">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>

                    {user.role !== 'admin' && (
                      <Link
                        to="/myaccount"
                        onClick={() => setProfileOpen(false)}
                        className="w-full text-left text-xs text-gray-300 px-3 py-2 hover:bg-white/10 hover:text-white rounded transition-colors"
                      >
                        Client Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full mt-1 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider px-3 py-2.5 rounded-lg transition-all"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="p-2 flex flex-col gap-2">
                    <p className="text-xs text-gray-400 text-center">
                      Experience bespoke horology privileges.
                    </p>
                    <Link
                      to="/login"
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-center bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg transition-all"
                    >
                      Client Login
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="p-2 text-gray-300 hover:text-white lg:hidden transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0D11] px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-[#161920] border border-white/20 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timepieces..."
              autoFocus
              className="bg-transparent outline-none w-full ml-2 text-xs text-white placeholder:text-gray-500"
            />
          </form>
        </div>
      )}

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-white/10 bg-[#0B0D11]/98 backdrop-blur-2xl px-6 py-6 flex flex-col gap-4 shadow-2xl">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="text-left text-sm uppercase tracking-[0.15em] text-gray-300 hover:text-white py-2 border-b border-white/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="pt-3 flex flex-col gap-3">
              <div className="text-xs text-gray-400">
                Signed in as <span className="text-white font-medium">{user.firstName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-white text-black text-xs font-bold uppercase tracking-wider py-3 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center mt-2 bg-white text-black text-xs font-bold uppercase tracking-wider py-3 rounded-lg"
            >
              Client Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
