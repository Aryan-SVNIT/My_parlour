import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { GalleryItem } from '../../types';

export const AdminGalleryPage: React.FC = () => {
  const { openMobileMenu } = useOutletContext<{ openMobileMenu: () => void }>();

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Salon Interior');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  const categories = ['Salon Interior', 'Hair Styling', 'Makeup', 'Skincare', 'Bridal Looks'];

  const fetchGallery = async () => {
    try {
      const res = await adminApi.getGallery();
      if (res.data.success) {
        setGallery(res.data.gallery);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createGalleryItem({
        title,
        category,
        image_url: imageUrl,
        description,
      });
      setIsModalOpen(false);
      setTitle('');
      setImageUrl('');
      setDescription('');
      fetchGallery();
    } catch (e) {
      console.error(e);
      alert('Failed to add image.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this photo from the gallery?')) return;
    try {
      await adminApi.deleteGalleryItem(id);
      fetchGallery();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Salon Gallery Manager"
        subtitle="Add makeover photos, salon interior glimpses, and organize by categories"
        onOpenMobileMenu={openMobileMenu}
        onQuickAction={() => setIsModalOpen(true)}
        quickActionLabel="+ Add New Photo"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-rosegold-100 shadow-soft flex flex-col group"
            >
              <div className="aspect-square bg-cream-100 relative overflow-hidden">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-charcoal-900/60 hover:bg-rose-600 text-white transition-colors"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-charcoal-900/70 text-white uppercase">
                  {item.category}
                </span>
              </div>
              <div className="p-3">
                <h4 className="font-serif font-bold text-xs text-charcoal-900 truncate">{item.title}</h4>
                {item.description && (
                  <p className="text-[10px] text-charcoal-500 truncate mt-0.5">{item.description}</p>
                )}
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
              Add Photo to Gallery
            </h3>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Traditional Red Bridal Makeover"
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">High-Res Image URL *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Caption / Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief note about the look or styling technique..."
                  className="w-full px-3 py-2 rounded-xl border border-rosegold-200"
                />
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
                  Publish Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
