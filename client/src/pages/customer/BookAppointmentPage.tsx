import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  HeartHandshake,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { publicApi } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { Service, ServiceCategory, TimeSlot } from '../../types';

export const BookAppointmentPage: React.FC = () => {
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();

  // Booking Flow Steps: 1: Services, 2: Date & Slot, 3: Customer Info, 4: Summary, 5: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Data
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Date & Slot
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isSlotLoading, setIsSlotLoading] = useState<boolean>(false);
  const [slotMessage, setSlotMessage] = useState<string | null>(null);

  // Customer Info
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pay_at_parlour' | 'cash' | 'upi'>('pay_at_parlour');

  // State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Load services and categories
  useEffect(() => {
    const loadServicesData = async () => {
      try {
        const [catRes, srvRes] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getServices(),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (srvRes.data.success) {
          setAllServices(srvRes.data.services);

          // Check if pre-selected service from URL param
          const preSelected = searchParams.get('service');
          if (preSelected) {
            const exists = srvRes.data.services.some((s: Service) => s.id === preSelected);
            if (exists) {
              setSelectedServiceIds([preSelected]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load services for booking:', err);
      }
    };
    loadServicesData();
  }, [searchParams]);

  // Calculate totals
  const selectedServices = allServices.filter((s) => selectedServiceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Load available slots whenever selectedDate or totalDuration changes
  useEffect(() => {
    if (!selectedDate || totalDuration === 0) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsSlotLoading(true);
      setSlotMessage(null);
      setSelectedSlot('');

      try {
        const res = await publicApi.getAvailability(selectedDate, totalDuration);
        if (res.data.success) {
          if (!res.data.isOpen) {
            setSlotMessage(res.data.message || 'The parlour is closed on this date.');
            setAvailableSlots([]);
          } else {
            setAvailableSlots(res.data.slots);
            if (res.data.slots.length === 0) {
              setSlotMessage('No available slots remaining for this date. Please try another day.');
            }
          }
        }
      } catch (err: any) {
        setSlotMessage('Failed to check availability. Please choose another date.');
        setAvailableSlots([]);
      } finally {
        setIsSlotLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, totalDuration]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setBookingError(null);

    try {
      const res = await publicApi.bookAppointment({
        service_ids: selectedServiceIds,
        appointment_date: selectedDate,
        start_time: selectedSlot,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        customer_notes: customerNotes || undefined,
        payment_method: paymentMethod,
      });

      if (res.data.success) {
        setConfirmedBooking(res.data);
        setCurrentStep(5); // Confirmation screen

        // Fire celebratory confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Services' },
    { num: 2, title: 'Date & Time' },
    { num: 3, title: 'Details' },
    { num: 4, title: 'Review' },
  ];

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
          Seamless Online Reservation
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal-900">
          Book Your Salon Experience
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl mx-auto font-light">
          Reserve your slot in 4 simple steps. No upfront payment required — pay comfortably when you visit our parlour.
        </p>
      </div>

      {/* Progress Indicator (hidden on final confirmation step) */}
      {currentStep < 5 && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-rosegold-100 shadow-xs">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cream-200 -translate-y-1/2 z-0 hidden sm:block"></div>
            {stepsList.map((step) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                      isPassed
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-rosegold-600 text-white shadow-rose ring-4 ring-rosegold-100'
                        : 'bg-cream-100 text-charcoal-400 border border-cream-300'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium hidden sm:block ${
                      isCurrent ? 'text-rosegold-700 font-bold' : 'text-charcoal-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE(S) */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rosegold-100 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream-200 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-charcoal-900">
                  Step 1: Choose Your Services
                </h2>
                <p className="text-xs text-charcoal-600 mt-1">
                  You can select multiple services for a complete pampering session.
                </p>
              </div>

              {/* Running total preview */}
              <div className="bg-cream-100 px-4 py-2 rounded-2xl flex items-center gap-4 text-xs">
                <div>
                  <span className="text-charcoal-500 block">Selected</span>
                  <span className="font-bold text-charcoal-900">{selectedServiceIds.length} service(s)</span>
                </div>
                <div className="border-l border-cream-300 pl-4">
                  <span className="text-charcoal-500 block">Estimated Time</span>
                  <span className="font-bold text-charcoal-900">{totalDuration} mins</span>
                </div>
                <div className="border-l border-cream-300 pl-4">
                  <span className="text-charcoal-500 block">Total</span>
                  <span className="font-serif font-bold text-rosegold-700 text-sm">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-rosegold-600 text-white'
                    : 'bg-cream-100 hover:bg-cream-200 text-charcoal-700'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-rosegold-600 text-white'
                      : 'bg-cream-100 hover:bg-cream-200 text-charcoal-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(selectedCategory === 'all'
                ? allServices
                : allServices.filter((s) => s.category_id === selectedCategory)
              ).map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 items-center group ${
                      isSelected
                        ? 'border-rosegold-500 bg-rosegold-50/50 shadow-xs'
                        : 'border-cream-200 hover:border-rosegold-200 bg-white'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                      <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif font-bold text-sm text-charcoal-900 group-hover:text-rosegold-700 truncate">
                          {service.name}
                        </h4>
                        <span className="font-serif font-bold text-sm text-rosegold-700 whitespace-nowrap">
                          ₹{service.price}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-500 line-clamp-1 mt-0.5 font-light">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-charcoal-500 mt-1.5">
                        <Clock className="w-3 h-3 text-rosegold-400" />
                        <span>{service.duration_minutes} mins</span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-rosegold-600 text-white'
                          : 'border border-cream-400 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-rosegold-100 shadow-xs">
            <div>
              <p className="text-xs text-charcoal-500">Total Price & Time</p>
              <p className="font-serif text-xl font-bold text-rosegold-700">
                ₹{totalPrice} <span className="text-xs font-normal text-charcoal-600">({totalDuration} mins)</span>
              </p>
            </div>

            <button
              disabled={selectedServiceIds.length === 0}
              onClick={() => setCurrentStep(2)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-rose transition-all flex items-center gap-2"
            >
              <span>Continue to Date & Time</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE & TIME SLOT */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rosegold-100 shadow-soft space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900">
                Step 2: Choose Appointment Date & Time
              </h2>
              <p className="text-xs text-charcoal-600 mt-1">
                Slots are calculated dynamically based on total service duration ({totalDuration} mins) and real-time availability.
              </p>
            </div>

            {/* Date Picker Input */}
            <div className="max-w-xs space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Select Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 bg-white text-sm font-medium"
                />
              </div>
            </div>

            {/* Slots section */}
            <div className="space-y-4 pt-4 border-t border-cream-200">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-charcoal-900">
                  Available Slots for {selectedDate}
                </h3>
                <span className="text-xs text-charcoal-500">
                  {availableSlots.filter((s) => s.available).length} slots available
                </span>
              </div>

              {isSlotLoading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-rosegold-200 border-t-rosegold-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-charcoal-500">Calculating real-time parlor availability...</p>
                </div>
              ) : slotMessage ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  <span>{slotMessage}</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-charcoal-500 py-6 text-center">
                  No slots available on this date. Please choose a different date.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-3 rounded-xl text-center text-xs font-semibold transition-all duration-200 ${
                        !slot.available
                          ? 'bg-cream-100 text-charcoal-300 cursor-not-allowed border border-cream-200 line-through'
                          : selectedSlot === slot.time
                          ? 'bg-rosegold-600 text-white shadow-rose ring-2 ring-rosegold-300'
                          : 'bg-white hover:bg-rosegold-50 text-charcoal-800 border border-rosegold-200 hover:border-rosegold-400'
                      }`}
                    >
                      <span className="block text-sm font-bold">{slot.time}</span>
                      <span className="text-[10px] opacity-80 block mt-0.5">to {slot.endTime}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-rosegold-100 shadow-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-700 font-semibold text-xs flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              disabled={!selectedSlot}
              onClick={() => setCurrentStep(3)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-rose transition-all flex items-center gap-2"
            >
              <span>Continue to Your Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CUSTOMER DETAILS */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rosegold-100 shadow-soft space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900">
                Step 3: Enter Your Contact Information
              </h2>
              <p className="text-xs text-charcoal-600 mt-1">
                We'll use this to send you booking confirmation and WhatsApp updates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ananya Gupta"
                  className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Mobile Number (WhatsApp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-charcoal-500 font-medium">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. ananya@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Special Notes / Allergies (Optional)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Sensitive skin, herbal products only"
                  className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-rosegold-100 shadow-xs">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-700 font-semibold text-xs flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              disabled={!customerName.trim() || customerPhone.length < 10}
              onClick={() => setCurrentStep(4)}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-rose transition-all flex items-center gap-2"
            >
              <span>Review Booking Summary</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rosegold-100 shadow-soft space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal-900">
                Step 4: Review & Finalize Booking
              </h2>
              <p className="text-xs text-charcoal-600 mt-1">
                Please verify your appointment slot, services, and chosen payment method.
              </p>
            </div>

            {bookingError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Services list */}
              <div className="bg-cream-50 rounded-2xl p-5 border border-rosegold-100 space-y-4">
                <h3 className="font-serif font-bold text-charcoal-900 border-b border-rosegold-200 pb-2">
                  Selected Services ({selectedServices.length})
                </h3>
                <div className="space-y-2">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-charcoal-900">{s.name}</p>
                        <span className="text-xs text-charcoal-500">{s.duration_minutes} mins</span>
                      </div>
                      <span className="font-serif font-bold text-rosegold-700">₹{s.price}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-rosegold-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-charcoal-500 block">Total Duration</span>
                    <span className="font-bold text-charcoal-800 text-sm">{totalDuration} minutes</span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-500 block text-right">Total Payable</span>
                    <span className="font-serif font-bold text-xl text-rosegold-700">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Right: Date, Time & Customer details */}
              <div className="bg-cream-50 rounded-2xl p-5 border border-rosegold-100 space-y-4">
                <h3 className="font-serif font-bold text-charcoal-900 border-b border-rosegold-200 pb-2">
                  Appointment Details
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-rosegold-600" />
                    <div>
                      <span className="text-xs text-charcoal-500 block">Date</span>
                      <span className="font-semibold text-charcoal-900">{selectedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-rosegold-600" />
                    <div>
                      <span className="text-xs text-charcoal-500 block">Time Slot</span>
                      <span className="font-semibold text-charcoal-900">{selectedSlot}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-rosegold-600" />
                    <div>
                      <span className="text-xs text-charcoal-500 block">Customer</span>
                      <span className="font-semibold text-charcoal-900">{customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-rosegold-600" />
                    <div>
                      <span className="text-xs text-charcoal-500 block">Mobile</span>
                      <span className="font-semibold text-charcoal-900">+91 {customerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Option */}
                <div className="pt-3 border-t border-rosegold-200 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 block">
                    Payment Preference
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'pay_at_parlour', label: 'Pay at Parlour' },
                      { id: 'cash', label: 'Cash' },
                      { id: 'upi', label: 'UPI / GPay' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          paymentMethod === m.id
                            ? 'border-rosegold-600 bg-rosegold-100 text-rosegold-800 font-bold'
                            : 'border-cream-300 bg-white text-charcoal-600'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-2xl border border-rosegold-100 shadow-xs">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-700 font-semibold text-xs flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="px-10 py-3.5 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 disabled:opacity-40 text-white font-bold text-sm shadow-rose hover:shadow-xl transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Confirming Booking...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm Appointment Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRMATION SUCCESS SCREEN */}
      {currentStep === 5 && confirmedBooking && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rosegold-200 shadow-xl max-w-2xl mx-auto text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 block">
              Booking Confirmed
            </span>
            <h2 className="font-serif text-3xl font-bold text-charcoal-900">
              Thank You, {customerName}!
            </h2>
            <p className="text-sm text-charcoal-600 font-light">
              Your appointment has been successfully scheduled at {settings.parlour_name}.
            </p>
          </div>

          {/* Booking Card */}
          <div className="bg-cream-50 rounded-2xl p-6 border border-rosegold-200 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-rosegold-200 pb-3">
              <div>
                <span className="text-xs text-charcoal-500 uppercase tracking-wider font-semibold">
                  Booking Reference ID
                </span>
                <p className="font-serif text-2xl font-extrabold text-rosegold-700">
                  {confirmedBooking.booking_id}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Confirmed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-charcoal-500 block">Appointment Date</span>
                <span className="font-semibold text-charcoal-900">{selectedDate}</span>
              </div>
              <div>
                <span className="text-xs text-charcoal-500 block">Time Slot</span>
                <span className="font-semibold text-charcoal-900">{selectedSlot}</span>
              </div>
              <div>
                <span className="text-xs text-charcoal-500 block">Total Payable</span>
                <span className="font-serif font-bold text-rosegold-700 text-base">₹{totalPrice}</span>
              </div>
              <div>
                <span className="text-xs text-charcoal-500 block">Payment Mode</span>
                <span className="font-semibold text-charcoal-900 uppercase text-xs">
                  {paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-charcoal-500 block mb-1">Services:</span>
              <ul className="text-xs text-charcoal-700 space-y-1">
                {selectedServices.map((s) => (
                  <li key={s.id}>• {s.name} (₹{s.price})</li>
                ))}
              </ul>
            </div>
          </div>

          {/* WhatsApp Direct Confirmation Button */}
          {confirmedBooking.whatsapp_link && (
            <div className="pt-2">
              <a
                href={confirmedBooking.whatsapp_link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Open in WhatsApp & Send to Parlour</span>
              </a>
              <p className="text-[11px] text-charcoal-400 mt-1.5">
                Share details with the parlour directly on WhatsApp for quick coordination.
              </p>
            </div>
          )}

          {/* Action Links */}
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 text-xs font-semibold">
            <Link
              to="/services"
              className="px-6 py-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-800 transition-colors"
            >
              Browse More Services
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 rounded-full bg-rosegold-50 hover:bg-rosegold-100 text-rosegold-700 border border-rosegold-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

