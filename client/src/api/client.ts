import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aashmi_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('aashmi_admin_token');
        localStorage.removeItem('aashmi_admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Public API endpoints
export const publicApi = {
  getSettings: () => api.get('/public/settings'),
  getCategories: () => api.get('/public/categories'),
  getServices: (params?: { category?: string; search?: string }) => api.get('/public/services', { params }),
  getOffers: () => api.get('/public/offers'),
  getGallery: (category?: string) => api.get('/public/gallery', { params: { category } }),
  getReviews: () => api.get('/public/reviews'),
  submitReview: (data: any) => api.post('/public/reviews', data),
  getAvailability: (date: string, duration: number, staffId?: string) =>
    api.get('/public/availability', { params: { date, duration, staffId } }),
  bookAppointment: (bookingData: any) => api.post('/public/book', bookingData),
  trackBooking: (booking_id: string, phone?: string) =>
    api.get('/public/track-booking', { params: { booking_id, phone } }),
  cancelBooking: (data: { booking_id: string; phone: string; reason?: string }) =>
    api.post('/public/cancel-booking', data),
};

// Admin API endpoints
export const adminApi = {
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: any) => api.put('/auth/change-password', data),

  getStats: () => api.get('/admin/stats'),

  getAppointments: (params?: { status?: string; date?: string; search?: string }) =>
    api.get('/admin/appointments', { params }),
  createManualAppointment: (data: any) => api.post('/admin/appointments/manual', data),
  updateAppointmentStatus: (id: string, data: any) => api.patch(`/admin/appointments/${id}/status`, data),
  rescheduleAppointment: (id: string, data: any) => api.patch(`/admin/appointments/${id}/reschedule`, data),
  deleteAppointment: (id: string) => api.delete(`/admin/appointments/${id}`),

  getServices: () => api.get('/admin/services'),
  createService: (data: any) => api.post('/admin/services', data),
  updateService: (id: string, data: any) => api.put(`/admin/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`),

  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  getCustomers: (search?: string) => api.get('/admin/customers', { params: { search } }),
  updateCustomer: (id: string, data: any) => api.put(`/admin/customers/${id}`, data),

  getStaff: () => api.get('/admin/staff'),
  createStaff: (data: any) => api.post('/admin/staff', data),
  updateStaff: (id: string, data: any) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id: string) => api.delete(`/admin/staff/${id}`),

  getBusinessHours: () => api.get('/admin/business-hours'),
  updateBusinessHours: (data: any) => api.put('/admin/business-hours', data),
  createHoliday: (data: any) => api.post('/admin/holidays', data),
  deleteHoliday: (id: string) => api.delete(`/admin/holidays/${id}`),

  getOffers: () => api.get('/admin/offers'),
  createOffer: (data: any) => api.post('/admin/offers', data),
  updateOffer: (id: string, data: any) => api.put(`/admin/offers/${id}`, data),
  deleteOffer: (id: string) => api.delete(`/admin/offers/${id}`),

  getGallery: () => api.get('/admin/gallery'),
  createGalleryItem: (data: any) => api.post('/admin/gallery', data),
  updateGalleryItem: (id: string, data: any) => api.put(`/admin/gallery/${id}`, data),
  deleteGalleryItem: (id: string) => api.delete(`/admin/gallery/${id}`),

  getReviews: () => api.get('/admin/reviews'),
  toggleReviewApproval: (id: string) => api.patch(`/admin/reviews/${id}/approve`),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),

  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),

  getReports: () => api.get('/admin/reports'),
  exportCsvUrl: `${API_BASE_URL}/admin/reports/export-csv`,
};
