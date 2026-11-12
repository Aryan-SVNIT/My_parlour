import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, Edit, Plus, Scissors, Trash2, X } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Service, ServiceCategory } from '../../types';

export const AdminServicesPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Service Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState<number>(499);
  const [formDuration, setFormDuration] = useState<number>(30);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsPopular, setFormIsPopular] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  // Category Modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchServices = async () => {
    try {
      const res = await adminApi.getServices();
      if (res.data.success) {
        setServices(res.data.services);
        setCategories(res.data.categories);
        if (res.data.categories.length > 0 && !formCategoryId) {
          setFormCategoryId(res.data.categories[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddService = () => {
    setEditingService(null);
    setFormName('');
    setFormPrice(499);
    setFormDuration(30);
    setFormDescription('');
    setFormImageUrl('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80');
    setFormIsFeatured(false);
    setFormIsPopular(false);
    setFormIsActive(true);
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setIsServiceModalOpen(true);
  };

  const openEditService = (srv: Service) => {
    setEditingService(srv);
    setFormName(srv.name);
    setFormCategoryId(srv.category_id);
    setFormPrice(srv.price);
    setFormDuration(srv.duration_minutes);
    setFormDescription(srv.description);
    setFormImageUrl(srv.image_url);
    setFormIsFeatured(srv.is_featured);
    setFormIsPopular(srv.is_popular);
    setFormIsActive(srv.is_active);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formName,
        category_id: formCategoryId,
        price: formPrice,
        duration_minutes: formDuration,
        description: formDescription,
        image_url: formImageUrl,
        is_featured: formIsFeatured,
        is_popular: formIsPopular,
        is_active: formIsActive,
      };

      if (editingService) {
        await adminApi.updateService(editingService.id, payload);
      } else {
        await adminApi.createService(payload);
      }

      setIsServiceModalOpen(false);
      fetchServices();
    } catch (e) {
      console.error(e);
      alert('Failed to save service.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service permanently?')) return;
    try {
      await adminApi.deleteService(id);
      fetchServices();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCategory({ name: newCatName, description: newCatDesc });
      setIsCatModalOpen(false);
      setNewCatName('');
      setNewCatDesc('');
      fetchServices();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category_id === selectedCategory);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Services & Treatments Menu"
        subtitle="Manage services, prices, durations, categories, and photographs"
        onOpenMobileMenu={openMobileMenu}
        onQuickAction={openAddService}
        quickActionLabel="+ Add New Service"
      />

      <div className="p-6 space-y-6">
        {/* Category bar */}
        <div className="bg-white rounded-3xl p-5 border border-rosegold-100 shadow-soft flex justify-between items-center gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-rosegold-600 text-white'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              All Categories ({services.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-rosegold-600 text-white'
                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCatModalOpen(true)}
            className="text-xs font-semibold text-rosegold-700 hover:text-rosegold-900 underline whitespace-nowrap"
          >
            + Add Category
          </button>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-3xl p-6 border border-rosegold-100 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-200 text-charcoal-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Badges</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {filteredServices.map((srv) => {
                  const cat = categories.find((c) => c.id === srv.category_id);
                  return (
                    <tr key={srv.id} className="hover:bg-cream-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={srv.image_url}
                            alt={srv.name}
                            className="w-10 h-10 rounded-xl object-cover border border-rosegold-100"
                          />
                          <div>
                            <span className="font-bold text-charcoal-900 block">{srv.name}</span>
                            <span className="text-[10px] text-charcoal-400 line-clamp-1 max-w-xs font-light">
                              {srv.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-charcoal-600 font-medium">{cat?.name || 'Unassigned'}</td>
                      <td className="py-3 px-3 font-serif font-bold text-rosegold-700 text-sm">
                        ₹{srv.price}
                      </td>
                      <td className="py-3 px-3 text-charcoal-700">{srv.duration_minutes} mins</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            srv.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-cream-200 text-charcoal-500'
                          }`}
                        >
                          {srv.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-3 space-x-1">
                        {srv.is_popular && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-rose-100 text-rose-700">
                            Popular
                          </span>
                        )}
                        {srv.is_featured && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-rosegold-100 text-rosegold-800">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => openEditService(srv)}
                          className="p-1.5 text-charcoal-600 hover:text-rosegold-700 hover:bg-cream-100 rounded-lg"
                          title="Edit Service"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rosegold-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-cream-100 text-charcoal-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 24K Gold Luxury Facial"
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                    Duration (Mins) *
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rosegold-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe treatment procedure, benefits, and results..."
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold uppercase text-charcoal-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPopular}
                    onChange={(e) => setFormIsPopular(e.target.checked)}
                    className="rounded text-rosegold-600"
                  />
                  <span>Popular Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded text-rosegold-600"
                  />
                  <span>Featured Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-rosegold-600"
                  />
                  <span>Active on Website</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-cream-100 text-charcoal-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rosegold-600 hover:bg-rosegold-700 text-white font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rosegold-100 relative">
            <button
              onClick={() => setIsCatModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-3">Add Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Nail Art & Extensions"
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short summary"
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rosegold-600 text-white rounded-xl font-bold"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
