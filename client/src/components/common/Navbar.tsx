import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, Menu, Phone, Sparkles, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface NavbarProps {
  onOpenTrackModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTrackModal }) => {
  const { settings } = useSettings();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Offers & Packages', path: '/offers' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-rosegold-100">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rosegold-600 via-blush-600 to-rosegold-700 text-white text-xs sm:text-sm py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-blush-200 animate-pulse" />
            <span className="font-medium">
              Festival Glow Season: Get 20% off on all luxury facials! Use code{' '}
              <strong className="underline underline-offset-2">GLOW20</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-rosegold-100 hidden md:flex">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {settings.opening_hours_text.split('|')[0]}
            </span>
            <a
              href={`tel:${settings.contact_phone}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> {settings.contact_phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rosegold-100 via-blush-50 to-white p-2 border border-rosegold-200 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img src={settings.logo_url || '/logo.svg'} alt={settings.parlour_name} className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-charcoal-900 block leading-tight">
                {settings.parlour_name}
              </span>
              <span className="text-xs tracking-widest uppercase font-medium text-rosegold-600 block">
                {settings.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-rosegold-50 text-rosegold-700 font-semibold shadow-xs'
                    : 'text-charcoal-800 hover:text-rosegold-600 hover:bg-cream-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onOpenTrackModal}
              className="text-xs uppercase tracking-wider font-semibold text-charcoal-700 hover:text-rosegold-600 px-3 py-2 rounded-lg border border-rosegold-200 hover:border-rosegold-400 bg-white hover:bg-rosegold-50 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-rosegold-600" />
              Track Booking
            </button>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-medium px-5 py-2.5 rounded-full text-sm shadow-rose hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/book"
              className="bg-rosegold-600 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-sm"
            >
              Book Now
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal-800 hover:bg-cream-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-rosegold-700" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-rosegold-100 px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-base font-medium ${
                isActive(link.path)
                  ? 'bg-rosegold-50 text-rosegold-700 font-semibold'
                  : 'text-charcoal-800 hover:bg-cream-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-cream-200 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenTrackModal) onOpenTrackModal();
              }}
              className="w-full py-2.5 text-center text-sm font-semibold rounded-xl border border-rosegold-200 text-rosegold-700 bg-rosegold-50 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Track Appointment Status
            </button>
            <Link
              to="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center text-sm font-semibold rounded-xl bg-gradient-to-r from-rosegold-600 to-blush-600 text-white shadow-rose flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Book Appointment Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
