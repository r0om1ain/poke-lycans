import { api } from './client.js';

export const cartApi = {
  get: () => api.get('/api/cart'),
  add: (listingId, quantity = 1) => api.post('/api/cart/items', { listingId, quantity }),
  updateQuantity: (id, quantity) => api.patch(`/api/cart/items/${id}`, { quantity }),
  remove: (id) => api.del(`/api/cart/items/${id}`),
};
