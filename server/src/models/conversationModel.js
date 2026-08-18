import { prisma } from '../config/prisma.js';

const fullInclude = {
  buyer: true,
  seller: true,
  listing: { include: { product: { include: { series: true, category: true } }, seller: true } },
  auction: { include: { product: { include: { series: true, category: true } }, seller: true } },
};

export const conversationModel = {
  findById(id) {
    return prisma.conversation.findUnique({ where: { id }, include: fullInclude });
  },

  // Une conversation liée à une offre, une enchère ou une commande précise
  // reste distincte d'une conversation générale avec le même vendeur (§27, §64).
  async findOrCreate({ buyerId, sellerId, listingId, auctionId, orderId }) {
    const existing = await prisma.conversation.findFirst({
      where: {
        buyerId,
        sellerId,
        listingId: listingId ?? null,
        auctionId: auctionId ?? null,
        orderId: orderId ?? null,
      },
      include: fullInclude,
    });
    if (existing) return existing;
    return prisma.conversation.create({
      data: { buyerId, sellerId, listingId, auctionId, orderId },
      include: fullInclude,
    });
  },

  listByUser(userId) {
    return prisma.conversation.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: { ...fullInclude, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
  },

  isParticipant(conversation, userId) {
    return conversation.buyerId === userId || conversation.sellerId === userId;
  },
};

export const messageModel = {
  listByConversation(conversationId) {
    return prisma.message.findMany({
      where: { conversationId },
      include: { priceOffer: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  create(data) {
    return prisma.message.create({ data, include: { priceOffer: true } });
  },

  findById(id) {
    return prisma.message.findUnique({ where: { id } });
  },
};
