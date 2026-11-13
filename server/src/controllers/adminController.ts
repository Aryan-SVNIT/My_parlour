import { Request, Response } from 'express';
import { getDb, saveDb } from '../db/index.js';
import {
  Appointment,
  AppointmentService,
  Customer,
  GalleryItem,
  Holiday,
  Offer,
  Review,
  Service,
  ServiceCategory,
  Staff,
  WebsiteSettings,
} from '../types/index.js';

export function getDashboardStats(_req: Request, res: Response): void {
  const db = getDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.slice(0, 7); // e.g. "2026-11"

  const todayAppointments = db.appointments.filter((a) => a.appointment_date === todayStr);

  const pendingCount = db.appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = db.appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = db.appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = db.appointments.filter((a) => a.status === 'cancelled').length;

  const todayRevenue = todayAppointments
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + a.total_amount, 0);

  const monthRevenue = db.appointments
    .filter(
      (a) =>
        a.appointment_date.startsWith(currentMonthPrefix) &&
        (a.status === 'confirmed' || a.status === 'completed')
    )
    .reduce((sum, a) => sum + a.total_amount, 0);

  // Today's appointments with joined services
  const todayList = todayAppointments.map((apt) => ({
    ...apt,
    services: db.appointment_services.filter((as) => as.appointment_id === apt.id),
    staff: db.staff.find((s) => s.id === apt.staff_id),
  }));

  // Upcoming appointments (future dates)
  const upcomingList = db.appointments
    .filter((a) => a.appointment_date > todayStr && a.status !== 'cancelled' && a.status !== 'rejected')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.start_time.localeCompare(b.start_time))
    .slice(0, 5)
    .map((apt) => ({
      ...apt,
      services: db.appointment_services.filter((as) => as.appointment_id === apt.id),
      staff: db.staff.find((s) => s.id === apt.staff_id),
    }));

  // Recent customers
  const recentCustomers = [...db.customers]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 5);

  // Popular services
  const serviceCountMap: Record<string, { count: number; name: string; revenue: number }> = {};
  for (const as of db.appointment_services) {
    if (!serviceCountMap[as.service_id]) {
      serviceCountMap[as.service_id] = { count: 0, name: as.service_name, revenue: 0 };
    }
    serviceCountMap[as.service_id].count++;
    serviceCountMap[as.service_id].revenue += as.price_at_booking;
  }
  const popularServices = Object.values(serviceCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Weekly revenue chart data (last 7 days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayRev = db.appointments
      .filter((a) => a.appointment_date === dStr && (a.status === 'confirmed' || a.status === 'completed'))
      .reduce((sum, a) => sum + a.total_amount, 0);

    const dayBookings = db.appointments.filter((a) => a.appointment_date === dStr).length;

    chartData.push({
      date: dStr,
      day: dayName,
      revenue: dayRev,
      bookings: dayBookings,
    });
  }

  res.json({
    success: true,
    stats: {
      totalToday: todayAppointments.length,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      totalCustomers: db.customers.length,
      todayRevenue,
      monthRevenue,
      todayAppointments: todayList,
      upcomingAppointments: upcomingList,
      recentCustomers,
      popularServices,
      chartData,
    },
  });
}

// ================= APPOINTMENT MANAGEMENT =================
export function getAppointments(req: Request, res: Response): void {
  const db = getDb();
  const { status, date, search } = req.query;

  let list = [...db.appointments];

  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter((a) => a.status === status);
  }

  if (date && typeof date === 'string') {
    list = list.filter((a) => a.appointment_date === date);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.booking_id.toLowerCase().includes(q) ||
        a.customer_name.toLowerCase().includes(q) ||
        a.customer_phone.includes(q)
    );
  }

  // Sort by date desc, then time desc
  list.sort((a, b) => b.appointment_date.localeCompare(a.appointment_date) || b.start_time.localeCompare(a.start_time));

  const enriched = list.map((apt) => ({
    ...apt,
    services: db.appointment_services.filter((as) => as.appointment_id === apt.id),
    staff: db.staff.find((s) => s.id === apt.staff_id),
  }));

  res.json({ success: true, appointments: enriched, total: enriched.length });
}

