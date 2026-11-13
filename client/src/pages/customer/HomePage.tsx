import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { publicApi } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { GalleryItem, Offer, Review, Service } from '../../types';

export const HomePage: React.FC = () => {
  const { settings, businessHours } = useSettings();
  const navigate = useNavigate();

  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [servicesRes, offersRes, reviewsRes, galleryRes] = await Promise.all([
          publicApi.getServices(),
          publicApi.getOffers(),
          publicApi.getReviews(),
          publicApi.getGallery(),
        ]);

        if (servicesRes.data.success) {
          const featured = servicesRes.data.services.filter((s: Service) => s.is_featured || s.is_popular);
          setFeaturedServices(featured.slice(0, 6));
        }
        if (offersRes.data.success) {
          setOffers(offersRes.data.offers.slice(0, 3));
        }
        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.reviews.slice(0, 3));
        }
        if (galleryRes.data.success) {
          setGallery(galleryRes.data.gallery.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to load home page content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleBookService = (serviceId: string) => {
    navigate(`/book?service=${serviceId}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 via-blush-50/40 to-cream-50 pt-8 pb-20 lg:pt-16 lg:pb-32">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-rosegold-200/30 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blush-200/30 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-rosegold-200 text-rosegold-700 text-xs sm:text-sm font-medium shadow-xs">
                <Sparkles className="w-4 h-4 text-rosegold-500 animate-pulse" />
                <span>Premier Luxury Beauty & Bridal Studio</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.15]">
                Reveal Your Inner Glow & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rosegold-600 via-blush-600 to-rosegold-700">Timeless Grace</span>
              </h1>

              <p className="text-base sm:text-lg text-charcoal-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Experience bespoke hair artistry, rejuvenating skin therapies, pain-free waxing, and royal bridal makeovers crafted exclusively for you in {settings.city}.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/book"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-semibold text-base shadow-rose hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment Online</span>
                </Link>

                <Link
                  to="/services"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-rosegold-50 text-charcoal-800 font-semibold text-base border border-rosegold-200 hover:border-rosegold-300 shadow-sm transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Explore All Services</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-rosegold-200/60 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-charcoal-900 text-base">4.9 / 5</span>
                  </div>
                  <p className="text-xs text-charcoal-600">500+ Verified Reviews</p>
                </div>
                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-rosegold-600 mb-1">
                    <ShieldCheck className="w-4 h-4 text-rosegold-600" />
                    <span className="font-bold text-charcoal-900 text-base">100% Safe</span>
                  </div>
                  <p className="text-xs text-charcoal-600">Sterilized & Hygienic</p>
                </div>
                <div>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-rosegold-600 mb-1">
                    <Award className="w-4 h-4 text-rosegold-600" />
                    <span className="font-bold text-charcoal-900 text-base">10+ Years</span>
                  </div>
                  <p className="text-xs text-charcoal-600">Certified Stylists</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80"
                    alt="Luxury Salon Experience"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent"></div>

                  <div className="absolute bottom-6 left-6 right-6 text-white p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30">
                    <p className="text-xs uppercase tracking-widest font-semibold text-blush-200">
                      Signature Experience
                    </p>
                    <p className="font-serif text-lg font-bold">O3+ Bridal Glow & Keratin Hair Spa</p>
                    <p className="text-xs text-nude-100 mt-1">Starting from only ₹499</p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-rosegold-100 flex items-center gap-3 animate-bounce">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 font-medium">Instant Booking</p>
                    <p className="text-sm font-bold text-charcoal-900">Zero Wait Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SPECIAL OFFERS BANNER */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-rosegold-700 via-blush-700 to-rosegold-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                  Limited Time Offers
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                  {offers[0].title}
                </h2>
                <p className="text-sm text-rosegold-100 max-w-xl">
                  {offers[0].description}
                </p>
                {offers[0].promo_code && (
                  <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1.5 rounded-lg border border-white/30 text-xs font-mono font-bold tracking-wider">
                    Use Coupon Code: <span className="text-amber-200">{offers[0].promo_code}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/offers"
                  className="px-6 py-3 rounded-full bg-white text-rosegold-800 font-bold text-sm hover:bg-cream-100 shadow-md transition-all text-center"
                >
                  View All Offers
                </Link>
                <Link
                  to="/book"
                  className="px-6 py-3 rounded-full bg-rosegold-900/60 hover:bg-rosegold-900 text-white font-semibold text-sm border border-white/20 transition-all text-center"
                >
                  Book with Offer
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
            Most Loved By Our Clients
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
            Featured Treatments & Services
          </h2>
          <p className="text-sm sm:text-base text-charcoal-600 font-light">
            Indulge in premium salon services designed to accentuate your natural beauty with long-lasting radiance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredServices.map((service) => (
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
                <div className="absolute bottom-3 right-3 bg-charcoal-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rosegold-300" />
                  <span>{service.duration_minutes} mins</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-charcoal-900 group-hover:text-rosegold-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-charcoal-500 block">Starting at</span>
                    <span className="font-serif text-2xl font-bold text-rosegold-700">₹{service.price}</span>
                  </div>

                  <button
                    onClick={() => handleBookService(service.id)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-medium text-xs sm:text-sm shadow-xs hover:shadow-rose transition-all flex items-center gap-1.5"
                  >
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-rosegold-700 hover:text-rosegold-900 underline underline-offset-4"
          >
            <span>View Complete Service & Price Menu</span> →
          </Link>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="bg-cream-100 py-16 border-y border-rosegold-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
              The {settings.parlour_name} Promise
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">Why Customers Adore Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-rosegold-100 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rosegold-100 text-rosegold-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Hospital-Grade Hygiene</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                UV-sterilized tools, disposable liners, single-use wax strips, and rigorous sanitization before every client.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rosegold-100 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rosegold-100 text-rosegold-700 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Certified Stylists</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Our master hair artists, makeup specialists, and aestheticians have years of hands-on salon experience.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rosegold-100 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rosegold-100 text-rosegold-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Premium Global Brands</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                We use authentic products from O3+, L'Oreal Professionnel, Moroccan Oil, MAC, Kryolan, and Rica Italy.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-rosegold-100 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rosegold-100 text-rosegold-700 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Personalized Care</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                No rush, no cookie-cutter solutions. We listen to your hair texture and skin tone to craft the perfect look.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
              Real Experiences
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">Words of Love from Clients</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosegold-100 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-charcoal-700 italic leading-relaxed">"{rev.comment}"</p>
                </div>

                <div className="pt-4 border-t border-cream-200">
                  <p className="font-serif font-bold text-charcoal-900">{rev.customer_name}</p>
                  {rev.service_name && (
                    <p className="text-xs text-rosegold-600 font-medium">{rev.service_name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. SALON GALLERY PREVIEW */}
      {gallery.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
                Visual Tour
              </span>
              <h2 className="font-serif text-3xl font-bold text-charcoal-900">Glimpses of Our Sanctuary</h2>
            </div>
            <Link
              to="/gallery"
              className="text-sm font-semibold text-rosegold-700 hover:text-rosegold-900 underline underline-offset-4"
            >
              View Full Gallery & Makeover Looks →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden aspect-square border border-rosegold-100 shadow-sm"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-charcoal-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-xs text-white font-medium">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. LOCATION & OPENING HOURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rosegold-200 shadow-soft">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block mb-1">
                  Visit Us Today
                </span>
                <h2 className="font-serif text-3xl font-bold text-charcoal-900">
                  Find Our Parlour
                </h2>
                <p className="text-sm text-charcoal-600 mt-2 font-light">
                  Conveniently situated in {settings.city} with dedicated parking and a welcoming reception.
                </p>
              </div>

              <div className="space-y-4 text-sm text-charcoal-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-rosegold-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-charcoal-900">Address:</strong>
                    <span>{settings.address}, {settings.city}, {settings.state} - {settings.pincode}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-rosegold-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-charcoal-900">Call & Appointments:</strong>
                    <a href={`tel:${settings.contact_phone}`} className="hover:text-rosegold-600 font-semibold">
                      {settings.contact_phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-rosegold-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-charcoal-900">Timings:</strong>
                    <span>{settings.opening_hours_text}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rosegold-50 hover:bg-rosegold-100 text-rosegold-700 font-semibold text-sm border border-rosegold-200 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>

            {/* Google Map Section */}
            <div className="lg:col-span-7 h-72 sm:h-80 rounded-2xl overflow-hidden border border-rosegold-100 shadow-inner bg-cream-200 relative">
              {settings.google_maps_embed ? (
                <iframe
                  title="Parlour Location"
                  src={settings.google_maps_embed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 bg-gradient-to-tr from-cream-100 to-blush-50">
                  <MapPin className="w-10 h-10 text-rosegold-600 animate-bounce" />
                  <p className="font-serif font-bold text-charcoal-900 text-lg">{settings.parlour_name}</p>
                  <p className="text-xs text-charcoal-600 max-w-sm">{settings.address}, {settings.city}</p>
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-xs font-semibold text-rosegold-600 underline"
                  >
                    Click to view directions
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. BOTTOM BOOKING CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rosegold-600 via-blush-600 to-rosegold-700 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-rose relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold">Ready to Pamper Yourself?</h2>
            <p className="text-sm sm:text-base text-rosegold-100 font-light">
              Book your preferred time slot online in seconds. Pay at the parlour after your service is completed!
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/book"
                className="px-8 py-3.5 rounded-full bg-white text-rosegold-700 font-bold text-sm shadow-md hover:bg-cream-100 transition-all transform hover:-translate-y-0.5"
              >
                Book Appointment Now
              </Link>
              <a
                href={`tel:${settings.contact_phone}`}
                className="px-8 py-3.5 rounded-full bg-rosegold-900/60 hover:bg-rosegold-900 text-white font-semibold text-sm border border-white/30 transition-all"
              >
                Call Us: {settings.contact_phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

