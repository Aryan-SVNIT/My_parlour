import { Appointment, AppointmentService, WebsiteSettings } from '../types/index.js';

export function formatWhatsAppConfirmationMessage(
  appointment: Appointment,
  services: AppointmentService[],
  settings: WebsiteSettings
): string {
  const serviceList = services
    .map((s) => `  • ${s.service_name} (₹${s.price_at_booking})`)
    .join('\n');

  return `🌸 *${settings.parlour_name.toUpperCase()}* 🌸
*Appointment Confirmation*

Dear *${appointment.customer_name}*,

💖 *Thank you for booking with us!* We are delighted to pamper you with exceptional beauty and care.

━━━━━━━━━━━━━━━━━━━━━
🔖 *Booking ID:* ${appointment.booking_id}
📅 *Date:* ${appointment.appointment_date}
⏰ *Time:* ${appointment.start_time} - ${appointment.end_time}
⏳ *Total Duration:* ${appointment.total_duration_minutes} minutes

✨ *Selected Services:*
${serviceList}

💰 *Total Amount:* ₹${appointment.total_amount}
💳 *Payment Mode:* ${appointment.payment_method.replace(/_/g, ' ').toUpperCase()} (${appointment.payment_status.toUpperCase()})
━━━━━━━━━━━━━━━━━━━━━

📍 *Location:*
${settings.address}, ${settings.city}
${settings.google_maps_url ? `🗺️ Maps: ${settings.google_maps_url}` : ''}

📞 *Questions or Rescheduling:*
Call / WhatsApp: ${settings.contact_phone}

_Thank you again for choosing ${settings.parlour_name}! See you soon ✨_
_${settings.tagline}_`;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  // Default to Indian country code 91 if 10-digit number is passed
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Optional automated WhatsApp Business Cloud API integration.
 * Triggers if WHATSAPP_CLOUD_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID are configured in environment variables.
 */
export async function sendAutomatedWhatsAppMessage(
  toPhone: string,
  messageText: string
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    // Graceful fallback to click-to-chat links (documented requirement)
    console.log(
      `[WhatsApp] Cloud API credentials not set in .env. Click-to-chat WhatsApp link provided for ${toPhone}.`
    );
    return { success: false, error: 'WhatsApp Cloud API credentials not configured in .env' };
  }

  let cleanPhone = toPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: true, body: messageText },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('[WhatsApp Cloud API Error]:', data);
      return { success: false, error: JSON.stringify(data) };
    }

    console.log(`[WhatsApp] Automated message sent successfully to ${cleanPhone}`);
    return { success: true };
  } catch (error: any) {
    console.error('[WhatsApp Network Error]:', error);
    return { success: false, error: error.message };
  }
}