export function updateAppointmentStatus(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { status, payment_status, admin_notes, staff_id } = req.body;

    const db = getDb();
    const aptIndex = db.appointments.findIndex((a) => a.id === id);

    if (aptIndex === -1) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    const appointment = db.appointments[aptIndex];
    if (status) appointment.status = status;
    if (payment_status) appointment.payment_status = payment_status;
    if (admin_notes !== undefined) appointment.admin_notes = admin_notes;
    if (staff_id !== undefined) appointment.staff_id = staff_id;
    appointment.updated_at = new Date().toISOString();

    saveDb(db);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
}

export function rescheduleAppointment(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { appointment_date, start_time, end_time } = req.body;

    if (!appointment_date || !start_time) {
      res.status(400).json({ success: false, message: 'New date and time are required' });
      return;
    }

    const db = getDb();
    const apt = db.appointments.find((a) => a.id === id);

    if (!apt) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    apt.appointment_date = appointment_date;
    apt.start_time = start_time;
    if (end_time) {
      apt.end_time = end_time;
    } else {
      const [h, m] = start_time.split(':').map(Number);
      const totalM = h * 60 + m + apt.total_duration_minutes;
      apt.end_time = `${Math.floor(totalM / 60).toString().padStart(2, '0')}:${(totalM % 60).toString().padStart(2, '0')}`;
    }
    apt.status = 'confirmed';
    apt.updated_at = new Date().toISOString();

    saveDb(db);

    res.json({ success: true, message: 'Appointment rescheduled successfully', appointment: apt });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to reschedule appointment' });
  }
}

