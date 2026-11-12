import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { AdminLayout } from './layouts/AdminLayout';
import { CustomerLayout } from './layouts/CustomerLayout';

// Customer Pages
import { AboutPage } from './pages/customer/AboutPage';
import { BookAppointmentPage } from './pages/customer/BookAppointmentPage';
import { ContactPage } from './pages/customer/ContactPage';
import { GalleryPage } from './pages/customer/GalleryPage';
import { HomePage } from './pages/customer/HomePage';
import { OffersPage } from './pages/customer/OffersPage';
import { ServicesPage } from './pages/customer/ServicesPage';

// Admin Pages
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminBusinessHoursPage } from './pages/admin/AdminBusinessHoursPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOffersPage } from './pages/admin/AdminOffersPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminStaffPage } from './pages/admin/AdminStaffPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            {/* Customer Website Routes */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<HomePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="book" element={<BookAppointmentPage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="appointments" element={<AdminAppointmentsPage />} />
              <Route path="services" element={<AdminServicesPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="business-hours" element={<AdminBusinessHoursPage />} />
              <Route path="offers" element={<AdminOffersPage />} />
              <Route path="gallery" element={<AdminGalleryPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
