import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const cleanPhone = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hello ${settings.parlour_name}, I would like to get in touch regarding salon appointments.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest font-bold text-rosegold-600 block">
          Get in Touch
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-charcoal-900">
          We'd Love to Hear From You
        </h1>
        <p className="text-sm sm:text-base text-charcoal-600 font-light leading-relaxed">
          Have a question about our treatments, customized bridal packages, or need directions? Our friendly reception team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Information & Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rosegold-100 shadow-soft space-y-6">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900">Parlour Information</h2>

            <div className="space-y-4 text-sm text-charcoal-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rosegold-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-charcoal-900">Our Location</span>
                  <p className="text-xs sm:text-sm text-charcoal-600">
                    {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-rosegold-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-charcoal-900">Call Us</span>
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-rosegold-600 font-medium">
                    {settings.contact_phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-rosegold-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-charcoal-900">Email Address</span>
                  <a href={`mailto:${settings.email}`} className="hover:text-rosegold-600 font-medium">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-rosegold-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-charcoal-900">Opening Hours</span>
                  <p className="text-xs text-charcoal-600">{settings.opening_hours_text}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cream-200">
              <button
                onClick={handleWhatsAppDirect}
                className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat Directly on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rosegold-100 shadow-soft">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-2">Send an Enquiry</h2>
            <p className="text-xs text-charcoal-600 mb-6 font-light">
              Fill out this form and our team will get back to you shortly.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900">Message Received!</h3>
                <p className="text-sm text-charcoal-600 max-w-md mx-auto">
                  Thank you for reaching out to {settings.parlour_name}. Our salon coordinator will contact you promptly on your mobile number.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setPhone('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="px-6 py-2 rounded-full bg-rosegold-50 text-rosegold-700 text-xs font-semibold hover:bg-rosegold-100 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pooja Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                      className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. pooja@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1">
                    Your Message / Question *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you would like to know or which treatment you are interested in..."
                    className="w-full px-4 py-2.5 rounded-xl border border-rosegold-200 focus:outline-hidden focus:ring-2 focus:ring-rosegold-500 text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-rosegold-600 to-blush-600 hover:from-rosegold-700 hover:to-blush-700 text-white font-semibold text-sm shadow-rose hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
