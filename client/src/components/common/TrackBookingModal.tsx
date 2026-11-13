import React, { useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, MapPin, Search, User, X } from 'lucide-react';
import { publicApi } from '../../api/client';
import { Appointment, AppointmentService, Staff } from '../../types';

interface TrackBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackBookingModal: React.FC<TrackBookingModalProps> = ({ isOpen, onClose }) => {
  const [bookingId, setBookingId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<AppointmentService[]>([]);
  const [staff, setStaff] = useState<Staff | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim()) {
      setError('Please enter your Booking ID.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAppointment(null);
    setCancelSuccessMsg(null);

    try {
      const res = await publicApi.trackBooking(bookingId.trim(), phone.trim() || undefined);
      if (res.data.success) {
        setAppointment(res.data.appointment);
        setServices(res.data.services || []);
        setStaff(res.data.staff || null);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Could not find booking. Please check your Booking ID and mobile number.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    setIsCancelling(true);
    setError(null);

    try {
      const res = await publicApi.cancelBooking({
        booking_id: appointment.booking_id,
        phone: appointment.customer_phone,
        reason: cancelReason,
      });

      if (res.data.success) {
        setCancelSuccessMsg('Appointment cancelled successfully.');
        setAppointment(res.data.appointment);
        setShowCancelPrompt(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Confirmed</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">Cancelled</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Declined</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Pending Confirmation</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rosegold-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream-100 text-charcoal-700 hover:text-charcoal-900 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-rosegold-100 text-rosegold-700 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">Track Your Appointment</h2>
          <p className="text-sm text-charcoal-600 mt-1">
            Check live confirmation status, reschedule, or cancel your booking
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
              Booking ID *
            </label>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value.toUpperCase())}
              placeholder="e.g. ASH-2026-7841"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm font-medium uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
              Registered Mobile Number (for verification)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-semibold text-sm shadow-rose transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Searching...' : 'Check Status'}
          </button>
        </form>

        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {cancelSuccessMsg && (
          <div className="p-3.5 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{cancelSuccessMsg}</span>
          </div>
        )}

        {/* Appointment Card Result */}
        {appointment && (
          <div className="bg-cream-50 rounded-2xl p-5 border border-rosegold-200 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start gap-2 border-b border-rosegold-100 pb-3">
              <div>
                <span className="text-xs uppercase font-bold text-rosegold-600 tracking-wider">
                  Booking Reference
                </span>
                <p className="font-serif text-xl font-bold text-charcoal-900">{appointment.booking_id}</p>
              </div>
              {getStatusBadge(appointment.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rosegold-600" />
                <span className="font-medium text-charcoal-800">{appointment.appointment_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rosegold-600" />
                <span className="font-medium text-charcoal-800">
                  {appointment.start_time} - {appointment.end_time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-rosegold-600" />
                <span className="text-charcoal-700 truncate">{appointment.customer_name}</span>
              </div>
              <div>
                <span className="text-xs text-charcoal-500">Duration: </span>
                <span className="font-medium text-charcoal-800">{appointment.total_duration_minutes} mins</span>
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="text-xs font-semibold uppercase text-charcoal-500 tracking-wider mb-1.5">
                Booked Services
              </p>
              <div className="space-y-1">
                {services.map((s) => (
                  <div key={s.id} className="flex justify-between text-xs py-1 border-b border-cream-200">
                    <span className="text-charcoal-800 font-medium">{s.service_name}</span>
                    <span className="text-rosegold-700 font-semibold">₹{s.price_at_booking}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 text-sm font-bold text-charcoal-900">
                <span>Total Amount:</span>
                <span className="text-base text-rosegold-700">₹{appointment.total_amount}</span>
              </div>
            </div>

            {/* Cancel Action */}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <div className="pt-2 border-t border-rosegold-100">
                {!showCancelPrompt ? (
                  <button
                    onClick={() => setShowCancelPrompt(true)}
                    className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Request Cancellation
                  </button>
                ) : (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-rose-200">
                    <p className="text-xs font-semibold text-charcoal-800">
                      Are you sure you want to cancel this appointment?
                    </p>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancellation (optional)"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-rosegold-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                      </button>
                      <button
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-3 py-1.5 bg-cream-100 text-charcoal-700 rounded-lg text-xs font-semibold"
                      >
                        Keep Booking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

