import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (params?: any) => api.get('/admin/users', { params }),
  getAllCompanies: (params?: any) => api.get('/admin/companies', { params }),
  verifyCompany: (id: string, data: any) => api.put(`/admin/companies/${id}/verify`, data),
  updateUserStatus: (id: string, data: any) => api.put(`/admin/users/${id}/status`, data),
  getRevenue: () => api.get('/admin/revenue'),
};

export const logisticsAPI = {
  getDashboard: () => api.get('/logistics/dashboard'),
  addContainer: (data: any) => api.post('/containers', data),
  getContainers: () => api.get('/containers/my/containers'),
  updateContainer: (id: string, data: any) => api.put(`/containers/${id}`, data),
  deleteContainer: (id: string) => api.delete(`/containers/${id}`),
  updateContainerStatus: (id: string, data: any) => api.put(`/containers/${id}/status`, data),
  getBookingRequests: () => api.get('/bookings/company'),
  acceptBooking: (id: string) => api.put(`/bookings/${id}/accept`),
  rejectBooking: (id: string) => api.put(`/bookings/${id}/reject`),
  counterOffer: (id: string, data: any) => api.put(`/bookings/${id}/counter`, data),
  seedData: () => api.post('/logistics/seed'),
};

export const customerAPI = {
  getDashboard: () => api.get('/customer/dashboard'),
  searchContainers: (params?: any) => api.get('/containers/search', { params }),
  getContainerDetails: (id: string) => api.get(`/containers/${id}`),
  createBooking: (data: any) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  acceptQuotation: (id: string) => api.put(`/bookings/${id}/accept-quotation`),
  cancelBooking: (id: string) => api.put(`/bookings/${id}/cancel`),
  confirmPayment: (data: any) => api.put('/bookings/confirm-payment', data),
  addReview: (data: any) => api.post('/reviews', data),
  seedData: () => api.post('/customer/seed'),
};

export const paymentAPI = {
  createOrder: (data: any) => api.post('/payments/create-order', data),
  verifyPayment: (data: any) => api.post('/payments/verify', data),
  getMyPayments: () => api.get('/payments/my'),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId: string) => api.get(`/chat/${conversationId}`),
  sendMessage: (data: any) => api.post(`/chat/send`, data),
  markAsRead: (data: { conversationId: string }) => api.put(`/chat/read`, data),
  deleteMessage: (id: string) => api.delete(`/chat/message/${id}`),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const documentAPI = {
  uploadDocument: (data: any) => api.post('/documents/upload', data),
  getMyDocuments: () => api.get('/documents/my'),
};

export const reviewAPI = {
  getReviews: (companyId: string) => api.get(`/reviews/${companyId}`),
  replyToReview: (id: string, data: any) => api.put(`/reviews/${id}/reply`, data),
};

export const disputeAPI = {
  createDispute: (data: any) => api.post('/disputes', data),
  getDisputes: () => api.get('/disputes'),
  addMessage: (id: string, data: any) => api.put(`/disputes/${id}/messages`, data),
};

export const analyticsAPI = {
  getAdminAnalytics: () => api.get('/analytics/admin'),
  getCompanyAnalytics: (companyId: string) => api.get(`/analytics/company/${companyId}`),
};

export default api;
