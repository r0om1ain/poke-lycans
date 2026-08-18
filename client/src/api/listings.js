import { api, toQuery } from './client.js';

export const listingsApi = {
  forProduct: (productId, filters) => api.get(`/api/listings/product/${productId}${toQuery(filters)}`),
  mine: (params) => api.get(`/api/listings/mine${toQuery(params)}`),
  myFacets: (categoryId) => api.get(`/api/listings/mine/facets${toQuery({ categoryId })}`),
  create: (data) => api.post('/api/listings', data),
  update: (id, data) => api.patch(`/api/listings/${id}`, data),
  remove: (id) => api.del(`/api/listings/${id}`),
};
