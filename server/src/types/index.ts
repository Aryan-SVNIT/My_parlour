export type Role = 'admin' | 'staff' | 'receptionist';

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  notes?: string;
  total_spend: number;
  visit_count: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type PaymentMethod = 'pay_at_parlour' | 'cash' | 'upi' | 'online';

export interface Appointment {
  id: string;
  booking_id: string; // e.g. ASH-2026-9281
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  total_duration_minutes: number;
  total_amount: number;
  status: AppointmentStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  customer_notes?: string;
  admin_notes?: string;
  staff_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  service_name: string;
  price_at_booking: number;
  duration_minutes: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface StaffAvailability {
  id: string;
  staff_id: string;
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface BusinessHours {
  id: string;
  day_of_week: number;
  day_name: string;
  is_closed: boolean;
  open_time: string;
  close_time: string;
  break_start?: string;
  break_end?: string;
  slot_interval_minutes: number;
}

export interface Holiday {
  id: string;
  holiday_date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  is_recurring: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  promo_code?: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  image_url?: string;
  combo_services?: string[]; // IDs of services
  badge_text?: string;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  service_name?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface WebsiteSettings {
  parlour_name: string;
  tagline: string;
  logo_url: string;
  contact_phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  google_maps_url: string;
  google_maps_embed: string;
  instagram_url: string;
  facebook_url: string;
  opening_hours_text: string;
  advance_booking_days: number;
  min_booking_notice_hours: number;
  cancellation_policy: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface DatabaseSchema {
  admins: AdminUser[];
  customers: Customer[];
  service_categories: ServiceCategory[];
  services: Service[];
  appointments: Appointment[];
  appointment_services: AppointmentService[];
  staff: Staff[];
  staff_availability: StaffAvailability[];
  business_hours: BusinessHours[];
  holidays: Holiday[];
  offers: Offer[];
  gallery: GalleryItem[];
  reviews: Review[];
  website_settings: WebsiteSettings;
  payments: Payment[];
}
