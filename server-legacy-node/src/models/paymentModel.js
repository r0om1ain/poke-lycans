import { prisma } from '../config/prisma.js';

export const paymentModel = {
  create(data) {
    return prisma.payment.create({ data });
  },

  findByOrderId(orderId) {
    return prisma.payment.findUnique({ where: { orderId } });
  },

  markSucceeded(id, transactionId) {
    return prisma.payment.update({
      where: { id },
      data: { status: 'SUCCEEDED', transactionId, paidAt: new Date() },
    });
  },

  markFailed(id) {
    return prisma.payment.update({ where: { id }, data: { status: 'FAILED' } });
  },
};