export function createManualAppointment(req: Request, res: Response): void {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      service_ids,
      appointment_date,
      start_time,
      staff_id,
      payment_method,
      payment_status,
      admin_notes,
      status,
    } = req.body;

    if (!customer_name || !customer_phone || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0) {
      res.status(400).json({ success: false, message: 'Customer name, phone, and at least one service are required.' });
      return;
    }

    const db = getDb();
    const matchedServices = db.services.filter((s) => service_ids.includes(s.id));
    if (matchedServices.length === 0) {
      res.status(400).json({ success: false, message: 'No valid services selected.' });
      return;
    }

    const totalDuration = matchedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
    const totalAmount = matchedServices.reduce((sum, s) => sum + s.price, 0);

    const [h, m] = (start_time || '10:00').split(':').map(Number);
    const totalM = h * 60 + m + totalDuration;
    const end_time = `${Math.floor(totalM / 60).toString().padStart(2, '0')}:${(totalM % 60).toString().padStart(2, '0')}`;

    const cleanPhone = customer_phone.trim().replace(/[^0-9]/g, '');
    let customer = db.customers.find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone);
    const nowIso = new Date().toISOString();

    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        full_name: customer_name.trim(),
        phone: cleanPhone,
        email: customer_email?.trim(),
        total_spend: totalAmount,
        visit_count: 1,
        created_at: nowIso,
        updated_at: nowIso,
      };
      db.customers.push(customer);
    } else {
      customer.total_spend += totalAmount;
      customer.visit_count += 1;
      customer.updated_at = nowIso;
    }

    const aptId = `apt-${Date.now()}`;
    const bookingId = `ASH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApt: Appointment = {
      id: aptId,
      booking_id: bookingId,
      customer_id: customer.id,
      customer_name: customer.full_name,
      customer_phone: cleanPhone,
      customer_email: customer_email?.trim(),
      appointment_date: appointment_date || new Date().toISOString().split('T')[0],
      start_time: start_time || '10:00',
      end_time,
      total_duration_minutes: totalDuration,
      total_amount: totalAmount,
      status: status || 'confirmed',
      payment_status: payment_status || 'paid',
      payment_method: payment_method || 'cash',
      admin_notes: admin_notes || 'Manual walk-in / phone booking',
      staff_id: staff_id || db.staff[0]?.id,
      created_at: nowIso,
      updated_at: nowIso,
    };

    db.appointments.push(newApt);

    const apptServices: AppointmentService[] = matchedServices.map((srv, idx) => ({
      id: `as-${Date.now()}-${idx}`,
      appointment_id: aptId,
      service_id: srv.id,
      service_name: srv.name,
      price_at_booking: srv.price,
      duration_minutes: srv.duration_minutes,
    }));
    db.appointment_services.push(...apptServices);

    saveDb(db);

    res.status(201).json({
      success: true,
      message: 'Walk-in booking created successfully!',
      appointment: newApt,
    });
  } catch (error) {
    console.error('Create manual appointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
}

export function deleteAppointment(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();

  const idx = db.appointments.findIndex((a) => a.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }

  db.appointments.splice(idx, 1);
  db.appointment_services = db.appointment_services.filter((as) => as.appointment_id !== id);
  saveDb(db);

  res.json({ success: true, message: 'Appointment deleted successfully' });
}

// ================= SERVICES MANAGEMENT =================
export function getAdminServices(_req: Request, res: Response): void {
  const db = getDb();
  res.json({
    success: true,
    services: db.services,
    categories: db.service_categories,
  });
}

export function createService(req: Request, res: Response): void {
  try {
    const { category_id, name, description, price, duration_minutes, image_url, is_featured, is_popular } = req.body;

    if (!category_id || !name || price === undefined) {
      res.status(400).json({ success: false, message: 'Category, name, and price are required' });
      return;
    }

    const db = getDb();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const newService: Service = {
      id: `srv-${Date.now()}`,
      category_id,
      name: name.trim(),
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      description: description?.trim() || '',
      price: Number(price),
      duration_minutes: Number(duration_minutes) || 30,
      image_url: image_url?.trim() || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      is_active: true,
      is_featured: !!is_featured,
      is_popular: !!is_popular,
      created_at: now,
      updated_at: now,
    };

    db.services.push(newService);
    saveDb(db);

    res.status(201).json({ success: true, message: 'Service added successfully', service: newService });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
}

export function updateService(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const db = getDb();
    const service = db.services.find((s) => s.id === id);

    if (!service) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    const { category_id, name, description, price, duration_minutes, image_url, is_active, is_featured, is_popular } =
      req.body;

    if (category_id) service.category_id = category_id;
    if (name) service.name = name.trim();
    if (description !== undefined) service.description = description.trim();
    if (price !== undefined) service.price = Number(price);
    if (duration_minutes !== undefined) service.duration_minutes = Number(duration_minutes);
    if (image_url) service.image_url = image_url.trim();
    if (is_active !== undefined) service.is_active = !!is_active;
    if (is_featured !== undefined) service.is_featured = !!is_featured;
    if (is_popular !== undefined) service.is_popular = !!is_popular;
    service.updated_at = new Date().toISOString();

    saveDb(db);

    res.json({ success: true, message: 'Service updated successfully', service });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
}

export function deleteService(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  const idx = db.services.findIndex((s) => s.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Service not found' });
    return;
  }

  db.services.splice(idx, 1);
  saveDb(db);

  res.json({ success: true, message: 'Service deleted successfully' });
}

// ================= CATEGORIES MANAGEMENT =================
export function createCategory(req: Request, res: Response): void {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const db = getDb();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: ServiceCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug,
      description: description?.trim(),
      display_order: db.service_categories.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.service_categories.push(newCat);
    saveDb(db);

    res.status(201).json({ success: true, message: 'Category created', category: newCat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
}

export function updateCategory(req: Request, res: Response): void {
  const { id } = req.params;
  const { name, description, is_active } = req.body;
  const db = getDb();
  const cat = db.service_categories.find((c) => c.id === id);

  if (!cat) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }

  if (name) cat.name = name.trim();
  if (description !== undefined) cat.description = description.trim();
  if (is_active !== undefined) cat.is_active = !!is_active;

  saveDb(db);
  res.json({ success: true, message: 'Category updated', category: cat });
}

export function deleteCategory(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  const idx = db.service_categories.findIndex((c) => c.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }

  db.service_categories.splice(idx, 1);
  saveDb(db);
  res.json({ success: true, message: 'Category deleted' });
}

// ================= CUSTOMERS MANAGEMENT =================
export function getCustomers(req: Request, res: Response): void {
  const db = getDb();
  const { search } = req.query;

  let customers = [...db.customers];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    customers = customers.filter(
      (c) => c.full_name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q))
    );
  }

  customers.sort((a, b) => b.total_spend - a.total_spend);

  const enriched = customers.map((c) => {
    const appointments = db.appointments.filter((a) => a.customer_id === c.id);
    return {
      ...c,
      total_appointments: appointments.length,
      appointments: appointments.sort((a, b) => b.appointment_date.localeCompare(a.appointment_date)),
    };
  });

  res.json({ success: true, customers: enriched });
}

export function updateCustomer(req: Request, res: Response): void {
  const { id } = req.params;
  const { full_name, phone, email, notes } = req.body;

  const db = getDb();
  const cust = db.customers.find((c) => c.id === id);

  if (!cust) {
    res.status(404).json({ success: false, message: 'Customer not found' });
    return;
  }

  if (full_name) cust.full_name = full_name.trim();
  if (phone) cust.phone = phone.trim().replace(/[^0-9]/g, '');
  if (email !== undefined) cust.email = email.trim();
  if (notes !== undefined) cust.notes = notes.trim();
  cust.updated_at = new Date().toISOString();

  saveDb(db);
  res.json({ success: true, message: 'Customer updated', customer: cust });
}

// ================= STAFF MANAGEMENT =================
export function getStaffList(_req: Request, res: Response): void {
  const db = getDb();
  res.json({ success: true, staff: db.staff, availability: db.staff_availability });
}

export function createStaff(req: Request, res: Response): void {
  try {
    const { name, role, phone, email, avatar_url } = req.body;
    if (!name || !role || !phone) {
      res.status(400).json({ success: false, message: 'Name, role, and phone are required' });
      return;
    }

    const db = getDb();
    const newStaff: Staff = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      avatar_url: avatar_url?.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.staff.push(newStaff);
    saveDb(db);

    res.status(201).json({ success: true, message: 'Staff member added', staff: newStaff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create staff' });
  }
}

export function updateStaff(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  const staff = db.staff.find((s) => s.id === id);

  if (!staff) {
    res.status(404).json({ success: false, message: 'Staff member not found' });
    return;
  }

  const { name, role, phone, email, is_active, avatar_url } = req.body;
  if (name) staff.name = name.trim();
  if (role) staff.role = role.trim();
  if (phone) staff.phone = phone.trim();
  if (email !== undefined) staff.email = email.trim();
  if (is_active !== undefined) staff.is_active = !!is_active;
  if (avatar_url) staff.avatar_url = avatar_url.trim();

  saveDb(db);
  res.json({ success: true, message: 'Staff member updated', staff });
}

export function deleteStaff(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  const idx = db.staff.findIndex((s) => s.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Staff member not found' });
    return;
  }

  db.staff.splice(idx, 1);
  saveDb(db);
  res.json({ success: true, message: 'Staff member deleted' });
}

// ================= BUSINESS HOURS & HOLIDAYS =================
export function getBusinessHours(_req: Request, res: Response): void {
  const db = getDb();
  res.json({ success: true, business_hours: db.business_hours, holidays: db.holidays });
}

export function updateBusinessHours(req: Request, res: Response): void {
  try {
    const { business_hours } = req.body;
    if (!Array.isArray(business_hours)) {
      res.status(400).json({ success: false, message: 'Invalid payload: business_hours array required.' });
      return;
    }

    const db = getDb();
    db.business_hours = business_hours;
    saveDb(db);

    res.json({ success: true, message: 'Business hours updated successfully', business_hours: db.business_hours });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update business hours' });
  }
}

export function createHoliday(req: Request, res: Response): void {
  const { holiday_date, title, description } = req.body;
  if (!holiday_date || !title) {
    res.status(400).json({ success: false, message: 'Date and title are required' });
    return;
  }

  const db = getDb();
  const newHoliday: Holiday = {
    id: `hol-${Date.now()}`,
    holiday_date,
    title: title.trim(),
    description: description?.trim(),
    is_recurring: false,
  };

  db.holidays.push(newHoliday);
  saveDb(db);

  res.status(201).json({ success: true, message: 'Holiday added successfully', holiday: newHoliday });
}

export function deleteHoliday(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  db.holidays = db.holidays.filter((h) => h.id !== id);
  saveDb(db);
  res.json({ success: true, message: 'Holiday removed' });
}

// ================= OFFERS MANAGEMENT =================
export function getAdminOffers(_req: Request, res: Response): void {
  const db = getDb();
  res.json({ success: true, offers: db.offers });
}

export function createOffer(req: Request, res: Response): void {
  try {
    const { title, description, discount_type, discount_value, promo_code, valid_from, valid_until, image_url, badge_text, combo_services } = req.body;

    if (!title || !discount_value || !valid_from || !valid_until) {
      res.status(400).json({ success: false, message: 'Title, discount value, and validity dates are required' });
      return;
    }

    const db = getDb();
    const newOffer: Offer = {
      id: `off-${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || '',
      discount_type: discount_type || 'percentage',
      discount_value: Number(discount_value),
      promo_code: promo_code?.trim().toUpperCase(),
      valid_from,
      valid_until,
      is_active: true,
      image_url: image_url?.trim() || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      badge_text: badge_text?.trim() || 'Special Offer',
      combo_services: Array.isArray(combo_services) ? combo_services : [],
      created_at: new Date().toISOString(),
    };

    db.offers.push(newOffer);
    saveDb(db);

    res.status(201).json({ success: true, message: 'Offer created successfully', offer: newOffer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create offer' });
  }
}

