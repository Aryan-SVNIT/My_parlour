import React, { useEffect, useState } from 'react';
import { Check, Clock, Plus, X } from 'lucide-react';
import { adminApi } from '../../api/client';
import { Service, Staff } from '../../types';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalkInModal: React.FC<WalkInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [staffId, setStaffId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'pay_at_parlour'>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [adminNotes, setAdminNotes] = useState('Walk-in booking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const [srvRes, stfRes] = await Promise.all([adminApi.getServices(), adminApi.getStaff()]);
        if (srvRes.data.success) setServices(srvRes.data.services);
        if (stfRes.data.success) {
          setStaffList(stfRes.data.staff);
          if (stfRes.data.staff.length > 0) setStaffId(stfRes.data.staff[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      setError('Please select at least one service.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminApi.createManualAppointment({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        service_ids: selectedServiceIds,
        appointment_date: appointmentDate,
        start_time: startTime,
        staff_id: staffId || undefined,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        admin_notes: adminNotes,
        status: 'confirmed',
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-rosegold-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream-100 text-charcoal-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-1">
          Add Walk-in / Phone Booking
        </h2>
        <p className="text-xs text-charcoal-500 mb-6">
          Manually register a client who booked over the phone or walked in directly.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Client Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2 rounded-xl border border-rosegold-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10-digit number"
                className="w-full px-3.5 py-2 rounded-xl border border-rosegold-200 text-xs"
              />
            </div>
          </div>

          {/* Service Selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Select Services ({selectedServiceIds.length}) *
              </label>
              <span className="text-xs font-bold text-rosegold-700">
                Total: ₹{totalAmount} ({totalDuration} mins)
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto border border-cream-300 rounded-xl p-2 space-y-1 bg-cream-50">
              {services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv.id)}
                    className={`flex justify-between items-center p-2 rounded-lg text-xs cursor-pointer ${
                      isSelected ? 'bg-rosegold-600 text-white font-medium' : 'hover:bg-white text-charcoal-800'
                    }`}
                  >
                    <span>{srv.name}</span>
                    <span className="font-bold">₹{srv.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Assign Staff
              </label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs bg-white"
              >
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs bg-white"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI / QR Code</option>
                <option value="pay_at_parlour">Pay Later</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs bg-white"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
              Internal Admin Notes
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. VIP client, preferred shampoo"
              className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-cream-100 text-charcoal-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-rosegold-600 hover:bg-rosegold-700 text-white text-xs font-bold shadow-xs"
            >
              {loading ? 'Creating...' : 'Save Walk-in Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

