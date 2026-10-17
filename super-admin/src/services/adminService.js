import { api } from './apiClient';

export const adminService = {
  // Authentication
  login: async (credentials) => api.post('/admin/auth/login', credentials),
  logout: async () => api.post('/admin/auth/logout'),
  getMe: async () => api.get('/admin/auth/me'),

  // Dashboard & Analytics
  getDashboard: async () => api.get('/admin/dashboard'),

  // Orders
  getOrders: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/orders/admin/list${q ? `?${q}` : ''}`);
  },
  getOrderById: async (id) => api.get(`/orders/admin/${id}`),
  updateOrderStatus: async (id, data) => api.patch(`/orders/admin/${id}/status`, data),
  deleteOrder: async (id) => api.delete(`/orders/admin/${id}`),
  exportOrdersCSV: async () => api.get('/orders/admin/export-csv'),

  // Products
  getProducts: async () => api.get('/products/admin/all'),
  updateProduct: async (id, data) => api.patch(`/products/admin/${id}`, data),

  // Customers
  getCustomers: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/customers${q ? `?${q}` : ''}`);
  },

  // Payments & Refunds
  getPayments: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/payments/admin/list${q ? `?${q}` : ''}`);
  },
  reconcilePayment: async (id) => api.post(`/payments/admin/${id}/reconcile`),
  refundPayment: async (id, data) => api.post(`/payments/admin/${id}/refund`, data),
  getRefunds: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/refunds${q ? `?${q}` : ''}`);
  },

  // Brevo Email Logs
  getEmailLogs: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/email-logs${q ? `?${q}` : ''}`);
  },
  retryEmail: async (id) => api.post(`/admin/email-logs/${id}/retry`),

  // Content Management
  getContent: async () => api.get('/admin/content'),
  updateContent: async (data) => api.patch('/admin/content', data),

  // Staff User Management
  getUsers: async () => api.get('/admin/users'),
  createUser: async (data) => api.post('/admin/users', data),
  updateUser: async (id, data) => api.patch(`/admin/users/${id}`, data),

  // Settings
  getSettings: async () => api.get('/admin/settings'),
  updateSetting: async (key, data) => api.patch(`/admin/settings/${key}`, data),

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/admin/audit-logs${q ? `?${q}` : ''}`);
  }
};
