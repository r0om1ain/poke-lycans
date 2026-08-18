import { api, toQuery } from './client.js';

export const listingsApi = {
  forProduct: (productId, filters) => api.get(`/api/listings/product/${productId}${toQuery(filters)}`),
  mine: (params) => api.get(`/api/listings/mine${toQuery(params)}`),
  create: (data) => api.post('/api/listings', data),
  remove: (id) => api.del(`/api/listings/${id}`),
};
