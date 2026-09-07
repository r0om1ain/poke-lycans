import { api } from './client';
import type { Conversation, Message, OffrePrix } from '@/types';

export const messagesApi = {
  conversations: () => api.get<Conversation[]>('/api/messages/conversations'),
  contact: (data: { idPersonneVendeur?: number; idAnnonce?: number; idEnchere?: number; idCommande?: number }) =>
    api.post<Conversation>('/api/messages/contact', data),
  messages: (conversationId: number) => api.get<Message[]>(`/api/messages/conversations/${conversationId}/messages`),
  sendText: (conversationId: number, contenu: string) =>
    api.post<Message>(`/api/messages/conversations/${conversationId}/messages`, { contenu }),
  sendImage: (conversationId: number, formData: FormData) =>
    api.post<Message>(`/api/messages/conversations/${conversationId}/images`, formData, { isFormData: true }),
  makeOffer: (conversationId: number, montant: number) =>
    api.post<Message>(`/api/messages/conversations/${conversationId}/offers`, { montant }),
  respondOffer: (offerId: number, accept: boolean) => api.post<OffrePrix>(`/api/messages/offers/${offerId}/respond`, { accept }),
};
