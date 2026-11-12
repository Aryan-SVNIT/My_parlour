import { Request, Response } from 'express';
import { getDb, saveDb } from '../db/index.js';
import { calculateAvailableSlots } from '../services/slotService.js';
import { formatWhatsAppConfirmationMessage, generateWhatsAppLink } from '../services/whatsappService.js';
import { Appointment, AppointmentService, Customer, Review } from '../types/index.js';

export function getPublicSettings(_req: Request, res: Response): void {
  const db = getDb();
  res.json({
    success: true,
    settings: db.website_settings,
    business_hours: db.business_hours,
  });
}

export function getPublicCategories(_req: Request, res: Response): void {
  const db = getDb();
  const categories = db.service_categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  res.json({ success: true, categories });
}

export function getPublicServices(req: Request, res: Response): void {
  const db = getDb();
  const { category, search } = req.query;

  let services = db.services.filter((s) => s.is_active);

  if (category && typeof category === 'string' && category !== 'all') {
    services = services.filter((s) => s.category_id === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    services = services.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, services });
}

export function getPublicOffers(_req: Request, res: Response): void {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const offers = db.offers.filter((o) => o.is_active && o.valid_until >= today);
  res.json({ success: true, offers });
}

export function getPublicGallery(req: Request, res: Response): void {
  const db = getDb();
  const { category } = req.query;

  let gallery = db.gallery.filter((g) => g.is_active).sort((a, b) => a.display_order - b.display_order);

  if (category && typeof category === 'string' && category !== 'all') {
    gallery = gallery.filter((g) => g.category.toLowerCase() === category.toLowerCase());
  }

  res.json({ success: true, gallery });
}

export function getPublicReviews(_req: Request, res: Response): void {
  const db = getDb();
  const reviews = db.reviews.filter((r) => r.is_approved).reverse();
  res.json({ success: true, reviews });
}

export function submitReview(req: Request, res: Response): void {
  try {
    const { customer_name, rating, comment, service_name } = req.body;

    if (!customer_name || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Customer name, rating, and feedback are required.' });
      return;
    }

    const db = getDb();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      customer_name: customer_name.trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment.trim(),
      service_name: service_name ? service_name.trim() : undefined,
      is_approved: true, // auto approve or admin moderate
      is_featured: false,
      created_at: new Date().toISOString(),
    };

    db.reviews.push(newReview);
    saveDb(db);

    res.status(201).json({ success: true, message: 'Thank you for your review!', review: newReview });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
}

export function checkAvailability(req: Request, res: Response): void {
  const { date, duration, staffId } = req.query;

  if (!date || typeof date !== 'string') {
    res.status(400).json({ success: false, message: 'Date parameter is required (YYYY-MM-DD).' });
    return;
  }

  const durationMinutes = duration ? parseInt(duration as string, 10) : 30;
  const result = calculateAvailableSlots(date, durationMinutes, staffId as string | undefined);

  res.json({ success: true, ...result });
}

export function bookAppointment(req: Request, res: Response): void {
  try {
    const {
      service_ids,
      appointment_date,
      start_time,
      customer_name,
      customer_phone,
      customer_email,
      customer_notes,
      payment_method,
      staff_id,
    } = req.body;

    // Basic validation
    if (!service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
      res.status(400).json({ success: false, message: 'Please select at least one service.' });
      return;
    }

    if (!appointment_date || !start_time || !customer_name || !customer_phone) {
      res.status(400).json({
        success: false,
        message: 'Appointment date, time slot, name, and phone number are required.',
      });
      return;
    }

    const cleanPhone = customer_phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
      return;
    }

    const db = getDb();

    // 1. Fetch matching services and calculate total duration and price from DB (never trust client amounts)
    const matchedServices = db.services.filter((s) => service_ids.includes(s.id) && s.is_active);
    if (matchedServices.length === 0) {
      res.status(400).json({ success: false, message: 'Selected services could not be found or are inactive.' });
      return;
    }

    const totalDurationMinutes = matchedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
    const totalAmount = matchedServices.reduce((sum, s) => sum + s.price, 0);

    // 2. Double-check slot availability dynamically to prevent double booking!
    const availability = calculateAvailableSlots(appointment_date, totalDurationMinutes, staff_id);
    if (!availability.isOpen) {
      res.status(400).json({ success: false, message: availability.message || 'Parlour is closed on this date.' });
      return;
    }

    const requestedSlot = availability.slots.find((slot) => slot.time === start_time);
    if (!requestedSlot || !requestedSlot.available) {
      res.status(409).json({
        success: false,
        message: 'The selected time slot is no longer available. Please select another slot.',
      });
      return;
    }

    const end_time = requestedSlot.endTime;

    // 3. Find or create customer
    let customer = db.customers.find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);
    const nowIso = new Date().toISOString();

    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        full_name: customer_name.trim(),
        phone: cleanPhone,
        email: customer_email ? customer_email.trim() : undefined,
        notes: '',
        total_spend: totalAmount,
        visit_count: 1,
        created_at: nowIso,
        updated_at: nowIso,
      };
      db.customers.push(customer);
    } else {
      customer.full_name = customer_name.trim();
      if (customer_email) customer.email = customer_email.trim();
      customer.total_spend += totalAmount;
      customer.visit_count += 1;
      customer.updated_at = nowIso;
    }

    // 4. Generate unique readable booking ID e.g. ASH-2026-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `ASH-${new Date().getFullYear()}-${randomSuffix}`;
    const appointmentId = `apt-${Date.now()}`;

    // Default staff assignment if not selected
    const assignedStaffId = staff_id || (db.staff.find((s) => s.is_active)?.id ?? undefined);

    const newAppointment: Appointment = {
      id: appointmentId,
      booking_id: bookingId,
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_phone: cleanPhone,
      customer_email: customer_email ? customer_email.trim() : undefined,
      appointment_date,
      start_time,
      end_time,
      total_duration_minutes: totalDurationMinutes,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      payment_method: payment_method || 'pay_at_parlour',
      customer_notes: customer_notes ? customer_notes.trim() : undefined,
      admin_notes: '',
      staff_id: assignedStaffId,
      created_at: nowIso,
      updated_at: nowIso,
    };

    db.appointments.push(newAppointment);

    // 5. Store individual services for appointment, freezing prices at booking time
    const appointmentServices: AppointmentService[] = matchedServices.map((srv, idx) => ({
      id: `as-${Date.now()}-${idx}`,
      appointment_id: appointmentId,
      service_id: srv.id,
      service_name: srv.name,
      price_at_booking: srv.price,
      duration_minutes: srv.duration_minutes,
    }));

    db.appointment_services.push(...appointmentServices);

    // Save changes to disk
    saveDb(db);

    // 6. Generate WhatsApp confirmation link
    const whatsappMessage = formatWhatsAppConfirmationMessage(
      newAppointment,
      appointmentServices,
      db.website_settings
    );
    const whatsappLink = generateWhatsAppLink(db.website_settings.whatsapp_number, whatsappMessage);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment: newAppointment,
      services: appointmentServices,
      booking_id: bookingId,
      whatsapp_link: whatsappLink,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to process booking. Please try again.' });
  }
}

