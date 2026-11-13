import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle2, Save, Settings as SettingsIcon } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { useSettings } from '../../context/SettingsContext';
import { WebsiteSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();
  const { refreshSettings } = useSettings();

  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminApi.getSettings();
        if (res.data.success) {
          setSettings(res.data.settings);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field: keyof WebsiteSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setSuccessMsg(false);

    try {
      const res = await adminApi.updateSettings(settings);
      if (res.data.success) {
        await refreshSettings();
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save website settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Website Settings" onOpenMobileMenu={openMobileMenu} />
        <div className="p-12 text-center text-xs text-charcoal-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Parlour Branding & Website Settings"
        subtitle="Manage business branding, phone numbers, WhatsApp, map location, and policies"
        onOpenMobileMenu={openMobileMenu}
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully! Changes are now live on your customer website.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-rosegold-100 shadow-soft space-y-6">
          {/* Section 1: Business Identity */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 border-b border-cream-200 pb-2">
              Business Identity & Branding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Parlour Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.parlour_name}
                  onChange={(e) => handleChange('parlour_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={settings.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={settings.logo_url}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4 pt-4 border-t border-cream-200">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 border-b border-cream-200 pb-2">
              Contact & Social Channels
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Calling Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={settings.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  WhatsApp Number (with country code) *
                </label>
                <input
                  type="text"
                  required
                  value={settings.whatsapp_number}
                  onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  placeholder="919876543210"
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={settings.instagram_url}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Opening Hours Summary Text
                </label>
                <input
                  type="text"
                  value={settings.opening_hours_text}
                  onChange={(e) => handleChange('opening_hours_text', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Address & Map */}
          <div className="space-y-4 pt-4 border-t border-cream-200">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 border-b border-cream-200 pb-2">
              Physical Location & Google Maps
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-3">
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={settings.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={settings.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={settings.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Google Maps URL (Directions Link)
                </label>
                <input
                  type="url"
                  value={settings.google_maps_url}
                  onChange={(e) => handleChange('google_maps_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Google Maps Embed Iframe URL
                </label>
                <input
                  type="text"
                  value={settings.google_maps_embed}
                  onChange={(e) => handleChange('google_maps_embed', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Booking Policies */}
          <div className="space-y-4 pt-4 border-t border-cream-200">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 border-b border-cream-200 pb-2">
              Booking Limits & Cancellation Policy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Advance Booking Window (Days) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={90}
                  value={settings.advance_booking_days}
                  onChange={(e) => handleChange('advance_booking_days', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Minimum Notice for Booking / Cancellation (Hours) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={24}
                  value={settings.min_booking_notice_hours}
                  onChange={(e) => handleChange('min_booking_notice_hours', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Cancellation Policy Text
                </label>
                <textarea
                  rows={2}
                  value={settings.cancellation_policy}
                  onChange={(e) => handleChange('cancellation_policy', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-bold text-sm shadow-rose hover:shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating Website...' : 'Save Settings & Update Website'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

