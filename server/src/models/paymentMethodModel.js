import { prisma } from '../config/prisma.js';

export const paymentMethodModel = {
  listByUser(userId) {
    return prisma.paymentMethod.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  },
  async create(userId, data) {
    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.paymentMethod.create({ data: { ...data, userId } });
  },
  remove(id) {
    return prisma.paymentMethod.delete({ where: { id } });
  },
  findById(id) {
    return prisma.paymentMethod.findUnique({ where: { id } });
  },
};
