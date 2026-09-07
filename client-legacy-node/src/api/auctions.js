import { api, toQuery } from './client.js';

export const auctionsApi = {
  list: (params) => api.get(`/api/auctions${toQuery(params)}`),
  detail: (id) => api.get(`/api/auctions/${id}`),
  create: (formData) => api.post('/api/auctions', formData, { isFormData: true }),
  placeBid: (id, amount) => api.post(`/api/auctions/${id}/bids`, { amount }),
  finalizePurchase: (id, data) => api.post(`/api/auctions/${id}/finalize`, data),
  mine: () => api.get('/api/auctions/mine/all'),
};
