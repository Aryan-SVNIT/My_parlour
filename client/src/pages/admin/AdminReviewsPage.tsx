import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, Star, Trash2, X } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Review } from '../../types';

export const AdminReviewsPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await adminApi.getReviews();
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id: string) => {
    try {
      await adminApi.toggleReviewApproval(id);
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminApi.deleteReview(id);
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Reviews & Testimonials"
        subtitle="Moderate client feedback, approve ratings, and feature top testimonials"
        onOpenMobileMenu={openMobileMenu}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      rev.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rev.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                <p className="text-xs text-charcoal-700 italic leading-relaxed">"{rev.comment}"</p>
              </div>

              <div className="border-t border-cream-200 pt-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-charcoal-900">{rev.customer_name}</p>
                  {rev.service_name && (
                    <span className="text-[10px] text-rosegold-700 block">{rev.service_name}</span>
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleApprove(rev.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      rev.is_approved
                        ? 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {rev.is_approved ? 'Hide' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

