import { prisma } from '../config/prisma.js';

const fullInclude = {
  listing: { include: { product: { include: { series: true } }, seller: true } },
};

export const cartModel = {
  listByUser(userId) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: fullInclude,
      orderBy: { createdAt: 'asc' },
    });
  },

  async addOrIncrement(userId, listingId, quantity = 1) {
    const existing = await prisma.cartItem.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: fullInclude,
      });
    }
    return prisma.cartItem.create({ data: { userId, listingId, quantity }, include: fullInclude });
  },

  updateQuantity(id, quantity) {
    return prisma.cartItem.update({ where: { id }, data: { quantity }, include: fullInclude });
  },

  findById(id) {
    return prisma.cartItem.findUnique({ where: { id }, include: fullInclude });
  },

  remove(id) {
    return prisma.cartItem.delete({ where: { id } });
  },

  removeMany(ids) {
    return prisma.cartItem.deleteMany({ where: { id: { in: ids } } });
  },

  clearForUser(userId) {
    return prisma.cartItem.deleteMany({ where: { userId } });
  },
};
