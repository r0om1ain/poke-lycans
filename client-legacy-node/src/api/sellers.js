import { api, toQuery } from './client.js';

export const sellersApi = {
  profile: (id) => api.get(`/api/sellers/${id}`),
  listings: (id, params) => api.get(`/api/sellers/${id}/listings${toQuery(params)}`),
  reviews: (id, params) => api.get(`/api/sellers/${id}/reviews${toQuery(params)}`),
  shippingMethods: (id) => api.get(`/api/sellers/${id}/shipping-methods`),
};
