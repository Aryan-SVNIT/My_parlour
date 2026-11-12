# 🌸 Aashmi Beauty Parlour — Management & Online Appointment System

A complete, modern, responsive, production-ready Beauty Parlour Management and Online Appointment Booking Website designed with a luxury, feminine aesthetic (soft blush pink, nude, cream, white, and rose gold).

The project features **TWO SEPARATE INTERFACES**:
1. **Customer-Facing Website**: Elegant public showcase, service discovery, live multi-step appointment booking engine, appointment tracking, offers, gallery, and one-click WhatsApp confirmation.
2. **Secure Admin Dashboard**: Restricted owner portal with live metrics, appointment scheduling, services & price management, customer directory, staff management, weekly hours & holiday calendar, offers manager, gallery editor, reviews moderation, website branding settings, and CSV financial report exports.

---

## 🌟 Key Highlights & Features

### 1. Customer Website
- **Luxury Aesthetic**: Rose gold accents, blush pink highlights, cream backgrounds, and refined typography (*Playfair Display* & *Plus Jakarta Sans*).
- **Home Page**: Hero section with trust badges, popular treatments, seasonal promotional banner, "Why Choose Us" hygiene promise, customer reviews, photo gallery preview, Google Maps location, and business hours.
- **Categorized Services Menu**: Real-time category filtering (Hair Services, Skin Care, Threading & Waxing, Makeup, Manicure & Pedicure, Bridal Packages) and keyword search. Each card shows duration in minutes, price in INR (₹), description, and instant "Book Now" CTA.
- **Multi-Step Dynamic Appointment Booking Engine**:
  - **Step 1**: Multi-service selection with running total price and duration.
  - **Step 2**: Visual date picker that blocks past dates, weekly offs, and holidays.
  - **Step 3**: Real-time available time slots computed dynamically based on total treatment duration, opening hours, lunch break times, existing appointments, and active salon capacity (prevents double bookings).
  - **Step 4**: Customer contact details (Name, 10-digit mobile number, optional email, notes).
  - **Step 5**: Review & payment mode selection (*Pay at Parlour*, *Cash*, *UPI at Parlour*).
  - **Step 6**: Unique Booking Reference ID (e.g. `ASH-2026-7841`), celebratory confetti animation, and one-click **"Send to Parlour on WhatsApp"** button.
- **Appointment Tracking & Self-Cancellation**:
  - Look up booking status anytime using **Booking ID** and registered mobile number.
  - Cancel or reschedule appointments directly from the website according to parlour notice policy.
- **Offers & Packages**: Seasonal discounts, bridal privileges, and clickable coupon codes (e.g. `GLOW20`, `ROYAL2000`, `WEEKENDSPA`).
- **Salon Gallery**: Interactive categorized portfolio (Salon Interior, Hair Styling, Makeup, Skincare, Bridal Looks) with lightbox zoom modal.
- **About Us & Contact Us**: Parlour story, owner introduction, meet the team, Google Maps embed, and direct WhatsApp chat button.

### 2. Secure Owner Admin Dashboard (`/admin/login` & `/admin/dashboard`)
- **Dashboard Overview**: Live KPI cards (Today's appointments, Pending count, Confirmed, Completed, Today's estimated revenue, Monthly revenue, Total clients), today's schedule table with quick status action buttons (*Confirm*, *Mark Done*, *Cancel*), and a 7-day visual revenue chart using **Recharts**.
- **Appointment Management**: Search by client name/phone/ID, filter by date and status, view itemized services with locked historical booking prices, reschedule time slots, assign staff members, update payment status, and manually register offline walk-in clients.
- **Services & Menu Management**: Add, edit, disable, or delete services and categories. Set prices, durations, descriptions, and toggle "Popular" or "Featured" badges. Changes reflect immediately on the customer website.
- **Customer Directory**: Client database showing total appointments, lifetime expenditure, booking history, and internal notes (allergies, sensitivities, preferences).
- **Staff Management**: Add staff members, assign roles, contact details, profile avatars, and toggle active status.
- **Business Hours & Holidays**: Configure open/close times, lunch breaks, and slot intervals for each day of the week. Manage special holiday closures (blocks bookings automatically).
- **Offers & Packages**: Manage seasonal banners, discount percentages, fixed discounts, and coupon validity dates.
- **Gallery Manager**: Add, organize, and delete portfolio photos.
- **Website Settings**: Re-brand the entire website directly from the dashboard: parlour name, tagline, logo, phone, WhatsApp number, email, address, Google Maps link, Instagram/Facebook links, and cancellation policy.
- **Reports & Analytics**: Financial metrics, monthly performance breakdown, and **one-click RFC-compliant CSV export** of all appointments for Excel/accounting.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18 / 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router DOM, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, TSX, Cors, Dotenv, Zod |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt password hashing |
| **Database** | Fully-relational persistence with thread-safe JSON store + complete Supabase / PostgreSQL schema (`supabase_schema.sql`) |
| **Architecture** | Clean modular architecture separating public customer APIs from protected owner APIs |

