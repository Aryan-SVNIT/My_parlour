import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Edit, Gift, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Offer } from '../../types';

export const AdminOffersPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [promoCode, setPromoCode] = useState('');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [imageUrl, setImageUrl] = useState('');
  const [badgeText, setBadgeText] = useState('Special Offer');
  const [isActive, setIsActive] = useState(true);

  const fetchOffers = async () => {
    try {
      const res = await adminApi.getOffers();
      if (res.data.success) {
        setOffers(res.data.offers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const openAddModal = () => {
    setEditingOffer(null);
    setTitle('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(20);
    setPromoCode('');
    setValidFrom(new Date().toISOString().split('T')[0]);
    setValidUntil('2026-12-31');
    setImageUrl('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80');
    setBadgeText('Special Offer');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (off: Offer) => {
    setEditingOffer(off);
    setTitle(off.title);
    setDescription(off.description);
    setDiscountType(off.discount_type);
    setDiscountValue(off.discount_value);
    setPromoCode(off.promo_code || '');
    setValidFrom(off.valid_from);
    setValidUntil(off.valid_until);
    setImageUrl(off.image_url || '');
    setBadgeText(off.badge_text || '');
    setIsActive(off.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        discount_type: discountType,
        discount_value: discountValue,
        promo_code: promoCode,
        valid_from: validFrom,
        valid_until: validUntil,
        image_url: imageUrl,
        badge_text: badgeText,
        is_active: isActive,
      };

      if (editingOffer) {
        await adminApi.updateOffer(editingOffer.id, payload);
      } else {
        await adminApi.createOffer(payload);
      }

      setIsModalOpen(false);
      fetchOffers();
    } catch (e) {
      console.error(e);
      alert('Failed to save offer.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await adminApi.deleteOffer(id);
      fetchOffers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Offers & Combo Deals"
        subtitle="Create festive discounts, bridal privileges, and promotional coupon codes"
        onOpenMobileMenu={openMobileMenu}
        onQuickAction={openAddModal}
        quickActionLabel="+ Create New Offer"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((off) => (
            <div
              key={off.id}
              className="bg-white rounded-3xl overflow-hidden border border-rosegold-100 shadow-soft flex flex-col justify-between"
            >
              {off.image_url && (
                <div className="h-40 bg-cream-100 overflow-hidden relative">
                  <img src={off.image_url} alt={off.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rosegold-600 text-white uppercase">
                    {off.badge_text || 'Offer'}
                  </span>
                </div>
              )}

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-serif font-bold text-base text-charcoal-900">{off.title}</h3>
                    <span className="font-bold text-rosegold-700 text-xs whitespace-nowrap">
                      {off.discount_type === 'percentage' ? `${off.discount_value}% OFF` : `₹${off.discount_value} OFF`}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 line-clamp-2 mt-1">{off.description}</p>
                </div>

                <div className="space-y-2 border-t border-cream-200 pt-3 text-xs text-charcoal-500">
                  {off.promo_code && (
                    <div className="flex justify-between">
                      <span>Promo Code:</span>
                      <strong className="font-mono text-rosegold-700">{off.promo_code}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Valid:</span>
                    <span>{off.valid_from} to {off.valid_until}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-cream-100">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      off.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-cream-200 text-charcoal-500'
                    }`}
                  >
                    {off.is_active ? 'Active' : 'Hidden'}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(off)}
                      className="p-1.5 text-charcoal-600 hover:text-rosegold-700 hover:bg-cream-100 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(off.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rosegold-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-4">
              {editingOffer ? 'Edit Offer' : 'Create Special Offer'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Festival Glow Special - 20% Off"
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="GLOW20"
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Valid Until *</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Most Popular"
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-rosegold-600"
                  />
                  <span>Publish Offer on Website</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rosegold-600 text-white rounded-xl font-bold"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