export function updateOffer(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  const offer = db.offers.find((o) => o.id === id);

  if (!offer) {
    res.status(404).json({ success: false, message: 'Offer not found' });
    return;
  }

  const { title, description, discount_type, discount_value, promo_code, valid_from, valid_until, is_active, image_url, badge_text, combo_services } = req.body;

  if (title) offer.title = title.trim();
  if (description !== undefined) offer.description = description.trim();
  if (discount_type) offer.discount_type = discount_type;
  if (discount_value !== undefined) offer.discount_value = Number(discount_value);
  if (promo_code !== undefined) offer.promo_code = promo_code.trim().toUpperCase();
  if (valid_from) offer.valid_from = valid_from;
  if (valid_until) offer.valid_until = valid_until;
  if (is_active !== undefined) offer.is_active = !!is_active;
  if (image_url) offer.image_url = image_url.trim();
  if (badge_text !== undefined) offer.badge_text = badge_text.trim();
  if (Array.isArray(combo_services)) offer.combo_services = combo_services;

  saveDb(db);
  res.json({ success: true, message: 'Offer updated successfully', offer });
}

export function deleteOffer(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  db.offers = db.offers.filter((o) => o.id !== id);
  saveDb(db);
  res.json({ success: true, message: 'Offer deleted successfully' });
}

