import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Mail, Phone, Search, User, X } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Customer } from '../../types';

export const AdminCustomersPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers(search || undefined);
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openCustomerDrawer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setNotes(cust.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    setIsSavingNotes(true);
    try {
      await adminApi.updateCustomer(selectedCustomer.id, { notes });
      setSelectedCustomer({ ...selectedCustomer, notes });
      fetchCustomers();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Customer Directory"
        subtitle="Track client loyalty, visits, total expenditure, and personal notes"
        onOpenMobileMenu={openMobileMenu}
      />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="bg-white rounded-3xl p-5 border border-rosegold-100 shadow-soft flex justify-between items-center">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-rosegold-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, mobile number, or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-rosegold-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-rosegold-500"
            />
          </form>

          <span className="text-xs text-charcoal-500 font-medium">
            Total {customers.length} registered clients
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-200 text-charcoal-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Client Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Visits</th>
                  <th className="py-3 px-3">Total Spend</th>
                  <th className="py-3 px-3">Client Notes</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openCustomerDrawer(c)}
                    className="hover:bg-cream-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-charcoal-900">{c.full_name}</div>
                      <span className="text-[10px] text-charcoal-400">
                        Joined {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-charcoal-900">{c.phone}</div>
                      {c.email && <div className="text-[10px] text-charcoal-400">{c.email}</div>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-cream-100 text-charcoal-800 font-bold">
                        {c.visit_count} visit(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-serif font-bold text-rosegold-700 text-sm">
                      ₹{c.total_spend}
                    </td>
                    <td className="py-3.5 px-3 text-charcoal-600 max-w-xs truncate italic">
                      {c.notes || 'No notes added'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openCustomerDrawer(c)}
                        className="text-rosegold-700 hover:text-rosegold-900 font-semibold underline text-xs"
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rosegold-100 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream-100 text-charcoal-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs uppercase font-bold text-rosegold-600 tracking-wider">
                Client Profile
              </span>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900">
                {selectedCustomer.full_name}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-cream-50 p-4 rounded-2xl border border-rosegold-100 text-xs">
              <div>
                <span className="text-charcoal-400 block font-semibold uppercase">Phone</span>
                <span className="font-bold text-charcoal-900">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-charcoal-400 block font-semibold uppercase">Email</span>
                <span className="font-bold text-charcoal-900">{selectedCustomer.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-charcoal-400 block font-semibold uppercase">Total Visits</span>
                <span className="font-bold text-charcoal-900">{selectedCustomer.visit_count}</span>
              </div>
              <div>
                <span className="text-charcoal-400 block font-semibold uppercase">Lifetime Value</span>
                <span className="font-serif font-bold text-rosegold-700 text-sm">₹{selectedCustomer.total_spend}</span>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Personalized Notes & Preferences
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefers herbal bleach, sensitive scalp, drinks black coffee..."
                className="w-full p-3 rounded-xl border border-rosegold-200 text-xs"
              ></textarea>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-4 py-1.5 bg-rosegold-600 hover:bg-rosegold-700 text-white rounded-xl text-xs font-semibold"
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Booking History */}
            <div>
              <h3 className="text-xs uppercase font-bold text-charcoal-500 tracking-wider mb-2">
                Booking History ({selectedCustomer.appointments?.length || 0})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCustomer.appointments?.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl border border-cream-200 text-xs flex justify-between items-center bg-white"
                  >
                    <div>
                      <span className="font-mono font-bold text-rosegold-700 block">{apt.booking_id}</span>
                      <span className="text-charcoal-500 text-[11px]">
                        {apt.appointment_date} at {apt.start_time}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif font-bold text-charcoal-900 block">₹{apt.total_amount}</span>
                      <span className="text-[10px] font-bold uppercase text-emerald-700">{apt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
