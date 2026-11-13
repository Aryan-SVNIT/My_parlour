import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { BusinessHours, Holiday } from '../../types';

export const AdminBusinessHoursPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Holiday form
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayTitle, setHolidayTitle] = useState('');

  const fetchHoursAndHolidays = async () => {
    try {
      const res = await adminApi.getBusinessHours();
      if (res.data.success) {
        setHours(res.data.business_hours);
        setHolidays(res.data.holidays);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoursAndHolidays();
  }, []);

  const handleHourChange = (index: number, field: keyof BusinessHours, value: any) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
  };

  const handleSaveHours = async () => {
    try {
      const res = await adminApi.updateBusinessHours({ business_hours: hours });
      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update business hours.');
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayTitle) return;

    try {
      await adminApi.createHoliday({ holiday_date: holidayDate, title: holidayTitle });
      setHolidayDate('');
      setHolidayTitle('');
      fetchHoursAndHolidays();
    } catch (e) {
      console.error(e);
      alert('Failed to add holiday.');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await adminApi.deleteHoliday(id);
      fetchHoursAndHolidays();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Business Hours & Holidays"
        subtitle="Control parlour open/close timings, break hours, slot intervals, and holiday closures"
        onOpenMobileMenu={openMobileMenu}
      />

      <div className="p-6 space-y-8">
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Business hours updated! Customer appointment availability has updated automatically.</span>
          </div>
        )}

        {/* Weekly Hours Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif text-xl font-bold text-charcoal-900">
                Weekly Operating Schedule
              </h2>
              <p className="text-xs text-charcoal-500">
                Times set here automatically configure the customer slot booking system.
              </p>
            </div>
            <button
              onClick={handleSaveHours}
              className="px-6 py-2.5 rounded-full bg-rosegold-600 hover:bg-rosegold-700 text-white font-bold text-xs shadow-xs"
            >
              Save Working Hours
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-200 text-charcoal-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Day</th>
                  <th className="py-3 px-3">Closed?</th>
                  <th className="py-3 px-3">Opening Time</th>
                  <th className="py-3 px-3">Closing Time</th>
                  <th className="py-3 px-3">Break Start</th>
                  <th className="py-3 px-3">Break End</th>
                  <th className="py-3 px-3">Slot Interval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {hours.map((bh, idx) => (
                  <tr key={bh.id} className="hover:bg-cream-50">
                    <td className="py-3 px-3 font-bold text-charcoal-900">{bh.day_name}</td>
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={bh.is_closed}
                        onChange={(e) => handleHourChange(idx, 'is_closed', e.target.checked)}
                        className="rounded text-rosegold-600"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="time"
                        disabled={bh.is_closed}
                        value={bh.open_time}
                        onChange={(e) => handleHourChange(idx, 'open_time', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-rosegold-200 text-xs disabled:opacity-40"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="time"
                        disabled={bh.is_closed}
                        value={bh.close_time}
                        onChange={(e) => handleHourChange(idx, 'close_time', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-rosegold-200 text-xs disabled:opacity-40"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="time"
                        disabled={bh.is_closed}
                        value={bh.break_start || ''}
                        onChange={(e) => handleHourChange(idx, 'break_start', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-rosegold-200 text-xs disabled:opacity-40"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="time"
                        disabled={bh.is_closed}
                        value={bh.break_end || ''}
                        onChange={(e) => handleHourChange(idx, 'break_end', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-rosegold-200 text-xs disabled:opacity-40"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <select
                        disabled={bh.is_closed}
                        value={bh.slot_interval_minutes}
                        onChange={(e) => handleHourChange(idx, 'slot_interval_minutes', Number(e.target.value))}
                        className="px-2 py-1 rounded-lg border border-rosegold-200 text-xs bg-white disabled:opacity-40"
                      >
                        <option value={15}>15 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Holidays & Special Closures */}
        <div className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-charcoal-900">
              Special Holidays & Closures
            </h2>
            <p className="text-xs text-charcoal-500">
              Appointments cannot be booked on these blocked dates.
            </p>
          </div>

          {/* Add Holiday Form */}
          <form onSubmit={handleAddHoliday} className="flex flex-col sm:flex-row gap-3 items-end bg-cream-50 p-4 rounded-2xl border border-rosegold-100">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-rosegold-200 text-xs bg-white"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Holiday Reason / Title *</label>
              <input
                type="text"
                required
                value={holidayTitle}
                onChange={(e) => setHolidayTitle(e.target.value)}
                placeholder="e.g. Diwali Festival Celebration"
                className="w-full px-3 py-2 rounded-xl border border-rosegold-200 text-xs bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-rosegold-600 hover:bg-rosegold-700 text-white font-bold text-xs"
            >
              Add Holiday
            </button>
          </form>

          {/* List of holidays */}
          <div className="space-y-2">
            {holidays.length === 0 ? (
              <p className="text-xs text-charcoal-500 italic">No scheduled holidays.</p>
            ) : (
              holidays.map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl border border-cream-200 text-xs flex justify-between items-center hover:bg-cream-50"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-rosegold-600" />
                    <span className="font-bold text-charcoal-900">{h.holiday_date}</span>
                    <span className="text-charcoal-600 font-medium">— {h.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Remove Holiday"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

