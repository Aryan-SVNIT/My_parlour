import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useSettings();

  const handleWhatsAppClick = () => {
    const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${settings.parlour_name}, I would like to enquire about parlour appointments and services.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      <button
        onClick={handleWhatsAppClick}
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 relative"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-300"></span>
        </span>
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Hover Tooltip */}
      <div className="absolute right-16 top-2 hidden group-hover:flex items-center">
        <span className="bg-charcoal-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap">
          Chat with us on WhatsApp
        </span>
      </div>
    </div>
  );
};

