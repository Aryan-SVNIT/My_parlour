import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-rosegold-200 border-t-rosegold-600 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
          Loading Owner Portal...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-cream-50 font-sans text-charcoal-800">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative w-64 h-full z-10 animate-slideRight">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-white p-1 rounded-lg hover:bg-charcoal-800"
            >
              <X className="w-5 h-5" />
            </button>
            <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet context={{ openMobileMenu: () => setMobileSidebarOpen(true) }} />
      </div>
    </div>
  );
};
