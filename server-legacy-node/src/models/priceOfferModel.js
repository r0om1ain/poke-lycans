import { prisma } from '../config/prisma.js';

// Négociation de prix (specs §29-30), séparée des Message pour garantir
// qu'une offre acceptée est : liée à UN acheteur + UNE offre de vente, encore
// valide, et utilisable une seule fois.
export const priceOfferModel = {
  findById(id) {
    return prisma.priceOffer.findUnique({ where: { id } });
  },

  create(data) {
    return prisma.priceOffer.create({ data });
  },

  accept(id) {
    return prisma.priceOffer.update({
      where: { id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });
  },

  refuse(id) {
    return prisma.priceOffer.update({ where: { id }, data: { status: 'REFUSED' } });
  },

  // La seule offre exploitable pour acheter au prix négocié : acceptée,
  // pas expirée, pas déjà utilisée (§30).
  findUsableForBuyer(listingId, buyerId) {
    return prisma.priceOffer.findFirst({
      where: {
        listingId,
        buyerId,
        status: 'ACCEPTED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { acceptedAt: 'desc' },
    });
  },

  // Marque l'offre comme utilisée de façon atomique : ne réussit que si elle
  // était encore ACCEPTED, empêchant toute double utilisation concurrente.
  async markUsed(id) {
    const { count } = await prisma.priceOffer.updateMany({
      where: { id, status: 'ACCEPTED' },
      data: { status: 'USED', usedAt: new Date() },
    });
    return count === 1;
  },

  listByListing(listingId) {
    return prisma.priceOffer.findMany({ where: { listingId }, orderBy: { createdAt: 'desc' } });
  },
};
