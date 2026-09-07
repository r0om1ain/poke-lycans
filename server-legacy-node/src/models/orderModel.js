import { prisma } from '../config/prisma.js';
import { EXEMPLAR_FIELDS } from '../lib/characteristics.js';

const fullInclude = {
  address: true,
  shippingMethod: true,
  buyer: true,
  seller: true,
  payment: true,
  items: { include: { language: true, gradingCompany: true } },
};

// `listing` ici désigne tout modèle porteur des mêmes champs d'exemplaire
// (Listing ou Auction) — voir EXEMPLAR_FIELDS.
function snapshotExemplar(listing) {
  const snapshot = {};
  for (const key of EXEMPLAR_FIELDS) snapshot[key] = listing[key] ?? null;
  return snapshot;
}

export const orderModel = {
  findById(id) {
    return prisma.order.findUnique({ where: { id }, include: fullInclude });
  },

  // Panier groupé par vendeur => une commande par vendeur (specs §31-36).
  // `cartItems` : lignes du panier (avec listing chargé) pour UN SEUL vendeur.
  // `shippingMethod` : ShippingMethod choisi pour ce bloc vendeur (§35-36).
  //
  // Si une négociation de prix acceptée existe pour (listing, buyer) — specs
  // §29-30 — le prix négocié remplace le prix affiché, et l'offre est
  // marquée USED dans la même transaction pour ne jamais pouvoir resservir.
  createOrderForSeller({ buyerId, sellerId, addressId, shippingMethod, cartItems }) {
    return prisma.$transaction(async (tx) => {
      const effectivePrices = new Map();
      for (const item of cartItems) {
        const usableOffer = await tx.priceOffer.findFirst({
          where: {
            listingId: item.listing.id,
            buyerId,
            status: 'ACCEPTED',
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          orderBy: { acceptedAt: 'desc' },
        });
        if (usableOffer) {
          const { count } = await tx.priceOffer.updateMany({
            where: { id: usableOffer.id, status: 'ACCEPTED' },
            data: { status: 'USED', usedAt: new Date() },
          });
          if (count === 1) effectivePrices.set(item.listing.id, Number(usableOffer.amount));
        }
      }

      const priceFor = (item) => effectivePrices.get(item.listing.id) ?? Number(item.listing.price);

      const subtotal = cartItems.reduce((sum, item) => sum + priceFor(item) * item.quantity, 0);
      const shippingCost = shippingMethod ? Number(shippingMethod.price) : 0;
      const total = subtotal + shippingCost;

      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId,
          addressId,
          shippingMethodId: shippingMethod?.id,
          shippingMethodSnapshot: shippingMethod?.name,
          subtotal,
          shippingCost,
          total,
          items: {
            create: cartItems.map((item) => ({
              listingId: item.listing.id,
              productId: item.listing.productId,
              quantity: item.quantity,
              nameSnapshot: item.listing.product.name,
              priceSnapshot: priceFor(item),
              ...snapshotExemplar(item.listing),
            })),
          },
        },
        include: fullInclude,
      });

      for (const item of cartItems) {
        const remaining = item.listing.quantity - item.quantity;
        await tx.listing.update({
          where: { id: item.listing.id },
          data: {
            quantity: Math.max(remaining, 0),
            status: remaining <= 0 ? 'SOLD' : 'ACTIVE',
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { id: { in: cartItems.map((i) => i.id) } } });

      return order;
    });
  },

  // Une enchère remportée devient directement une commande "À payer" côté
  // acheteur / "En attente de paiement" côté vendeur (specs §44-45, §57-61).
  createOrderForAuctionWin({ auction, buyerId, addressId, shippingMethod }) {
    return prisma.$transaction(async (tx) => {
      const subtotal = Number(auction.currentPrice);
      const shippingCost = shippingMethod ? Number(shippingMethod.price) : 0;

      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId: auction.sellerId,
          addressId,
          shippingMethodId: shippingMethod?.id,
          shippingMethodSnapshot: shippingMethod?.name,
          auctionId: auction.id,
          subtotal,
          shippingCost,
          total: subtotal + shippingCost,
          items: {
            create: [
              {
                productId: auction.productId,
                quantity: 1,
                nameSnapshot: auction.product.name,
                priceSnapshot: auction.currentPrice,
                ...snapshotExemplar(auction),
              },
            ],
          },
        },
        include: fullInclude,
      });

      return order;
    });
  },

  async listByBuyer(buyerId, { status } = {}) {
    return prisma.order.findMany({
      where: { buyerId, ...(status ? { status } : {}) },
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async listBySeller(sellerId, { status } = {}) {
    return prisma.order.findMany({
      where: { sellerId, ...(status ? { status } : {}) },
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async countsByStatus(where) {
    const rows = await prisma.order.groupBy({ by: ['status'], where, _count: true });
    const counts = { AWAITING_PAYMENT: 0, PAID: 0, SHIPPED: 0, DELIVERED: 0 };
    for (const row of rows) counts[row.status] = row._count;
    return counts;
  },

  // Statut unique partagé acheteur/vendeur (specs §61) : une seule mise à
  // jour, visible immédiatement des deux côtés puisque c'est le même Order.
  updateStatus(id, status) {
    return prisma.order.update({ where: { id }, data: { status }, include: fullInclude });
  },
};
