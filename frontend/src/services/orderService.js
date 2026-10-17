import { api } from './apiClient';

export const orderService = {
  getPublicProduct: async (slug = 'soora-samhara-pooja-box-2026') => {
    return api.get(`/products/${slug}`);
  },

  createOrder: async ({ productSlug = 'soora-samhara-pooja-box-2026', quantity, customer }) => {
    return api.post('/orders', { productSlug, quantity, customer });
  },

  getOrderStatus: async (orderNumber) => {
    return api.get(`/orders/${orderNumber}/status`);
  }
};
