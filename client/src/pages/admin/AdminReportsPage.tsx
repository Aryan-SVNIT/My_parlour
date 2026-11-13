import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';

export const AdminReportsPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await adminApi.getReports();
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCsv = () => {
    window.open(adminApi.exportCsvUrl, '_blank');
  };

  if (loading || !reports) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Reports & Financial Analytics" onOpenMobileMenu={openMobileMenu} />
        <div className="p-12 text-center text-xs text-charcoal-500">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Reports & Financial Analytics"
        subtitle="Revenue metrics, appointment completion performance, and CSV exports"
        onOpenMobileMenu={openMobileMenu}
        onQuickAction={handleExportCsv}
        quickActionLabel="Export CSV Data"
      />

      <div className="p-6 space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-3xl border border-rosegold-100 shadow-soft">
            <span className="text-xs text-charcoal-500 font-bold uppercase tracking-wider block mb-1">
              Total Revenue
            </span>
            <span className="font-serif text-3xl font-extrabold text-rosegold-700">
              ₹{reports.totalRevenue}
            </span>
            <p className="text-[11px] text-charcoal-400 mt-1">Confirmed & completed bookings</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-rosegold-100 shadow-soft">
            <span className="text-xs text-charcoal-500 font-bold uppercase tracking-wider block mb-1">
              Total Bookings
            </span>
            <span className="font-serif text-3xl font-extrabold text-charcoal-900">
              {reports.totalAppointments}
            </span>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {reports.completedAppointments} completed successfully
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-rosegold-100 shadow-soft">
            <span className="text-xs text-charcoal-500 font-bold uppercase tracking-wider block mb-1">
              Completion Rate
            </span>
            <span className="font-serif text-3xl font-extrabold text-emerald-600">
              {reports.totalAppointments > 0
                ? `${Math.round((reports.completedAppointments / reports.totalAppointments) * 100)}%`
                : '100%'}
            </span>
            <p className="text-[11px] text-charcoal-400 mt-1">Successful services</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-rosegold-100 shadow-soft">
            <span className="text-xs text-charcoal-500 font-bold uppercase tracking-wider block mb-1">
              Cancellation Rate
            </span>
            <span className="font-serif text-3xl font-extrabold text-rose-600">
              {reports.totalAppointments > 0
                ? `${Math.round((reports.cancelledAppointments / reports.totalAppointments) * 100)}%`
                : '0%'}
            </span>
            <p className="text-[11px] text-charcoal-400 mt-1">{reports.cancelledAppointments} cancellations</p>
          </div>
        </div>

        {/* CSV Export Card */}
        <div className="bg-gradient-to-r from-rosegold-700 to-blush-700 rounded-3xl p-6 sm:p-8 text-white shadow-soft flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Spreadsheet Export
            </div>
            <h3 className="font-serif text-2xl font-bold">Download Complete Appointments Data</h3>
            <p className="text-xs text-rosegold-100 max-w-xl font-light">
              Export an RFC-compliant CSV containing client names, phones, services, dates, exact duration, total amounts, and statuses for accounting and backup.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-6 py-3 rounded-full bg-white text-rosegold-800 font-bold text-xs sm:text-sm hover:bg-cream-100 shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Spreadsheet</span>
          </button>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft space-y-4">
          <h3 className="font-serif text-xl font-bold text-charcoal-900">
            Monthly Performance Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-200 text-charcoal-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Month</th>
                  <th className="py-3 px-3">Total Appointments</th>
                  <th className="py-3 px-3">Total Revenue</th>
                  <th className="py-3 px-3">Avg. Ticket Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {reports.monthlyReports.map((m: any) => (
                  <tr key={m.month} className="hover:bg-cream-50">
                    <td className="py-3 px-3 font-bold text-charcoal-900">{m.month}</td>
                    <td className="py-3 px-3 font-semibold text-charcoal-700">{m.bookings} bookings</td>
                    <td className="py-3 px-3 font-serif font-bold text-rosegold-700 text-sm">
                      ₹{m.revenue}
                    </td>
                    <td className="py-3 px-3 text-charcoal-600">
                      ₹{m.bookings > 0 ? Math.round(m.revenue / m.bookings) : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

