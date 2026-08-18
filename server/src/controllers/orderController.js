import { z } from 'zod';
import { cartModel } from '../models/cartModel.js';
import { orderModel } from '../models/orderModel.js';
import { addressModel } from '../models/addressModel.js';
import { shippingMethodModel } from '../models/shippingMethodModel.js';
import { paymentModel } from '../models/paymentModel.js';
import { reviewModel } from '../models/reviewModel.js';
import { paymentService } from '../services/paymentService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { badRequest, forbidden, notFound, conflict } from '../lib/httpError.js';
import { serializeOrder, serializeReview } from '../lib/serializers.js';

const checkoutSchema = z.object({
  addressId: z.string().min(1),
  shippingMethodBySeller: z.record(z.string(), z.string().nullable()).optional().default({}),
});

const reviewSchema = z.object({
  rating: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  comment: z.string().max(1000).optional(),
});

export const orderController = {
  // Panier → commandes, une par vendeur (specs §31-36)
  checkout: asyncHandler(async (req, res, next) => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const { addressId, shippingMethodBySeller } = parsed.data;

    const address = await addressModel.findById(addressId);
    if (!address || address.userId !== req.user.id) return next(notFound('Adresse introuvable'));

    const cartItems = await cartModel.listByUser(req.user.id);
    if (cartItems.length === 0) return next(badRequest('Panier vide'));

    const bySeller = new Map();
    for (const item of cartItems) {
      const sellerId = item.listing.sellerId;
      if (!bySeller.has(sellerId)) bySeller.set(sellerId, []);
      bySeller.get(sellerId).push(item);
    }

    const orders = [];
    for (const [sellerId, items] of bySeller) {
      let shippingMethod = null;
      const shippingMethodId = shippingMethodBySeller[sellerId];
      if (shippingMethodId) {
        shippingMethod = await shippingMethodModel.findById(shippingMethodId);
        if (!shippingMethod || shippingMethod.sellerId !== sellerId) {
          return next(badRequest('Mode de livraison invalide'));
        }
      }
      const order = await orderModel.createOrderForSeller({
        buyerId: req.user.id,
        sellerId,
        addressId,
        shippingMethod,
        cartItems: items,
      });
      orders.push(order);
    }

    res.status(201).json({ orders: orders.map((o) => serializeOrder(o, { perspective: 'buyer' })) });
  }),

  // Mes achats (specs §57-58)
  purchases: asyncHandler(async (req, res) => {
    const [orders, counts] = await Promise.all([
      orderModel.listByBuyer(req.user.id, { status: req.query.status }),
      orderModel.countsByStatus({ buyerId: req.user.id }),
    ]);
    res.json({ orders: orders.map((o) => serializeOrder(o, { perspective: 'buyer' })), counts });
  }),

  // Mes ventes (specs §59-60)
  sales: asyncHandler(async (req, res) => {
    const [orders, counts] = await Promise.all([
      orderModel.listBySeller(req.user.id, { status: req.query.status }),
      orderModel.countsByStatus({ sellerId: req.user.id }),
    ]);
    res.json({ orders: orders.map((o) => serializeOrder(o, { perspective: 'seller' })), counts });
  }),

  detail: asyncHandler(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) return next(notFound('Commande introuvable'));
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) return next(forbidden());
    const perspective = order.buyerId === req.user.id ? 'buyer' : 'seller';
    res.json({ order: serializeOrder(order, { perspective }) });
  }),

  // Paiement (mock — specs ne détaillent pas de prestataire, voir paymentService)
  pay: asyncHandler(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) return next(notFound('Commande introuvable'));
    if (order.buyerId !== req.user.id) return next(forbidden());
    if (order.status !== 'AWAITING_PAYMENT') return next(conflict('Commande déjà payée'));

    const result = await paymentService.charge({
      orderId: order.id,
      amount: order.total,
      paymentMethodId: req.body.paymentMethodId,
    });
    await paymentModel.create({
      orderId: order.id,
      provider: 'mock',
      transactionId: result.mock ? `mock_${order.id}` : undefined,
      amount: order.total,
      status: 'SUCCEEDED',
      paidAt: new Date(),
      paymentMethodId: req.body.paymentMethodId,
    });

    const updated = await orderModel.updateStatus(order.id, 'PAID');
    res.json({ order: serializeOrder(updated, { perspective: 'buyer' }) });
  }),

  // Le vendeur expédie (specs §60-61)
  ship: asyncHandler(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) return next(notFound('Commande introuvable'));
    if (order.sellerId !== req.user.id) return next(forbidden());
    if (order.status !== 'PAID') return next(conflict('Commande non payée'));

    const updated = await orderModel.updateStatus(order.id, 'SHIPPED');
    res.json({ order: serializeOrder(updated, { perspective: 'seller' }) });
  }),

  // L'acheteur confirme la réception (specs §57 "Arrivée")
  receive: asyncHandler(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) return next(notFound('Commande introuvable'));
    if (order.buyerId !== req.user.id) return next(forbidden());
    if (order.status !== 'SHIPPED') return next(conflict('Commande non expédiée'));

    const updated = await orderModel.updateStatus(order.id, 'DELIVERED');
    res.json({ order: serializeOrder(updated, { perspective: 'buyer' }) });
  }),

  // Évaluation vendeur/acheteur après une commande livrée (specs §21-22)
  review: asyncHandler(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) return next(notFound('Commande introuvable'));
    const isBuyer = order.buyerId === req.user.id;
    const isSeller = order.sellerId === req.user.id;
    if (!isBuyer && !isSeller) return next(forbidden());
    if (order.status !== 'DELIVERED') return next(conflict('La commande doit être arrivée avant évaluation'));

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));

    if (await reviewModel.hasReviewed(order.id, req.user.id)) {
      return next(conflict('Vous avez déjà évalué cette commande'));
    }

    const targetUserId = isBuyer ? order.sellerId : order.buyerId;
    const review = await reviewModel.create({
      orderId: order.id,
      authorId: req.user.id,
      targetUserId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });
    res.status(201).json({ review: serializeReview(review) });
  }),
};