// ================= GALLERY MANAGEMENT =================
export function getAdminGallery(_req: Request, res: Response): void {
  const db = getDb();
  res.json({ success: true, gallery: db.gallery });
}

export function createGalleryItem(req: Request, res: Response): void {
  try {
    const { title, category, image_url, description } = req.body;
    if (!title || !category || !image_url) {
      res.status(400).json({ success: false, message: 'Title, category, and image URL are required' });
      return;
    }

    const db = getDb();
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      image_url: image_url.trim(),
      description: description?.trim(),
      is_active: true,
      display_order: db.gallery.length + 1,
      created_at: new Date().toISOString(),
    };

    db.gallery.push(newItem);
    saveDb(db);

    res.status(201).json({ success: true, message: 'Image added to gallery', item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add gallery item' });
  }
}

export function updateGalleryItem(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  const item = db.gallery.find((g) => g.id === id);

  if (!item) {
    res.status(404).json({ success: false, message: 'Gallery item not found' });
    return;
  }

  const { title, category, image_url, description, is_active } = req.body;
  if (title) item.title = title.trim();
  if (category) item.category = category.trim();
  if (image_url) item.image_url = image_url.trim();
  if (description !== undefined) item.description = description.trim();
  if (is_active !== undefined) item.is_active = !!is_active;

  saveDb(db);
  res.json({ success: true, message: 'Gallery item updated', item });
}

export function deleteGalleryItem(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  db.gallery = db.gallery.filter((g) => g.id !== id);
  saveDb(db);
  res.json({ success: true, message: 'Gallery item removed' });
}

// ================= REVIEWS MANAGEMENT =================
export function getAdminReviews(_req: Request, res: Response): void {
  const db = getDb();
  res.json({ success: true, reviews: db.reviews });
}

export function toggleReviewApproval(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  const review = db.reviews.find((r) => r.id === id);

  if (!review) {
    res.status(404).json({ success: false, message: 'Review not found' });
    return;
  }

  review.is_approved = !review.is_approved;
  saveDb(db);
  res.json({ success: true, message: `Review ${review.is_approved ? 'approved' : 'hidden'}`, review });
}

export function deleteReview(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDb();
  db.reviews = db.reviews.filter((r) => r.id !== id);
  saveDb(db);
  res.json({ success: true, message: 'Review deleted' });
}

// ================= WEBSITE SETTINGS =================
export function getAdminSettings(_req: Request, res: Response): void {
  const db = getDb();
  res.json({ success: true, settings: db.website_settings });
}

export function updateWebsiteSettings(req: Request, res: Response): void {
  try {
    const db = getDb();
    const updateData = req.body as Partial<WebsiteSettings>;

    db.website_settings = {
      ...db.website_settings,
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    saveDb(db);
    res.json({ success: true, message: 'Website settings updated successfully', settings: db.website_settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
}

// ================= REPORTS & CSV EXPORT =================
export function getReports(_req: Request, res: Response): void {
  const db = getDb();

  const totalRevenue = db.appointments
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + a.total_amount, 0);

  const totalAppointments = db.appointments.length;
  const completedAppointments = db.appointments.filter((a) => a.status === 'completed').length;
  const cancelledAppointments = db.appointments.filter((a) => a.status === 'cancelled').length;

  // Monthly breakdown
  const monthlyDataMap: Record<string, { month: string; revenue: number; bookings: number }> = {};
  for (const apt of db.appointments) {
    const monthKey = apt.appointment_date.slice(0, 7); // YYYY-MM
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { month: monthKey, revenue: 0, bookings: 0 };
    }
    monthlyDataMap[monthKey].bookings++;
    if (apt.status === 'confirmed' || apt.status === 'completed') {
      monthlyDataMap[monthKey].revenue += apt.total_amount;
    }
  }

  const monthlyReports = Object.values(monthlyDataMap).sort((a, b) => a.month.localeCompare(b.month));

  // Status breakdown
  const statusCounts = {
    pending: db.appointments.filter((a) => a.status === 'pending').length,
    confirmed: db.appointments.filter((a) => a.status === 'confirmed').length,
    completed: completedAppointments,
    cancelled: cancelledAppointments,
    rejected: db.appointments.filter((a) => a.status === 'rejected').length,
  };

  res.json({
    success: true,
    reports: {
      totalRevenue,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      monthlyReports,
      statusCounts,
      totalCustomers: db.customers.length,
    },
  });
}

export function exportAppointmentsCsv(_req: Request, res: Response): void {
  const db = getDb();

  const headers = [
    'Booking ID',
    'Customer Name',
    'Phone',
    'Email',
    'Appointment Date',
    'Start Time',
    'End Time',
    'Duration (Minutes)',
    'Services',
    'Total Amount (INR)',
    'Status',
    'Payment Status',
    'Payment Method',
    'Created At',
  ];

  const rows = db.appointments.map((apt) => {
    const services = db.appointment_services
      .filter((as) => as.appointment_id === apt.id)
      .map((as) => as.service_name)
      .join(' | ');

    return [
      `"${apt.booking_id}"`,
      `"${apt.customer_name}"`,
      `"${apt.customer_phone}"`,
      `"${apt.customer_email || ''}"`,
      `"${apt.appointment_date}"`,
      `"${apt.start_time}"`,
      `"${apt.end_time}"`,
      apt.total_duration_minutes,
      `"${services}"`,
      apt.total_amount,
      `"${apt.status.toUpperCase()}"`,
      `"${apt.payment_status.toUpperCase()}"`,
      `"${apt.payment_method}"`,
      `"${apt.created_at}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="aashmi_appointments_${new Date().toISOString().split('T')[0]}.csv"`);
  res.status(200).send(csvContent);
}

