import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, Users, Mail, LogOut } from 'lucide-react';

const navItems = [

  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Product List', icon: Package, path: '/admin/products' },
  { label: 'Order Details', icon: Receipt, path: '/admin/orders' },
  { label: 'Customer Details', icon: Users, path: '/admin/users' },
  { label: 'Enquiries', icon: Mail, path: '/admin/enquiries' },
  { label: 'Reviews', icon: 'star', path: '/admin/reviews' }

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
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-[260px] bg-[#0E1017]
          flex flex-col py-6 px-4 border-r border-[#1E2230]
          z-50 overflow-y-auto
          transition-transform duration-300 ease-in-out
          shadow-2xl lg:shadow-none
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand heading */}
        <div className="flex flex-col mb-10 px-3 cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="font-caslon text-2xl font-normal tracking-[0.2em] text-white uppercase text-left">
            Chronos
          </h1>
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#C5A880] mt-1">
            Admin Console
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2.5 px-3.5 rounded-lg text-xs font-medium tracking-wide
                   transition-all duration-200 ease-in-out
                   ${isActive
                     ? 'bg-[#181C28] text-white shadow-sm border border-white/10'
                     : 'text-[#8E95A5] hover:bg-[#151822] hover:text-white'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-[#C5A880]' : 'text-[#8E95A5]'} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="mt-auto border-t border-[#1E2230] pt-4 flex flex-col gap-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2.5 px-3.5 rounded-lg
                       text-xs font-medium text-[#8E95A5] hover:bg-[#151822] hover:text-white transition-colors duration-200 w-full text-left"
          >
            <LogOut size={18} className="text-[#8E95A5]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}