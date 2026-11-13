import { Router } from 'express';
import {
  bookAppointment,
  cancelCustomerBooking,
  checkAvailability,
  getPublicCategories,
  getPublicGallery,
  getPublicOffers,
  getPublicReviews,
  getPublicServices,
  getPublicSettings,
  submitReview,
  trackBooking,
} from '../controllers/publicController.js';

const router = Router();

router.get('/settings', getPublicSettings);
router.get('/categories', getPublicCategories);
router.get('/services', getPublicServices);
router.get('/offers', getPublicOffers);
router.get('/gallery', getPublicGallery);
router.get('/reviews', getPublicReviews);
router.post('/reviews', submitReview);
router.get('/availability', checkAvailability);
router.post('/book', bookAppointment);
router.get('/track-booking', trackBooking);
router.post('/cancel-booking', cancelCustomerBooking);

export default router;

