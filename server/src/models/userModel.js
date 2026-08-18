import { prisma } from '../config/prisma.js';

export const userModel = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },
  findByUsername(username) {
    return prisma.user.findUnique({ where: { username } });
  },
  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },
  create(data) {
    return prisma.user.create({ data });
  },
  updateProfile(id, data) {
    return prisma.user.update({ where: { id }, data });
  },
  // Décompte des articles actuellement en vente par catégorie : voir
  // listingModel.countsByCategoryForSeller (specs §23).
  salesCount(userId) {
    return prisma.order.count({ where: { sellerId: userId, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } } });
  },
};
