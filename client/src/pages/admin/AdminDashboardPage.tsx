import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Scissors,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AppointmentModal } from '../../components/admin/AppointmentModal';
import { WalkInModal } from '../../components/admin/WalkInModal';
import { Appointment, Staff } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Modals
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, staffRes] = await Promise.all([adminApi.getStats(), adminApi.getStaff()]);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (staffRes.data.success) {
        setStaffList(staffRes.data.staff);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickStatus = async (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await adminApi.updateAppointmentStatus(id, { status });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
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
        title="Dashboard Overview"
        subtitle={`Live parlour statistics & schedule for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        onOpenMobileMenu={openMobileMenu}
        onQuickAction={() => setIsWalkInOpen(true)}
        quickActionLabel="+ Walk-in Booking"
      />

      <div className="p-6 space-y-8">
        {loading || !stats ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-rosegold-200 border-t-rosegold-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-charcoal-500 font-medium">Gathering live parlour metrics...</p>
          </div>
        ) : (
          <>
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-3xl border border-rosegold-100 shadow-soft space-y-2">
                <div className="flex justify-between items-center text-charcoal-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Today's Bookings</span>
                  <div className="w-8 h-8 rounded-xl bg-rosegold-100 text-rosegold-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-extrabold text-charcoal-900">{stats.totalToday}</span>
                  <span className="text-xs font-semibold text-amber-600">{stats.pendingCount} pending</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-rosegold-100 shadow-soft space-y-2">
                <div className="flex justify-between items-center text-charcoal-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-extrabold text-emerald-600">₹{stats.todayRevenue}</span>
                  <span className="text-xs text-charcoal-400">estimated</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-rosegold-100 shadow-soft space-y-2">
                <div className="flex justify-between items-center text-charcoal-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Monthly Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-rosegold-100 text-rosegold-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-extrabold text-charcoal-900">₹{stats.monthRevenue}</span>
                  <span className="text-xs text-charcoal-400">this month</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-rosegold-100 shadow-soft space-y-2">
                <div className="flex justify-between items-center text-charcoal-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Clients</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-extrabold text-charcoal-900">{stats.totalCustomers}</span>
                  <span className="text-xs text-emerald-600 font-medium">registered</span>
                </div>
              </div>
            </div>

            {/* Today's Schedule Table */}
            <div className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-xl font-bold text-charcoal-900">
                    Today's Appointment Schedule ({stats.todayAppointments.length})
                  </h2>
                  <p className="text-xs text-charcoal-500">Click any row to view full details or reschedule</p>
                </div>
                <Link
                  to="/admin/appointments"
                  className="text-xs font-semibold text-rosegold-700 hover:text-rosegold-900 underline"
                >
                  View All Appointments →
                </Link>
              </div>

              {stats.todayAppointments.length === 0 ? (
                <div className="py-12 text-center text-charcoal-500 text-xs">
                  No appointments scheduled for today yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-cream-200 text-charcoal-500 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-3">Time</th>
                        <th className="py-3 px-3">Booking ID</th>
                        <th className="py-3 px-3">Client</th>
                        <th className="py-3 px-3">Services</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {stats.todayAppointments.map((apt: any) => (
                        <tr
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className="hover:bg-cream-50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 font-bold text-charcoal-900">
                            {apt.start_time} - {apt.end_time}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-rosegold-700">
                            {apt.booking_id}
                          </td>
                          <td className="py-3 px-3 font-medium text-charcoal-900">
                            <div>{apt.customer_name}</div>
                            <span className="text-[10px] text-charcoal-400">{apt.customer_phone}</span>
                          </td>
                          <td className="py-3 px-3 text-charcoal-600 max-w-xs truncate">
                            {apt.services.map((s: any) => s.service_name).join(', ')}
                          </td>
                          <td className="py-3 px-3 font-serif font-bold text-charcoal-900">
                            ₹{apt.total_amount}
                          </td>
                          <td className="py-3 px-3">{getStatusBadge(apt.status)}</td>
                          <td className="py-3 px-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            {apt.status === 'pending' && (
                              <button
                                onClick={(e) => handleQuickStatus(apt.id, 'confirmed', e)}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold"
                              >
                                Confirm
                              </button>
                            )}
                            {apt.status === 'confirmed' && (
                              <button
                                onClick={(e) => handleQuickStatus(apt.id, 'completed', e)}
                                className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-[10px] font-bold"
                              >
                                Mark Done
                              </button>
                            )}
                            {apt.status !== 'cancelled' && (
                              <button
                                onClick={(e) => handleQuickStatus(apt.id, 'cancelled', e)}
                                className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px]"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 7-Day Revenue & Appointments Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-rosegold-100 shadow-soft space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-bold text-charcoal-900">
                    Revenue & Bookings Trend (Last 7 Days)
                  </h3>
                  <span className="text-xs text-charcoal-500 font-medium">Daily Performance</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0e6dc" />
                      <XAxis dataKey="day" stroke="#715342" fontSize={11} />
                      <YAxis stroke="#715342" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #dfbeb5',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="revenue" fill="#b76e79" name="Revenue (₹)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="bookings" fill="#df2457" name="Appointments" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Popular Treatments */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-rosegold-100 shadow-soft space-y-4">
                <h3 className="font-serif text-lg font-bold text-charcoal-900">
                  Most Booked Treatments
                </h3>
                <div className="space-y-3">
                  {stats.popularServices.map((srv: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-cream-100 last:border-0">
                      <div>
                        <p className="font-semibold text-charcoal-900">{srv.name}</p>
                        <span className="text-[10px] text-charcoal-400">{srv.count} bookings</span>
                      </div>
                      <span className="font-serif font-bold text-rosegold-700">₹{srv.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onSuccess={fetchDashboardData}
      />

      <AppointmentModal
        appointment={selectedAppointment}
        staffList={staffList}
        onClose={() => setSelectedAppointment(null)}
        onUpdated={fetchDashboardData}
      />
    </div>
  );
};

