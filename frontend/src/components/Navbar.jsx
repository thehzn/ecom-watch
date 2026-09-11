import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingBag, User, Heart, Menu, X } from 'lucide-react';
import { logout as logoutAction } from '../redux/authSlice';
import { clearCart } from '../redux/cartSlice'; 
import {clearWishlist} from '../redux/wishlistSlice';

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
    dispatch(clearCart());
    dispatch(clearWishlist());
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#08090C]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3'
          : 'bg-[#08090C]/80 backdrop-blur-md border-b border-white/5 py-4 sm:py-5'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex flex-col items-start group">
          <span className="font-caslon text-xl sm:text-2xl font-normal tracking-[0.25em] text-white group-hover:text-[#E4CA99] transition-colors duration-300 uppercase">
            Chronos
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.35em] text-gray-400 uppercase font-medium">
            Haute Horlogerie
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="relative text-[11px] uppercase tracking-[0.2em] text-gray-300 hover:text-white font-medium transition-colors py-1.5 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A880] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center w-48 xl:w-60 bg-[#11141C] border border-white/10 focus-within:border-[#C5A880]/60 rounded-full px-3.5 py-1.5 transition-all shadow-inner"
          >
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timepieces..."
              className="bg-transparent outline-none w-full ml-2 text-xs text-white placeholder:text-gray-500"
            />
          </form>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label="Search"
            className="p-2 text-gray-300 hover:text-[#C5A880] md:hidden transition-colors rounded-lg"
          >
            <Search size={19} />
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative p-2 text-gray-300 hover:text-[#C5A880] transition-colors rounded-lg"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 -right-1 bg-[#C5A880] text-black text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-md">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag */}
          <Link
            to="/cart"
            aria-label="Shopping bag"
            className="relative p-2 text-gray-300 hover:text-[#C5A880] transition-colors rounded-lg"
          >
            <ShoppingBag size={19} />
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
              className="flex items-center gap-2 p-2 text-gray-300 hover:text-white transition-colors rounded-lg"
            >
              <User size={19} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#10131A] border border-white/15 shadow-2xl p-3 rounded-xl flex flex-col gap-2 z-50 backdrop-blur-xl">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-[#C5A880] font-semibold">
                        Client Dossier
                      </p>
                      <p className="truncate text-sm font-medium text-white">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>

                    {user.role !== 'admin' && (
                      <Link
                        to="/myaccount"
                        onClick={() => setProfileOpen(false)}
                        className="w-full text-left text-xs text-gray-300 px-3 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                      >
                        Client Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full mt-1 bg-white hover:bg-[#F3F3F4] text-black text-xs font-semibold uppercase tracking-wider px-3 py-2.5 rounded-lg transition-all shadow-sm active:scale-[0.98]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="p-2 flex flex-col gap-2.5">
                    <p className="text-xs text-gray-400 text-center">
                      Experience bespoke horology privileges.
                    </p>
                    <Link
                      to="/login"
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-center bg-white hover:bg-[#F3F3F4] text-black text-xs font-semibold uppercase tracking-wider py-2.5 rounded-lg transition-all shadow-sm active:scale-[0.98]"
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
            className="p-2 text-gray-300 hover:text-white lg:hidden transition-colors rounded-lg"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0D12] px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-[#151922] border border-white/15 rounded-lg px-3 py-2">
            <Search size={15} className="text-gray-400 shrink-0" />
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
        <nav className="lg:hidden border-t border-white/10 bg-[#0B0D12]/98 backdrop-blur-2xl px-6 py-6 flex flex-col gap-3 shadow-2xl">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="text-left text-xs uppercase tracking-[0.18em] text-gray-300 hover:text-white py-2.5 border-b border-white/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="pt-3 flex flex-col gap-3">
              <div className="text-xs text-gray-400">
                Signed in as <span className="text-white font-medium">{user.firstName}</span>
              </div>
              {user.role !== 'admin' && (
                <Link
                  to="/myaccount"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left text-xs uppercase tracking-[0.18em] text-gray-300 hover:text-white py-2 border-b border-white/5 transition-colors"
                >
                  Client Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full bg-white text-black text-xs font-semibold uppercase tracking-wider py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center mt-2 bg-white text-black text-xs font-semibold uppercase tracking-wider py-3 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
            >
              Client Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
