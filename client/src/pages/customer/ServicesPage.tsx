import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Filter, Plus, Search, Sparkles } from 'lucide-react';
import { publicApi } from '../../api/client';
import { Service, ServiceCategory } from '../../types';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Initialize from URL params if present
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setSelectedCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await publicApi.getCategories();
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const res = await publicApi.getServices({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery || undefined,
        });
        if (res.data.success) {
          setServices(res.data.services);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadServices();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  const handleBookService = (serviceId: string) => {
    navigate(`/book?service=${serviceId}`);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
          Menu of Radiance
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-charcoal-900">
          Our Services & Treatments
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 font-light leading-relaxed">
          From everyday essential grooming to bridal transformations, explore our transparent pricing and book your appointment online.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-6">
        {/* Search Input */}
        <div className="max-w-md mx-auto relative">
          <Search className="w-5 h-5 text-rosegold-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search treatments (e.g. Facial, Keratin, Waxing)..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 bg-white text-sm shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-xs text-charcoal-400 hover:text-charcoal-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-rosegold-600 text-white shadow-rose'
                : 'bg-white hover:bg-cream-100 text-charcoal-700 border border-rosegold-200'
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-rosegold-600 text-white shadow-rose'
                  : 'bg-white hover:bg-cream-100 text-charcoal-700 border border-rosegold-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-rosegold-200 border-t-rosegold-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-charcoal-500 font-medium">Loading beauty services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center max-w-lg mx-auto border border-rosegold-100 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rosegold-50 text-rosegold-600 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-charcoal-900">No Services Found</h3>
          <p className="text-sm text-charcoal-600">
            We couldn't find any services matching "{searchQuery}". Try searching with different keywords or switch categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleCategoryChange('all');
            }}
            className="px-6 py-2.5 rounded-full bg-rosegold-600 text-white text-xs font-semibold shadow-xs hover:bg-rosegold-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg border border-rosegold-100 transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-cream-100">
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {service.is_popular && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                      Popular
                    </span>
                  )}
                  {service.is_featured && !service.is_popular && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rosegold-600 text-white shadow-xs">
                      Featured
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 bg-charcoal-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-rosegold-300" />
                  <span>{service.duration_minutes} mins</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-charcoal-900 group-hover:text-rosegold-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 line-clamp-3 leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-charcoal-400 block font-medium">Price</span>
                    <span className="font-serif text-2xl font-bold text-rosegold-700">₹{service.price}</span>
                  </div>

                  <button
                    onClick={() => handleBookService(service.id)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-rose transition-all flex items-center gap-1.5 transform active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
