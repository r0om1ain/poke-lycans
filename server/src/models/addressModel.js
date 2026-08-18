import { prisma } from '../config/prisma.js';

export const addressModel = {
  listByUser(userId) {
    return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  },
  findById(id) {
    return prisma.address.findUnique({ where: { id } });
  },
  async create(userId, data) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { ...data, userId } });
  },
  async update(id, userId, data) {
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.update({ where: { id }, data });
  },
  remove(id) {
    return prisma.address.delete({ where: { id } });
  },
};
