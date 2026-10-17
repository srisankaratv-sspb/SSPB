import { api } from './apiClient';

export const adminService = {
  login: async (credentials) => {
    return api.post('/admin/auth/login', credentials);
  },

  logout: async () => {
    return api.post('/admin/auth/logout');
  },

  getMe: async () => {
    return api.get('/admin/auth/me');
  },

  getDashboard: async () => {
    return api.get('/admin/dashboard');
  },

  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/orders/admin/list${query ? `?${query}` : ''}`);
  },

  getOrderById: async (id) => {
    return api.get(`/orders/admin/${id}`);
  },

  updateOrderStatus: async (id, data) => {
    return api.patch(`/orders/admin/${id}/status`, data);
  },

  deleteOrder: async (id) => {
    return api.delete(`/orders/admin/${id}`);
  },

  exportOrdersCSV: async () => {
    return api.get('/orders/admin/export-csv');
  },

  getPayments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/payments/admin/list${query ? `?${query}` : ''}`);
  },

  reconcilePayment: async (id) => {
    return api.post(`/payments/admin/${id}/reconcile`);
  },

  refundPayment: async (id, data) => {
    return api.post(`/payments/admin/${id}/refund`, data);
  },

  getProducts: async () => {
    return api.get('/products/admin/all');
  },

  updateProduct: async (id, data) => {
    return api.patch(`/products/admin/${id}`, data);
  },

  getCustomers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/customers${query ? `?${query}` : ''}`);
  },

  getEmailLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/email-logs${query ? `?${query}` : ''}`);
  },

  retryEmail: async (id) => {
    return api.post(`/admin/email-logs/${id}/retry`);
  },

  getAdminUsers: async () => {
    return api.get('/admin/users');
  },

  createAdminUser: async (data) => {
    return api.post('/admin/users', data);
  },

  updateAdminUser: async (id, data) => {
    return api.patch(`/admin/users/${id}`, data);
  },

  getSettings: async () => {
    return api.get('/admin/settings');
  },

  updateSetting: async (key, data) => {
    return api.patch(`/admin/settings/${key}`, data);
  }
};
