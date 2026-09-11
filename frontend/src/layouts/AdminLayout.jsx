

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[260px] min-h-screen flex flex-col bg-[#F8F9FA]">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