---

## 📁 Project Structure

```
Aashmi_Beauty_Parlour/
├── client/                               # Frontend React + TypeScript application
│   ├── public/                           # Static assets, SVG logo
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts                 # Axios API client & interceptors
│   │   ├── components/
│   │   │   ├── admin/                    # Admin components (Sidebar, Header, Modals)
│   │   │   │   ├── AdminHeader.tsx
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   ├── AppointmentModal.tsx
│   │   │   │   └── WalkInModal.tsx
│   │   │   └── common/                   # Customer components (Navbar, Footer, Modals)
│   │   │       ├── Footer.tsx
│   │   │       ├── Navbar.tsx
│   │   │       ├── TrackBookingModal.tsx
│   │   │       └── WhatsAppButton.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx           # Owner authentication state & JWT persistence
│   │   │   └── SettingsContext.tsx       # Live website settings provider
│   │   ├── layouts/
│   │   │   ├── AdminLayout.tsx           # Protected admin dashboard layout
│   │   │   └── CustomerLayout.tsx        # Public customer website layout
│   │   ├── pages/
│   │   │   ├── admin/                    # Admin portal pages
│   │   │   │   ├── AdminAppointmentsPage.tsx
│   │   │   │   ├── AdminBusinessHoursPage.tsx
│   │   │   │   ├── AdminCustomersPage.tsx
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   ├── AdminGalleryPage.tsx
│   │   │   │   ├── AdminLoginPage.tsx
│   │   │   │   ├── AdminOffersPage.tsx
│   │   │   │   ├── AdminReportsPage.tsx
│   │   │   │   ├── AdminReviewsPage.tsx
│   │   │   │   ├── AdminServicesPage.tsx
│   │   │   │   ├── AdminSettingsPage.tsx
│   │   │   │   └── AdminStaffPage.tsx
│   │   │   └── customer/                 # Customer website pages
│   │   │       ├── AboutPage.tsx
│   │   │       ├── BookAppointmentPage.tsx
│   │   │       ├── ContactPage.tsx
│   │   │       ├── GalleryPage.tsx
│   │   │       ├── HomePage.tsx
│   │   │       ├── OffersPage.tsx
│   │   │       └── ServicesPage.tsx
│   │   ├── types/
│   │   │   └── index.ts                  # Shared client TypeScript interfaces
│   │   ├── App.tsx                       # Main router configuration
│   │   ├── index.css                     # Tailwind directives & luxury scrollbar
│   │   └── main.tsx
│   ├── tailwind.config.js                # Custom luxury color palette & typography
│   └── package.json
│
├── server/                               # Backend API server
│   ├── data/
│   │   └── beauty_parlour.db.json        # Relational database store with seed data
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── adminController.ts        # Admin operations (Stats, Services, Staff, Hours, Reports)
│   │   │   ├── authController.ts         # Login, JWT, profile, password change
│   │   │   └── publicController.ts       # Booking engine, services, slots, tracking
│   │   ├── db/
│   │   │   ├── index.ts                  # Database persistence layer
│   │   │   ├── initialData.ts            # Realistic sample seed data for parlour
│   │   │   └── supabase_schema.sql       # Full PostgreSQL/Supabase production DDL & RLS
│   │   ├── middleware/
│   │   │   └── auth.ts                   # JWT bearer token verification
│   │   ├── routes/
│   │   │   ├── adminRoutes.ts            # Protected admin routes
│   │   │   ├── authRoutes.ts             # Auth routes
│   │   │   └── publicRoutes.ts           # Customer public routes
│   │   ├── services/
│   │   │   ├── slotService.ts            # Dynamic slot availability calculation engine
│   │   │   └── whatsappService.ts        # WhatsApp formatted links & messaging
│   │   ├── types/
│   │   │   └── index.ts                  # Server data models & schema types
│   │   ├── index.ts                      # Express server entry point
│   │   └── test-workflows.ts             # Automated workflow test suite
│   ├── tsconfig.json
│   └── package.json
│
├── .env.example                          # Environment template
├── package.json                          # Root package.json with concurrent dev scripts
└── README.md                             # Documentation
```

