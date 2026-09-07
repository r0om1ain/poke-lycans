import { api, toQuery } from './client.js';

export const collectionApi = {
  list: (seriesId) => api.get(`/api/collection${toQuery({ seriesId })}`),
  create: (data) => api.post('/api/collection', data),
  update: (id, data) => api.patch(`/api/collection/${id}`, data),
  remove: (id) => api.del(`/api/collection/${id}`),
  progress: () => api.get('/api/collection/progress'),
  totalValue: () => api.get('/api/collection/value'),
  estimatedValue: (id) => api.get(`/api/collection/${id}/estimate`),
  sell: (id, data) => api.post(`/api/collection/${id}/sell`, data),
};
