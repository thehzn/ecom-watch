

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sidebar-bg">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[260px] min-h-screen bg-sidebar-bg">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
