

import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
  { label: 'Product List', icon: 'inventory_2', path: '/admin/products' },
  { label: 'Order Details', icon: 'receipt', path: '/admin/orders' },
  { label: 'Customer Details', icon: 'group', path: '/admin/users' },
  { label: 'Enquiries', icon: 'mail', path: '/admin/enquiries' },

];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile backdrop — starts right where the sidebar ends, so it dims the
          content behind the drawer without ever sitting underneath the drawer itself */}
      {isOpen && (
        <div
          className="fixed inset-y-0 right-0 left-[260px] bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-[260px] bg-sidebar-bg
          flex flex-col py-6 px-4 border-r border-sidebar-border
          z-50 overflow-y-auto
          transition-transform duration-300 ease-in-out
          shadow-2xl lg:shadow-none
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand heading */}
        <div className="flex flex-col mb-12 px-2">
          <h1 className="font-caslon text-2xl font-normal leading-8 tracking-[-0.02em] uppercase text-brand-black text-left">
            Chronos
          </h1>
          <span className="font-worksans text-[11px] font-semibold leading-4 tracking-[0.1em] uppercase text-subtitle-gray mt-1">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 pl-3 pr-3 relative rounded-r-lg
                 border-l-2 transition-colors duration-300 ease-in-out
                 hover:bg-nav-hover
                 ${isActive
                   ? 'border-brand-black bg-nav-hover'
                   : 'border-transparent bg-transparent'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[20px] leading-none
                      ${isActive ? 'text-brand-black' : 'text-nav-text'}`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`font-worksans text-sm leading-5
                      ${isActive ? 'font-medium text-brand-black' : 'font-normal text-nav-text'}`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="mt-auto border-t border-sidebar-border pt-4 flex flex-col gap-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2.5 pl-3 pr-3 rounded-r-lg
                       border-l-2 border-transparent
                       text-nav-text bg-transparent transition-colors duration-300 ease-in-out
                       hover:bg-nav-hover w-full text-left"
          >
            <span className="material-symbols-outlined text-[20px] text-nav-text leading-none">
              logout
            </span>
            <span className="font-worksans text-sm font-normal leading-5 text-nav-text">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}