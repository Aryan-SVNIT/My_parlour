import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Filter, Plus, Search } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AppointmentModal } from '../../components/admin/AppointmentModal';
import { WalkInModal } from '../../components/admin/WalkInModal';
import { Appointment, Staff } from '../../types';

export const AdminAppointmentsPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [aptRes, stfRes] = await Promise.all([
        adminApi.getAppointments({
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          date: selectedDate || undefined,
          search: searchQuery || undefined,
        }),
        adminApi.getStaff(),
      ]);

      if (aptRes.data.success) setAppointments(aptRes.data.appointments);
      if (stfRes.data.success) setStaffList(stfRes.data.staff);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus, selectedDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-100 text-rose-800">Declined</span>;
      default:
        return <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800">Pending</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Appointments Manager"
        subtitle="View, confirm, reschedule, and manage client bookings"
        onOpenMobileMenu={openMobileMenu}
        onQuickAction={() => setIsWalkInOpen(true)}
        quickActionLabel="+ Add Walk-in"
      />

      <div className="p-6 space-y-6">
        {/* Filters bar */}
        <div className="bg-white rounded-3xl p-5 border border-rosegold-100 shadow-soft flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-rosegold-600 text-white shadow-xs'
                    : 'bg-cream-100 hover:bg-cream-200 text-charcoal-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Date & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-rosegold-200 text-xs bg-white font-medium"
              />
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-[11px] text-rosegold-700 underline font-semibold"
              >
                Clear Date
              </button>
            )}

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-rosegold-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or ID..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-rosegold-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
              />
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft">
          {loading ? (
            <div className="py-20 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-rosegold-200 border-t-rosegold-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-charcoal-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-16 text-center text-charcoal-500 text-xs space-y-2">
              <p className="font-semibold text-charcoal-800 text-sm">No appointments found</p>
              <p>Try clearing filters or search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cream-200 text-charcoal-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Booking ID</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Booked Services</th>
                    <th className="py-3 px-3">Assigned Staff</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {appointments.map((apt) => (
                    <tr
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="hover:bg-cream-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-rosegold-700">
                        {apt.booking_id}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-charcoal-900">
                        <div>{apt.appointment_date}</div>
                        <span className="text-[11px] text-charcoal-500">{apt.start_time} - {apt.end_time}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-charcoal-900">{apt.customer_name}</div>
                        <span className="text-[10px] text-charcoal-400">{apt.customer_phone}</span>
                      </td>
                      <td className="py-3.5 px-3 text-charcoal-700 max-w-xs truncate">
                        {apt.services?.map((s) => s.service_name).join(', ') || 'N/A'}
                      </td>
                      <td className="py-3.5 px-3 text-charcoal-600">
                        {apt.staff?.name || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-3 font-serif font-bold text-charcoal-900">
                        ₹{apt.total_amount}
                      </td>
                      <td className="py-3.5 px-3 uppercase text-[10px] font-semibold">
                        <span className={apt.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}>
                          {apt.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">{getStatusBadge(apt.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onSuccess={fetchAppointments}
      />

      <AppointmentModal
        appointment={selectedAppointment}
        staffList={staffList}
        onClose={() => setSelectedAppointment(null)}
        onUpdated={fetchAppointments}
      />
    </div>
  );
};

