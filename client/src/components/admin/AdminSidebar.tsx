import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Clock,
  ExternalLink,
  Gift,
  Globe,
  Home,
  Image as ImageIcon,
  LogOut,
  Scissors,
  Settings,
  Star,
  Users,
  UserX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { settings } = useSettings();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Services & Menu', path: '/admin/services', icon: Scissors },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Staff Management', path: '/admin/staff', icon: UserX },
    { name: 'Hours & Holidays', path: '/admin/business-hours', icon: Clock },
    { name: 'Offers & Combos', path: '/admin/offers', icon: Gift },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
    { name: 'Website Settings', path: '/admin/settings', icon: Settings },
    { name: 'Reports & CSV', path: '/admin/reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-charcoal-900 text-nude-200 flex flex-col h-full border-r border-charcoal-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-charcoal-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rosegold-500/20 p-2 border border-rosegold-500/40 flex items-center justify-center">
          <img src={settings.logo_url || '/logo.svg'} alt={settings.parlour_name} className="w-full h-full object-contain filter invert opacity-90" />
        </div>
        <div className="min-w-0">
          <span className="font-serif text-lg font-bold text-white block truncate leading-tight">
            {settings.parlour_name}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-rosegold-400 block">
            Owner Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                active
                  ? 'bg-rosegold-600 text-white shadow-xs'
                  : 'text-nude-300 hover:bg-charcoal-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer User Info & Exit */}
      <div className="p-4 border-t border-charcoal-800 space-y-3">
        <div className="flex items-center justify-between text-xs px-2">
          <div className="truncate">
            <p className="font-bold text-white truncate">{user?.full_name || 'Parlour Admin'}</p>
            <p className="text-[10px] text-nude-400 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/"
            target="_blank"
            className="flex-1 py-2 px-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-[11px] font-medium text-nude-300 hover:text-white flex items-center justify-center gap-1 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-rosegold-400" />
            <span>Live Site</span>
          </Link>
          <button
            onClick={logout}
            className="py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900 text-rose-300 hover:text-white text-[11px] font-medium flex items-center justify-center transition-colors"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
