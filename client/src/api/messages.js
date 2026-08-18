import { api } from './client.js';

export const messagesApi = {
  conversations: () => api.get('/api/messages/conversations'),
  contact: (data) => api.post('/api/messages/contact', data),
  messages: (conversationId) => api.get(`/api/messages/conversations/${conversationId}/messages`),
  sendText: (conversationId, content) =>
    api.post(`/api/messages/conversations/${conversationId}/messages`, { content }),
  sendImage: (conversationId, formData) =>
    api.post(`/api/messages/conversations/${conversationId}/images`, formData, { isFormData: true }),
  makeOffer: (conversationId, amount) =>
    api.post(`/api/messages/conversations/${conversationId}/offers`, { amount }),
  respondOffer: (offerId, accept) => api.post(`/api/messages/offers/${offerId}/respond`, { accept }),
};
