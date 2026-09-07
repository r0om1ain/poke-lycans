import { prisma } from '../config/prisma.js';
import { buildExemplarWhere } from '../lib/characteristics.js';

const fullInclude = {
  product: { include: { series: true, category: true } },
  seller: true,
  language: true,
  gradingCompany: true,
  order: { select: { id: true } },
  _count: { select: { bids: true } },
};

export const auctionModel = {
  findById(id) {
    return prisma.auction.findUnique({
      where: { id },
      include: {
        ...fullInclude,
        bids: { include: { user: true }, orderBy: { amount: 'desc' }, take: 10 },
      },
    });
  },

  create(data) {
    return prisma.auction.create({ data, include: fullInclude });
  },

  // Page Enchères (§37-39) : tri par fin la plus proche par défaut.
  async list({ categoryId, seriesId, name, page = 1, pageSize = 24, ...characteristics } = {}) {
    const where = {
      status: 'ACTIVE',
      ...(categoryId ? { product: { categoryId } } : {}),
      ...(seriesId ? { product: { seriesId } } : {}),
      ...(name ? { product: { name: { contains: name, mode: 'insensitive' } } } : {}),
      ...buildExemplarWhere(characteristics),
    };
    const [items, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        include: fullInclude,
        orderBy: { endAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auction.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },

  // Enchères se terminant bientôt, pour l'accueil (§11)
  endingSoon(limit = 6) {
    return prisma.auction.findMany({
      where: { status: 'ACTIVE' },
      include: fullInclude,
      orderBy: { endAt: 'asc' },
      take: limit,
    });
  },

  countActiveForProduct(productId) {
    return prisma.auction.count({ where: { productId, status: 'ACTIVE' } });
  },

  findByUser(userId) {
    return prisma.auction.findMany({
      where: { sellerId: userId },
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  findParticipatedByUser(userId) {
    return prisma.auction.findMany({
      where: { bids: { some: { userId } } },
      include: fullInclude,
      orderBy: { endAt: 'asc' },
    });
  },

  // Place une enchère de façon atomique : vérifie le montant courant puis met
  // à jour currentPrice + insère le Bid, dans la même transaction (specs §45).
  placeBid(auctionId, userId, amount) {
    return prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({ where: { id: auctionId } });
      if (!auction) throw new Error('AUCTION_NOT_FOUND');
      if (auction.status !== 'ACTIVE') throw new Error('AUCTION_NOT_ACTIVE');
      if (auction.endAt <= new Date()) throw new Error('AUCTION_ENDED');
      if (Number(amount) <= Number(auction.currentPrice)) throw new Error('BID_TOO_LOW');

      const bid = await tx.bid.create({ data: { auctionId, userId, amount }, include: { user: true } });
      await tx.auction.update({ where: { id: auctionId }, data: { currentPrice: amount } });
      return bid;
    });
  },

  findExpiredActive() {
    return prisma.auction.findMany({
      where: { status: 'ACTIVE', endAt: { lte: new Date() } },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1, include: { user: true } } },
    });
  },

  // Clôture une enchère : si un plus-offrant existe et que le prix de réserve
  // (s'il existe) est atteint, il devient le gagnant (specs §43-45). La
  // création de la commande associée est faite par orderModel/orderService,
  // ici on se contente de figer le gagnant sur l'enchère.
  markEnded(id, { winnerId, winningBidId } = {}) {
    return prisma.auction.update({
      where: { id },
      data: { status: 'ENDED', winnerId: winnerId ?? null, winningBidId: winningBidId ?? null },
    });
  },

  attachOrder(auctionId, orderId) {
    return prisma.auction.update({ where: { id: auctionId }, data: { order: { connect: { id: orderId } } } });
  },
};
