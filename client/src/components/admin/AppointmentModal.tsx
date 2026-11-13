import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../../api/client';
import { Appointment, Staff } from '../../types';

interface AppointmentModalProps {
  appointment: Appointment | null;
  staffList: Staff[];
  onClose: () => void;
  onUpdated: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  appointment,
  staffList,
  onClose,
  onUpdated,
}) => {
  if (!appointment) return null;

  const [status, setStatus] = useState(appointment.status);
  const [paymentStatus, setPaymentStatus] = useState(appointment.payment_status);
  const [adminNotes, setAdminNotes] = useState(appointment.admin_notes || '');
  const [staffId, setStaffId] = useState(appointment.staff_id || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(appointment.appointment_date);
  const [newTime, setNewTime] = useState(appointment.start_time);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await adminApi.updateAppointmentStatus(appointment.id, {
        status,
        payment_status: paymentStatus,
        admin_notes: adminNotes,
        staff_id: staffId || undefined,
      });
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to update appointment.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReschedule = async () => {
    setIsUpdating(true);
    try {
      await adminApi.rescheduleAppointment(appointment.id, {
        appointment_date: newDate,
        start_time: newTime,
      });
      onUpdated();
      setIsRescheduling(false);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to reschedule appointment.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this appointment record?')) return;
    try {
      await adminApi.deleteAppointment(appointment.id);
      onUpdated();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to delete appointment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-rosegold-100 relative max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream-100 text-charcoal-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase font-bold text-rosegold-600 tracking-wider">
              Booking Details
            </span>
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">
              {appointment.booking_id}
            </h2>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Delete Appointment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Client & Date Info */}
        <div className="bg-cream-50 p-4 rounded-2xl border border-rosegold-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-charcoal-400 block font-semibold uppercase">Client</span>
            <span className="font-bold text-charcoal-900 text-sm">{appointment.customer_name}</span>
          </div>
          <div>
            <span className="text-charcoal-400 block font-semibold uppercase">Phone</span>
            <a href={`tel:${appointment.customer_phone}`} className="font-bold text-rosegold-700 text-sm">
              {appointment.customer_phone}
            </a>
          </div>
          <div>
            <span className="text-charcoal-400 block font-semibold uppercase">Date</span>
            <span className="font-bold text-charcoal-900 text-sm">{appointment.appointment_date}</span>
          </div>
          <div>
            <span className="text-charcoal-400 block font-semibold uppercase">Time</span>
            <span className="font-bold text-charcoal-900 text-sm">{appointment.start_time} - {appointment.end_time}</span>
          </div>
        </div>

        {/* Services List */}
        <div>
          <h3 className="text-xs uppercase font-bold text-charcoal-500 tracking-wider mb-2">
            Reserved Services ({appointment.services?.length || 0})
          </h3>
          <div className="space-y-1.5 border border-cream-200 rounded-xl p-3 bg-white">
            {appointment.services?.map((s) => (
              <div key={s.id} className="flex justify-between text-xs py-1 border-b border-cream-100 last:border-0">
                <div>
                  <span className="font-semibold text-charcoal-900">{s.service_name}</span>
                  <span className="text-charcoal-400 ml-2">({s.duration_minutes}m)</span>
                </div>
                <span className="font-bold text-rosegold-700">₹{s.price_at_booking}</span>
              </div>
            ))}
            <div className="pt-2 flex justify-between text-sm font-bold border-t border-cream-200">
              <span>Total Price:</span>
              <span className="text-rosegold-700">₹{appointment.total_amount}</span>
            </div>
          </div>
        </div>

        {appointment.customer_notes && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Client Special Note:</strong> {appointment.customer_notes}
          </div>
        )}

        {/* Status & Assignment Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-cream-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
              Appointment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs bg-white font-medium"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs bg-white font-medium"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
              Assigned Staff
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs bg-white font-medium"
            >
              <option value="">Unassigned</option>
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
            Internal Staff / Admin Notes
          </label>
          <input
            type="text"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="e.g. VIP regular, customer requested late slot"
            className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs"
          />
        </div>

        {/* Reschedule Drawer */}
        {isRescheduling ? (
          <div className="bg-cream-100 p-4 rounded-2xl space-y-3 border border-rosegold-200">
            <h4 className="font-bold text-xs text-charcoal-900">Reschedule Appointment Slot</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-charcoal-600 block mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-charcoal-600 block mb-1">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReschedule}
                disabled={isUpdating}
                className="px-4 py-1.5 bg-rosegold-600 hover:bg-rosegold-700 text-white rounded-lg text-xs font-semibold"
              >
                Save New Time
              </button>
              <button
                onClick={() => setIsRescheduling(false)}
                className="px-4 py-1.5 bg-white text-charcoal-700 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsRescheduling(true)}
            className="text-xs text-rosegold-700 hover:text-rosegold-900 underline font-semibold"
          >
            Reschedule to different date / time slot
          </button>
        )}

        {/* Footer Actions */}
        <div className="pt-3 flex justify-end gap-3 border-t border-cream-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cream-100 text-charcoal-700 text-xs font-semibold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-6 py-2.5 rounded-xl bg-rosegold-600 hover:bg-rosegold-700 text-white text-xs font-bold shadow-xs"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

