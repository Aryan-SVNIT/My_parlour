import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Lock, Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-charcoal-900 text-nude-200 border-t border-rosegold-900/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-charcoal-800">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rosegold-500/20 p-2 border border-rosegold-500/30 flex items-center justify-center">
                <img src={settings.logo_url || '/logo.svg'} alt={settings.parlour_name} className="w-full h-full object-contain filter invert opacity-90" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                {settings.parlour_name}
              </span>
            </div>
            <p className="text-sm text-nude-300 leading-relaxed font-light">
              Your sanctuary for bespoke hair styling, luxury skin rituals, bridal makeovers, and rejuvenating wellness therapies.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-charcoal-800 hover:bg-rosegold-600 hover:text-white flex items-center justify-center transition-all duration-200 text-nude-300"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp_number}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-charcoal-800 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-200 text-nude-300"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-white tracking-wide mb-4">
              Explore Parlour
            </h3>
            <ul className="space-y-2.5 text-sm font-light">
              <li>
                <Link to="/" className="hover:text-rosegold-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-rosegold-400 transition-colors">
                  All Services & Price List
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-rosegold-400 transition-colors">
                  Special Offers & Packages
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-rosegold-400 transition-colors">
                  Salon Gallery & Looks
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-rosegold-400 transition-colors">
                  About Our Founders
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-rosegold-400 transition-colors">
                  Contact & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Signature Treatments */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-white tracking-wide mb-4">
              Signature Treatments
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-nude-300 font-light">
              <li>• O3+ Bridal Glow & 24K Gold Facial</li>
              <li>• Keratin Hair Smoothening & Spa</li>
              <li>• Signature HD Engagement Makeup</li>
              <li>• Rica Liposoluble Painless Waxing</li>
              <li>• Aroma Rose Pedicure & Nail Care</li>
              <li>• Complete Royal Bridal Rituals</li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-white tracking-wide mb-4">
              Visit & Connect
            </h3>
            <div className="flex items-start gap-3 text-xs sm:text-sm text-nude-300 font-light">
              <MapPin className="w-4 h-4 text-rosegold-400 mt-1 flex-shrink-0" />
              <span>
                {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-nude-300">
              <Phone className="w-4 h-4 text-rosegold-400 flex-shrink-0" />
              <a href={`tel:${settings.contact_phone}`} className="hover:text-rosegold-400 font-medium">
                {settings.contact_phone}
              </a>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-nude-300">
              <Mail className="w-4 h-4 text-rosegold-400 flex-shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:text-rosegold-400 font-medium">
                {settings.email}
              </a>
            </div>
            <div className="flex items-start gap-3 text-xs sm:text-sm text-nude-300 pt-2 font-light">
              <Clock className="w-4 h-4 text-rosegold-400 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Opening Hours:</p>
                <p className="text-xs text-nude-300">{settings.opening_hours_text}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-nude-400">
          <p>© {new Date().getFullYear()} {settings.parlour_name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-rosegold-400 transition-colors">
              Terms & Policies
            </Link>
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-nude-300 hover:text-rosegold-400 bg-charcoal-800/80 hover:bg-charcoal-700 px-3 py-1.5 rounded-lg border border-charcoal-700 transition-all duration-200"
            >
              <Lock className="w-3 h-3 text-rosegold-400" />
              <span>Owner Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
