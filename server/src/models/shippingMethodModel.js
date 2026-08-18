import { prisma } from '../config/prisma.js';

export const shippingMethodModel = {
  listBySeller(sellerId, { activeOnly = false } = {}) {
    return prisma.shippingMethod.findMany({
      where: { sellerId, ...(activeOnly ? { active: true } : {}) },
      orderBy: { price: 'asc' },
    });
  },

  findById(id) {
    return prisma.shippingMethod.findUnique({ where: { id } });
  },

  create(sellerId, data) {
    return prisma.shippingMethod.create({ data: { ...data, sellerId } });
  },

  update(id, data) {
    return prisma.shippingMethod.update({ where: { id }, data });
  },

  remove(id) {
    return prisma.shippingMethod.delete({ where: { id } });
  },
};
