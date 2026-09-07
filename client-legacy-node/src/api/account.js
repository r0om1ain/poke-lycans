import { api } from './client.js';

export const accountApi = {
  updateProfile: (data) => api.patch('/api/account/profile', data),

  listAddresses: () => api.get('/api/account/addresses'),
  createAddress: (data) => api.post('/api/account/addresses', data),
  updateAddress: (id, data) => api.patch(`/api/account/addresses/${id}`, data),
  removeAddress: (id) => api.del(`/api/account/addresses/${id}`),

  listPaymentMethods: () => api.get('/api/account/payment-methods'),
  createPaymentMethod: (data) => api.post('/api/account/payment-methods', data),
  removePaymentMethod: (id) => api.del(`/api/account/payment-methods/${id}`),

  listShippingMethods: () => api.get('/api/account/shipping-methods'),
  createShippingMethod: (data) => api.post('/api/account/shipping-methods', data),
  updateShippingMethod: (id, data) => api.patch(`/api/account/shipping-methods/${id}`, data),
  removeShippingMethod: (id) => api.del(`/api/account/shipping-methods/${id}`),
};