export function trackBooking(req: Request, res: Response): void {
  const { booking_id, phone } = req.query;

  if (!booking_id || typeof booking_id !== 'string') {
    res.status(400).json({ success: false, message: 'Booking ID is required.' });
    return;
  }

  const db = getDb();
  const cleanBookingId = booking_id.trim().toUpperCase();

  const appointment = db.appointments.find((a) => a.booking_id.toUpperCase() === cleanBookingId);

  if (!appointment) {
    res.status(404).json({ success: false, message: 'No appointment found with the provided Booking ID.' });
    return;
  }

  // If phone is provided, verify match for customer privacy
  if (phone && typeof phone === 'string') {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const cleanApptPhone = appointment.customer_phone.replace(/[^0-9]/g, '');
    if (!cleanApptPhone.endsWith(cleanPhone) && !cleanPhone.endsWith(cleanApptPhone)) {
      res.status(403).json({ success: false, message: 'Mobile number does not match this booking record.' });
      return;
    }
  }

  const services = db.appointment_services.filter((as) => as.appointment_id === appointment.id);
  const staff = appointment.staff_id ? db.staff.find((s) => s.id === appointment.staff_id) : undefined;

  res.json({
    success: true,
    appointment,
    services,
    staff: staff ? { id: staff.id, name: staff.name, role: staff.role } : null,
  });
}

export function cancelCustomerBooking(req: Request, res: Response): void {
  try {
    const { booking_id, phone, reason } = req.body;

    if (!booking_id || !phone) {
      res.status(400).json({ success: false, message: 'Booking ID and registered phone are required.' });
      return;
    }

    const db = getDb();
    const cleanBookingId = booking_id.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');

    const appointment = db.appointments.find(
      (a) =>
        a.booking_id.toUpperCase() === cleanBookingId &&
        a.customer_phone.replace(/[^0-9]/g, '').endsWith(cleanPhone)
    );

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Matching appointment not found.' });
      return;
    }

    if (appointment.status === 'cancelled') {
      res.status(400).json({ success: false, message: 'This appointment is already cancelled.' });
      return;
    }

    if (appointment.status === 'completed') {
      res.status(400).json({ success: false, message: 'Completed appointments cannot be cancelled.' });
      return;
    }

    // Check cancellation notice policy
    const apptDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}:00`);
    const now = new Date();
    const hoursDiff = (apptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const minNotice = db.website_settings.min_booking_notice_hours || 2;
    if (hoursDiff < minNotice && hoursDiff > 0) {
      res.status(400).json({
        success: false,
        message: `As per policy, cancellations require at least ${minNotice} hour(s) advance notice. Please call the parlour directly at ${db.website_settings.contact_phone}.`,
      });
      return;
    }

    appointment.status = 'cancelled';
    appointment.admin_notes = `Cancelled by customer. Reason: ${reason || 'Not specified'}`;
    appointment.updated_at = new Date().toISOString();

    saveDb(db);

    res.json({ success: true, message: 'Appointment has been cancelled successfully.', appointment });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
  }
}
