// import { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { Search, ShoppingBag, User,Heart } from 'lucide-react';
// import { logout as logoutAction } from '../redux/authSlice';

// const NAV_LINKS = [
//   { label: 'Home', to: '/' },
//   { label: 'Categories', to: '/categories' },
//   { label: 'About Us', to: '/about' },
//   { label: 'Contact Us', to: '/contact' },
// ];

// const NAV_LINK_CLASS =
//   "font-['Inter'] text-xs font-semibold text-[#5D5E63] transition-colors duration-200 hover:text-black";

// const ACTION_BUTTON_CLASS =
//   "w-full rounded font-['Inter'] text-xs font-semibold bg-black text-white px-4 py-2.5";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.auth.user);

//   const [query, setQuery] = useState('');
//   const [profileOpen, setProfileOpen] = useState(false);
//   const profileRef = useRef(null);
//   const cartCount = useSelector((state) =>
//     state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
//   );
//   const wishlistCount = useSelector((state) => state.wishlist.items.length);

//   // Close the profile panel when clicking outside it
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (profileRef.current && !profileRef.current.contains(e.target)) {
//         setProfileOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);

//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();

//     if (!query.trim()) return;

//     navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
//   };

//   const handleLogout = () => {
//     dispatch(logoutAction());
//     setProfileOpen(false);
//     navigate('/login');
//   };

//   const handleMyAccount = () => {
//     setProfileOpen(false);
//     navigate('/myaccount');
//   };

//   return (
//     <header className="w-full bg-white border-b border-[#C4C7C7]/20">
//       <div className="max-w-screen-2xl mx-auto px-5 py-4 flex items-center justify-between">

//         {/* Title */}
//         <button
//           onClick={() => navigate('/')}
//           className="font-['Libre_Caslon_Text'] text-2xl font-bold text-black tracking-wide"
//         >
//           CHRONOS
//         </button>

//         {/* Navigation Links */}
//         <nav className="flex items-center gap-4">
//           {NAV_LINKS.map((link) => (
//             <button
//               key={link.label}
//               onClick={() => navigate(link.to)}
//               className={NAV_LINK_CLASS}
//             >
//               {link.label}
//             </button>
//           ))}
//         </nav>

//         {/* Action Icons */}
//         <div className="flex items-center gap-4">

//           {/* Search Field */}
//           <form
//             onSubmit={handleSearchSubmit}
//             className="flex items-center w-48 bg-[#F3F3F4] px-4 py-2"
//           >
//             <Search
//               size={20}
//               className="text-[#5D5E63] shrink-0"
//             />

//             <input
//               type="text"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search heritage..."
//               className="bg-transparent outline-none w-full ml-2 font-['Inter'] text-xs placeholder:text-[#C6C6CB]"
//             />
//           </form>

//           {/* Shopping Bag Icon */}
//           {/* <button
//             onClick={() => navigate('/cart')}
//             aria-label="Shopping cart"
//           >
//             <ShoppingBag
//               size={24}
//               className="text-black"
//             />
//           </button> */}
//           <button
//   onClick={() => navigate('/cart')}
//   aria-label="Shopping cart"
//   className="relative"
// >
//   <ShoppingBag size={24} className="text-black" />
//   {cartCount > 0 && (
//     <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
//       {cartCount}
//     </span>
//   )}
// </button>
// {/* wishlist heart icon  and count */}
// <button
//   onClick={() => navigate('/wishlist')}
//   aria-label="Wishlist"
//   className="relative"
// >
//   <Heart size={24} className="text-black" />
//   {wishlistCount > 0 && (
//     <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
//       {wishlistCount}
//     </span>
//   )}
// </button>

//           {/* Profile Icon + Action Panel */}
//           <div
//             className="relative"
//             ref={profileRef}
//           >
//             <button
//               onClick={() => setProfileOpen((prev) => !prev)}
//               aria-label="Account"
//             >
//               <User
//                 size={24}
//                 className="text-black"
//               />
//             </button>

//             {profileOpen && (
//               <div className="absolute right-0 mt-2 w-48 bg-white border border-[#CFC4C5] shadow-sm p-3 flex flex-col gap-2 z-50">

//                 {user ? (
//                   <>
//                     {/* User Name */}
//                     <p className="truncate font-['Inter'] text-xs font-semibold text-[#1A1C1C] px-1">
//                       {user.firstName} {user.lastName}
//                     </p>

// {/*                    
//                     <button
//                       onClick={handleMyAccount}
//                       className="w-full text-left font-['Inter'] text-xs font-semibold text-black px-2 py-2.5 hover:bg-[#F3F3F4] transition-colors"
//                     >
//                       My Account
//                     </button> */}
//                     {/* My Account — hidden for admins */}
//     {user.role !== 'admin' && (
//       <button
//         onClick={handleMyAccount}
//         className="w-full text-left font-['Inter'] text-xs font-semibold text-black px-2 py-2.5 hover:bg-[#F3F3F4] transition-colors"
//       >
//         My Account
//       </button>
//     )}

//                     {/* Logout */}
//                     <button
//                       onClick={handleLogout}
//                       className={ACTION_BUTTON_CLASS}
//                     >
//                       Logout
//                     </button>
//                   </>
//                 ) : (
//                   /* Login */
//                   <button
//                     onClick={() => {
//                       setProfileOpen(false);
//                       navigate('/login');
//                     }}
//                     className={ACTION_BUTTON_CLASS}
//                   >
//                     Login
//                   </button>
//                 )}

//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }


import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingBag, User, Heart, Menu, X } from 'lucide-react';
import { logout as logoutAction } from '../redux/authSlice';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const profileRef = useRef(null);

  const cartCount = useSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const wishlistCount = useSelector((state) => state.wishlist.items.length);

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

  // Close the mobile menu/search whenever the viewport grows back to desktop size
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

  const handleMyAccount = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/myaccount');
  };

  const handleNavClick = (to) => {
    navigate(to);
    setMobileMenuOpen(false);
  };

  const handleMobileWishlist = () => {
    navigate('/wishlist');
    setMobileMenuOpen(false);
  };

  const handleMobileLogin = () => {
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="w-full bg-white border-b border-[#C4C7C7]/20 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3">

        {/* Title */}
        <button
          onClick={() => navigate('/')}
          className="font-['Libre_Caslon_Text'] text-lg sm:text-xl md:text-2xl font-bold text-black tracking-wide shrink-0"
        >
          CHRONOS
        </button>

        {/* Navigation Links — desktop only */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
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
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Search Field — desktop only */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center w-40 lg:w-48 bg-[#F3F3F4] px-4 py-2"
          >
            <Search size={20} className="text-[#5D5E63] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product..."
              className="bg-transparent outline-none w-full ml-2 font-['Inter'] text-xs placeholder:text-[#C6C6CB]"
            />
          </form>

          {/* Search icon — mobile only, toggles search bar below header */}
          <button
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label="Search"
            className="md:hidden"
          >
            <Search size={22} className="text-black" />
          </button>

          {/* Shopping Bag Icon — always visible, mobile priority action */}
          <button
            onClick={() => navigate('/cart')}
            aria-label="Shopping cart"
            className="relative"
          >
            <ShoppingBag size={22} className="sm:hidden text-black" />
            <ShoppingBag size={24} className="hidden sm:block text-black" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded-full min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* Wishlist heart icon — desktop only, lives in mobile menu on small screens */}
          <button
            onClick={() => navigate('/wishlist')}
            aria-label="Wishlist"
            className="relative hidden md:block"
          >
            <Heart size={24} className="text-black" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Profile Icon + Action Panel — desktop only, lives in mobile menu on small screens */}
          <div className="relative hidden md:block" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Account"
            >
              <User size={24} className="text-black" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#CFC4C5] shadow-sm p-3 flex flex-col gap-2 z-50">

                {user ? (
                  <>
                    {/* User Name */}
                    <p className="truncate font-['Inter'] text-xs font-semibold text-[#1A1C1C] px-1">
                      {user.firstName} {user.lastName}
                    </p>

                    {/* My Account — hidden for admins */}
                    {user.role !== 'admin' && (
                      <button
                        onClick={handleMyAccount}
                        className="w-full text-left font-['Inter'] text-xs font-semibold text-black px-2 py-2.5 hover:bg-[#F3F3F4] transition-colors"
                      >
                        My Account
                      </button>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className={ACTION_BUTTON_CLASS}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  /* Login */
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

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X size={22} className="text-black" />
            ) : (
              <Menu size={22} className="text-black" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile search bar — toggled by the search icon */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-[#C4C7C7]/20 px-4 py-3">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center w-full bg-[#F3F3F4] px-4 py-2.5"
          >
            <Search size={18} className="text-[#5D5E63] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search heritage..."
              autoFocus
              className="bg-transparent outline-none w-full ml-2 font-['Inter'] text-sm placeholder:text-[#C6C6CB]"
            />
          </form>
        </div>
      )}

      {/* Mobile nav menu — toggled by the hamburger. Holds nav links, Wishlist, and Account/Login. */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-[#C4C7C7]/20 px-4 py-3 flex flex-col">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.to)}
              className="text-left font-['Inter'] text-sm font-semibold text-[#1A1C1C] py-3 border-b border-[#C4C7C7]/10 hover:text-black transition-colors"
            >
              {link.label}
            </button>
          ))}

          {/* Wishlist */}
          <button
            onClick={handleMobileWishlist}
            className="flex items-center justify-between text-left font-['Inter'] text-sm font-semibold text-[#1A1C1C] py-3 border-b border-[#C4C7C7]/10 hover:text-black transition-colors"
          >
            <span className="flex items-center gap-2">
              <Heart size={16} />
              Wishlist
            </span>
            {wishlistCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Account / Login */}
          {user ? (
            <>
              <p className="font-['Inter'] text-xs font-semibold text-[#5D5E63] pt-3 pb-1">
                {user.firstName} {user.lastName}
              </p>

              {user.role !== 'admin' && (
                <button
                  onClick={handleMyAccount}
                  className="text-left font-['Inter'] text-sm font-semibold text-[#1A1C1C] py-3 border-b border-[#C4C7C7]/10 hover:text-black transition-colors"
                >
                  My Account
                </button>
              )}

              <button
                onClick={handleLogout}
                className={`${ACTION_BUTTON_CLASS} mt-3`}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={handleMobileLogin}
              className={`${ACTION_BUTTON_CLASS} mt-3`}
            >
              Login
            </button>
          )}
        </nav>
      )}
    </header>
  );
}