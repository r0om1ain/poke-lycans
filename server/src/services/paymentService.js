// Point d'intégration paiement. En v1 il n'y a pas de prestataire réel
// branché : le paiement est simulé (specs ne détaillent pas de prestataire).
// Pour brancher un vrai prestataire (Stripe, etc.) plus tard, remplacer le
// corps de `charge` par un appel réel et propager les erreurs de paiement.
export const paymentService = {
  async charge({ orderId, amount, paymentMethodId }) {
    return { success: true, orderId, amount, paymentMethodId, mock: true };
  },
};
