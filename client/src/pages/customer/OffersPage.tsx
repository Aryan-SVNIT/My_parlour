import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, Copy, Sparkles, Tag } from 'lucide-react';
import { publicApi } from '../../api/client';
import { Offer } from '../../types';

export const OffersPage: React.FC = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await publicApi.getOffers();
        if (res.data.success) {
          setOffers(res.data.offers);
        }
      } catch (err) {
        console.error('Failed to load offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
          Exclusive Privileges
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-charcoal-900">
          Offers & Combo Packages
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 font-light leading-relaxed">
          Enjoy curated seasonal privileges, combo pampering packages, and festive savings on our most loved salon treatments.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-rosegold-200 border-t-rosegold-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-charcoal-500">Loading seasonal offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-rosegold-100 space-y-3">
          <Tag className="w-12 h-12 text-rosegold-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-charcoal-900">No Active Offers Right Now</h3>
          <p className="text-xs text-charcoal-500">
            Check back soon or follow us on Instagram for upcoming festive discounts!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg border border-rosegold-100 flex flex-col justify-between transition-all duration-300 group"
            >
              {offer.image_url && (
                <div className="relative aspect-[16/9] overflow-hidden bg-cream-100">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {offer.badge_text && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rosegold-600 to-blush-600 text-white shadow-xs">
                      {offer.badge_text}
                    </span>
                  )}
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-rosegold-700 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {offer.discount_type === 'percentage'
                        ? `${offer.discount_value}% OFF`
                        : `Flat ₹${offer.discount_value} OFF`}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-charcoal-900 group-hover:text-rosegold-600 transition-colors">
                    {offer.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-cream-200">
                  {offer.promo_code && (
                    <div className="flex justify-between items-center bg-cream-50 p-2.5 rounded-xl border border-dashed border-rosegold-300">
                      <div className="text-xs">
                        <span className="text-charcoal-500 block text-[10px] uppercase font-bold">
                          Promo Code
                        </span>
                        <span className="font-mono font-bold text-rosegold-700">{offer.promo_code}</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(offer.promo_code!)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-rosegold-200 text-charcoal-700 hover:text-rosegold-700 flex items-center gap-1 shadow-2xs"
                      >
                        {copiedCode === offer.promo_code ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rosegold-400" /> Valid until {offer.valid_until}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/book')}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-semibold text-xs sm:text-sm shadow-rose transition-all text-center block"
                  >
                    Claim Offer & Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

