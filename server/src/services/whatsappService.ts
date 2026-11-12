import { Appointment, AppointmentService, WebsiteSettings } from '../types/index.js';

export function formatWhatsAppConfirmationMessage(
  appointment: Appointment,
  services: AppointmentService[],
  settings: WebsiteSettings
): string {
  const serviceList = services.map((s) => `• ${s.service_name} (₹${s.price_at_booking})`).join('\n');

  return `🌸 *${settings.parlour_name.toUpperCase()} - APPOINTMENT CONFIRMATION* 🌸

Dear *${appointment.customer_name}*,
Thank you for booking with us! Here are your appointment details:

🔖 *Booking ID:* ${appointment.booking_id}
📅 *Date:* ${appointment.appointment_date}
⏰ *Time:* ${appointment.start_time} - ${appointment.end_time}
⏳ *Total Duration:* ${appointment.total_duration_minutes} mins

✨ *Selected Services:*
${serviceList}

💰 *Total Amount:* ₹${appointment.total_amount}
💳 *Payment:* ${appointment.payment_method.replace(/_/g, ' ').toUpperCase()} (${appointment.payment_status.toUpperCase()})

📍 *Location:*
${settings.address}, ${settings.city}
${settings.google_maps_url ? `🗺️ Maps: ${settings.google_maps_url}` : ''}

📞 *Help & Rescheduling:*
Call or WhatsApp us at ${settings.contact_phone}

We look forward to pampering you! ✨
_${settings.tagline}_`;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
