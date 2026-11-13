import React from 'react';
import { Menu, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onQuickAction?: () => void;
  quickActionLabel?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
  onQuickAction,
  quickActionLabel = '+ New Walk-in',
}) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-rosegold-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-charcoal-700 hover:bg-cream-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900 leading-tight">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-charcoal-500 font-light mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onQuickAction && (
          <button
            onClick={onQuickAction}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-semibold text-xs shadow-rose hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{quickActionLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};

