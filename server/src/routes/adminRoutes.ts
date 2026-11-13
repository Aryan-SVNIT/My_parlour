import { Router } from 'express';
import {
  createCategory,
  createGalleryItem,
  createHoliday,
  createManualAppointment,
  createOffer,
  createService,
  createStaff,
  deleteAppointment,
  deleteCategory,
  deleteGalleryItem,
  deleteHoliday,
  deleteOffer,
  deleteReview,
  deleteService,
  deleteStaff,
  exportAppointmentsCsv,
  getAdminGallery,
  getAdminOffers,
  getAdminReviews,
  getAdminServices,
  getAdminSettings,
  getAppointments,
  getBusinessHours,
  getCustomers,
  getDashboardStats,
  getReports,
  getStaffList,
  rescheduleAppointment,
  toggleReviewApproval,
  updateAppointmentStatus,
  updateBusinessHours,
  updateCategory,
  updateCustomer,
  updateGalleryItem,
  updateOffer,
  updateService,
  updateStaff,
  updateWebsiteSettings,
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

// Dashboard Overview
router.get('/stats', getDashboardStats);

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments/manual', createManualAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.patch('/appointments/:id/reschedule', rescheduleAppointment);
router.delete('/appointments/:id', deleteAppointment);

// Services & Categories
router.get('/services', getAdminServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Customers
router.get('/customers', getCustomers);
router.put('/customers/:id', updateCustomer);

// Staff
router.get('/staff', getStaffList);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// Business Hours & Holidays
router.get('/business-hours', getBusinessHours);
router.put('/business-hours', updateBusinessHours);
router.post('/holidays', createHoliday);
router.delete('/holidays/:id', deleteHoliday);

// Offers & Packages
router.get('/offers', getAdminOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

// Gallery
router.get('/gallery', getAdminGallery);
router.post('/gallery', createGalleryItem);
router.put('/gallery/:id', updateGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);

// Reviews
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/approve', toggleReviewApproval);
router.delete('/reviews/:id', deleteReview);

// Website Settings
router.get('/settings', getAdminSettings);
router.put('/settings', updateWebsiteSettings);

// Reports & CSV
router.get('/reports', getReports);
router.get('/reports/export-csv', exportAppointmentsCsv);

export default router;

