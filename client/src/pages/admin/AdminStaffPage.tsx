import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Edit, Plus, Trash2, User, UserCheck, X } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Staff } from '../../types';

export const AdminStaffPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchStaff = async () => {
    try {
      const res = await adminApi.getStaff();
      if (res.data.success) {
        setStaffList(res.data.staff);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setName('');
    setRole('Stylist & Hair Artist');
    setPhone('');
    setEmail('');
    setAvatarUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (st: Staff) => {
    setEditingStaff(st);
    setName(st.name);
    setRole(st.role);
    setPhone(st.phone);
    setEmail(st.email || '');
    setAvatarUrl(st.avatar_url || '');
    setIsActive(st.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        role,
        phone,
        email,
        avatar_url: avatarUrl,
        is_active: isActive,
      };

      if (editingStaff) {
        await adminApi.updateStaff(editingStaff.id, payload);
      } else {
        await adminApi.createStaff(payload);
      }

      setIsModalOpen(false);
      fetchStaff();
    } catch (e) {
      console.error(e);
      alert('Failed to save staff member.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await adminApi.deleteStaff(id);
      fetchStaff();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Staff & Aesthetician Management"
        subtitle="Manage parlour team members, contact numbers, and appointment assignments"
        onOpenMobileMenu={openMobileMenu}
        onQuickAction={openAddModal}
        quickActionLabel="+ Add Staff Member"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={st.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                  alt={st.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-rosegold-200"
                />
                <div>
                  <h3 className="font-serif font-bold text-lg text-charcoal-900">{st.name}</h3>
                  <p className="text-xs text-rosegold-700 font-semibold">{st.role}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                      st.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-cream-200 text-charcoal-500'
                    }`}
                  >
                    {st.is_active ? 'Active' : 'On Leave'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-charcoal-600 border-t border-cream-200 pt-3">
                <p>Phone: <strong className="text-charcoal-800">{st.phone}</strong></p>
                {st.email && <p>Email: <span className="text-charcoal-800">{st.email}</span></p>}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-cream-100">
                <button
                  onClick={() => openEditModal(st)}
                  className="p-2 text-charcoal-700 hover:text-rosegold-700 hover:bg-cream-100 rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(st.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rosegold-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-4">
              {editingStaff ? 'Edit Staff Profile' : 'Add Staff Member'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Role / Designation *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Master Stylist, Makeup Artist"
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Photo URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-rosegold-600"
                  />
                  <span>Active & Available for Bookings</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rosegold-600 text-white rounded-xl font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