---

## 🚀 Setup & Local Development Instructions

### Prerequisites
- **Node.js**: v18.0.0 or newer (tested on Node v20 & v24)
- **npm**: v9.0.0 or newer

### 1. Installation
Clone the repository and install all dependencies:
```bash
# In the project root directory:
npm run install:all
```
*(This automatically installs root, client, and server dependencies).*

### 2. Environment Configuration
Create a `.env` file inside the `server/` directory:
```bash
# In server/.env
PORT=5000
NODE_ENV=development
JWT_SECRET=aashmi_beauty_parlour_jwt_super_secret_key_2026_secure
CLIENT_URL=http://localhost:5173
ADMIN_DEFAULT_EMAIL=admin@aashmibeauty.com
ADMIN_DEFAULT_PASSWORD=Admin@12345
```

Create a `.env` file inside the `client/` directory:
```bash
# In client/.env
VITE_API_URL=http://localhost:5000/api
```

### 3. Running the Application
To run both backend server and frontend client simultaneously with a single command:
```bash
npm run dev
```

- **Customer Website**: [http://localhost:5173](http://localhost:5173)
- **Admin Dashboard Login**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔐 Default Admin Credentials

For initial testing and setup, the database is pre-seeded with an administrator account:
- **Admin Email**: `admin@aashmibeauty.com`
- **Password**: `Admin@12345`

*Note: On the `/admin/login` page, there is an **Auto-Fill Demo Credentials** button for instant testing. You can change your password anytime under Website Settings.*

---

## 🗄️ Database Design & Supabase PostgreSQL Migration

The system uses a 15-entity relational architecture:
1. `admins`: Owner credentials, password hash, role.
2. `customers`: Name, unique phone, email, total spend, visit count, notes.
3. `service_categories`: Hair, Skin, Waxing, Makeup, Nails, Bridal.
4. `services`: Price, duration in minutes, image URL, popular/featured flags.
5. `appointments`: Booking reference ID, customer ID, date, time slot, duration, total price, status, payment mode.
6. `appointment_services`: Individual services frozen with `price_at_booking` (preserves historical financial records).
7. `staff`: Stylists, beauticians, designations, active status.
8. `staff_availability`: Weekly working hours per staff member.
9. `business_hours`: Open/close time, break start/end, slot intervals per day of week.
10. `holidays`: Date-based parlour closures that block bookings.
11. `offers`: Percentage/fixed discounts, promo codes, validity dates.
12. `gallery`: Categorized portfolio images.
13. `reviews`: Customer testimonials with star ratings and moderation status.
14. `website_settings`: Configurable business details, addresses, and policies.
15. `payments`: Payment records, transaction IDs, statuses.

### Deploying to Supabase PostgreSQL:
A complete SQL script with table definitions, constraints, indexes, and Row Level Security (RLS) policies is included at:
[`server/src/db/supabase_schema.sql`](file:///c:/Codes/Aashmi_Beauty_Parlour/server/src/db/supabase_schema.sql)

Simply copy and run this file in your Supabase SQL Editor.

---

## 🧪 Automated Test Suite

Run the built-in test suite to verify all business rules, slot calculation engine, price freezing, and authentication:
```bash
cd server
npx tsx src/test-workflows.ts
```
Expected output:
```
========================================================
TEST RESULTS: 15 passed, 0 failed
========================================================
```

---

## 📦 Production Deployment

### Option A: Unified Full-Stack Node.js Deployment (Render, Railway, Heroku, VPS)
The Express backend is pre-configured to automatically serve the compiled React client in production:
```bash
# 1. Build client and server:
npm run build

# 2. Start production server:
npm run start --prefix server
```
Your full-stack app will be live on port `5000` (or `process.env.PORT`).

### Option B: Decoupled Deployment
- **Frontend**: Deploy `client/` to Vercel, Netlify, or Firebase Hosting. Set `VITE_API_URL` to your backend URL.
- **Backend**: Deploy `server/` to Render, Railway, AWS, or Google Cloud Run. Set `CLIENT_URL` to your frontend domain.

---

## 📄 License
MIT License. Built for local beauty parlour businesses.
