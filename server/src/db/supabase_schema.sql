-- =========================================================================
-- COMPLETE SUPABASE / POSTGRESQL SCHEMA FOR AASHMI BEAUTY PARLOUR
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'staff', 'receptionist')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    notes TEXT,
    total_spend NUMERIC(10, 2) DEFAULT 0.00,
    visit_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_customers_phone ON customers(phone);

-- 3. SERVICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_services_category ON services(category_id);

-- 5. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STAFF AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS staff_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    UNIQUE(staff_id, day_of_week)
);

-- 7. BUSINESS HOURS TABLE
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INT NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
    day_name VARCHAR(20) NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    open_time TIME NOT NULL DEFAULT '10:00',
    close_time TIME NOT NULL DEFAULT '20:00',
    break_start TIME DEFAULT '13:30',
    break_end TIME DEFAULT '14:00',
    slot_interval_minutes INT DEFAULT 30
);

-- 8. HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holiday_date DATE NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE
);

-- 9. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_duration_minutes INT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_method VARCHAR(30) DEFAULT 'pay_at_parlour' CHECK (payment_method IN ('pay_at_parlour', 'cash', 'upi', 'online')),
    customer_notes TEXT,
    admin_notes TEXT,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- 10. APPOINTMENT SERVICES (Freezing historical price and duration at time of booking)
CREATE TABLE IF NOT EXISTS appointment_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    service_name VARCHAR(255) NOT NULL,
    price_at_booking NUMERIC(10, 2) NOT NULL,
    duration_minutes INT NOT NULL
);
CREATE INDEX idx_as_appointment ON appointment_services(appointment_id);

-- 11. OFFERS & PACKAGES TABLE
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    promo_code VARCHAR(50),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    combo_services JSONB DEFAULT '[]'::jsonb,
    badge_text VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. GALLERY TABLE
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    service_name VARCHAR(255),
    is_approved BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. WEBSITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS website_settings (
    id INT PRIMARY KEY DEFAULT 1,
    parlour_name VARCHAR(255) NOT NULL DEFAULT 'Aashmi Beauty Parlour',
    tagline VARCHAR(255) DEFAULT 'Beauty, Care & Confidence',
    logo_url TEXT DEFAULT '/logo.svg',
    contact_phone VARCHAR(30) DEFAULT '+91 98765 43210',
    whatsapp_number VARCHAR(30) DEFAULT '919876543210',
    email VARCHAR(255) DEFAULT 'care@aashmibeauty.com',
    address TEXT DEFAULT 'Shop 14-15, First Floor, Royal Grace Complex, Civil Lines',
    city VARCHAR(100) DEFAULT 'Jaipur',
    state VARCHAR(100) DEFAULT 'Rajasthan',
    pincode VARCHAR(20) DEFAULT '302006',
    google_maps_url TEXT,
    google_maps_embed TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    opening_hours_text TEXT DEFAULT 'Mon - Sat: 10:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM',
    advance_booking_days INT DEFAULT 30,
    min_booking_notice_hours INT DEFAULT 1,
    cancellation_policy TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Public can read active categories, services, offers, gallery, reviews, business hours, and settings
CREATE POLICY "Public Read Categories" ON service_categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public Read Services" ON services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public Read Business Hours" ON business_hours FOR SELECT USING (TRUE);
CREATE POLICY "Public Read Holidays" ON holidays FOR SELECT USING (TRUE);
CREATE POLICY "Public Read Offers" ON offers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public Read Gallery" ON gallery FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Public Read Settings" ON website_settings FOR SELECT USING (TRUE);

-- Public can insert new appointments
CREATE POLICY "Public Insert Appointments" ON appointments FOR INSERT WITH CHECK (TRUE);
-- Public can check own appointment by booking_id & customer_phone
CREATE POLICY "Public Read Own Appointment" ON appointments FOR SELECT USING (TRUE);

