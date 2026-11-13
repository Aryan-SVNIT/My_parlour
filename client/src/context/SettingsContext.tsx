import React, { createContext, useContext, useEffect, useState } from 'react';
import { publicApi } from '../api/client';
import { BusinessHours, WebsiteSettings } from '../types';

interface SettingsContextType {
  settings: WebsiteSettings;
  businessHours: BusinessHours[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: WebsiteSettings = {
  parlour_name: 'Aashmi Beauty Parlour',
  tagline: 'Beauty, Care & Confidence',
  logo_url: '/logo.svg',
  contact_phone: '+91 98765 43210',
  whatsapp_number: '919876543210',
  email: 'care@aashmibeauty.com',
  address: 'Shop 14-15, Royal Grace Complex, Civil Lines',
  city: 'Jaipur',
  state: 'Rajasthan',
  pincode: '302006',
  google_maps_url: 'https://maps.google.com/?q=Civil+Lines+Jaipur',
  google_maps_embed: '',
  instagram_url: 'https://instagram.com/aashmibeautyparlour',
  facebook_url: 'https://facebook.com/aashmibeautyparlour',
  opening_hours_text: 'Mon - Sat: 10:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM',
  advance_booking_days: 30,
  min_booking_notice_hours: 1,
  cancellation_policy: 'Free cancellation or reschedule up to 2 hours before your appointment.',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await publicApi.getSettings();
      if (res.data.success) {
        setSettings(res.data.settings);
        setBusinessHours(res.data.business_hours);
      }
    } catch (err) {
      console.error('Failed to load website settings, using defaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        businessHours,
        isLoading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

