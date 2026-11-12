import React, { useEffect, useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { publicApi } from '../../api/client';
import { GalleryItem } from '../../types';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const categories = ['all', 'Salon Interior', 'Hair Styling', 'Makeup', 'Skincare', 'Bridal Looks'];

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const res = await publicApi.getGallery(selectedCategory === 'all' ? undefined : selectedCategory);
        if (res.data.success) {
          setItems(res.data.gallery);
        }
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [selectedCategory]);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
          Artistry & Ambience
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-charcoal-900">
          Salon Gallery & Transformations
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 font-light leading-relaxed">
          Explore real client makeovers, relaxing interior spaces, and our passionate team at work.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-rosegold-600 text-white shadow-rose'
                : 'bg-white hover:bg-cream-100 text-charcoal-700 border border-rosegold-200'
            }`}
          >
            {cat === 'all' ? 'All Photos' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-rosegold-200 border-t-rosegold-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-charcoal-500">Loading gallery...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-rosegold-100 space-y-3">
          <Camera className="w-12 h-12 text-rosegold-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-charcoal-900">No Photos In This Category</h3>
          <p className="text-xs text-charcoal-500">Please choose another category or view All Photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg border border-rosegold-100 cursor-pointer group transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-charcoal-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rosegold-300 block">
                    {item.category}
                  </span>
                  <h4 className="font-serif font-bold text-base">{item.title}</h4>
                  {item.description && <p className="text-xs text-nude-200 font-light mt-1 line-clamp-2">{item.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-charcoal-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-charcoal-900/60 hover:bg-charcoal-900 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-h-[70vh] bg-charcoal-950 overflow-hidden flex items-center justify-center">
              <img
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="w-full max-h-[70vh] object-contain"
              />
            </div>

            <div className="p-6 bg-white space-y-1">
              <span className="text-xs uppercase font-bold text-rosegold-600 tracking-wider">
                {activePhoto.category}
              </span>
              <h3 className="font-serif text-2xl font-bold text-charcoal-900">{activePhoto.title}</h3>
              {activePhoto.description && (
                <p className="text-sm text-charcoal-600 font-light leading-relaxed pt-1">
                  {activePhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
