import { api } from './apiClient';

export const customerAuthService = {
  register: async ({ name, email, phone, password }) => {
    return api.post('/auth/register', { name, email, phone, password });
  },

  login: async ({ identifier, password }) => {
    return api.post('/auth/login', { identifier, password });
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  getMyOrders: async () => {
    return api.get('/auth/my-orders');
  }
};

export default customerAuthService;
