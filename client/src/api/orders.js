import { api, toQuery } from './client.js';

export const ordersApi = {
  checkout: (data) => api.post('/api/orders/checkout', data),
  purchases: (status) => api.get(`/api/orders/purchases${toQuery({ status })}`),
  sales: (status) => api.get(`/api/orders/sales${toQuery({ status })}`),
  detail: (id) => api.get(`/api/orders/${id}`),
  pay: (id, data) => api.post(`/api/orders/${id}/pay`, data),
  ship: (id) => api.post(`/api/orders/${id}/ship`),
  receive: (id) => api.post(`/api/orders/${id}/receive`),
  review: (id, data) => api.post(`/api/orders/${id}/review`, data),
};
