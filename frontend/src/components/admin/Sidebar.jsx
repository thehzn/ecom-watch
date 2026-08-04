import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/admin' },
  { label: 'Product List', icon: 'inventory_2', path: '/admin/products' },
  { label: 'Add Product', icon: 'add_box', path: '/admin/products/add' },
  { label: 'Edit Product', icon: 'edit', path: '/admin/products/edit' },
  { label: 'Customer Details', icon: 'group', path: '/admin/customers' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-[260px] bg-sidebar-bg
          flex flex-col py-6 px-4 border-r border-sidebar-border
          z-50 overflow-y-auto
          transition-transform duration-300 ease-in-out
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
        <nav className="flex flex-col flex-1 gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 px-3 relative rounded-lg
                 text-nav-text bg-transparent transition-colors duration-300 ease-in-out
                 hover:bg-nav-hover
                 ${isActive ? 'bg-nav-hover font-medium' : ''}`
              }
            >
              <span className="material-symbols-outlined text-[20px] text-nav-text leading-none">
                {item.icon}
              </span>
              <span className="font-worksans text-sm font-normal leading-5 text-nav-text">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="mt-auto border-t border-sidebar-border pt-4 flex flex-col gap-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg
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