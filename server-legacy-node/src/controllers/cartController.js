import { cartModel } from '../models/cartModel.js';
import { listingModel } from '../models/listingModel.js';
import { shippingMethodModel } from '../models/shippingMethodModel.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { badRequest, notFound, conflict } from '../lib/httpError.js';
import { serializeCartItem, serializeUserPublic, serializeShippingMethod } from '../lib/serializers.js';

// Regroupe le panier par vendeur (specs §32-36) : chaque bloc porte ses
// propres articles, sous-total, modes de livraison disponibles et total.
async function buildCartResponse(userId) {
  const items = await cartModel.listByUser(userId);

  const bySeller = new Map();
  for (const item of items) {
    const sellerId = item.listing.sellerId;
    if (!bySeller.has(sellerId)) {
      bySeller.set(sellerId, { seller: item.listing.seller, items: [] });
    }
    bySeller.get(sellerId).items.push(item);
  }

  const sellers = await Promise.all(
    [...bySeller.entries()].map(async ([sellerId, group]) => {
      const shippingMethods = await shippingMethodModel.listBySeller(sellerId, { activeOnly: true });
      const subtotal = group.items.reduce(
        (sum, item) => sum + Number(item.listing.price) * item.quantity,
        0,
      );
      return {
        seller: serializeUserPublic(group.seller),
        items: group.items.map(serializeCartItem),
        subtotal: Math.round(subtotal * 100) / 100,
        shippingMethods: shippingMethods.map(serializeShippingMethod),
      };
    }),
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = sellers.reduce((sum, s) => sum + s.subtotal, 0);

  return {
    sellers,
    summary: {
      sellerCount: sellers.length,
      itemCount: totalItems,
      totalValue: Math.round(totalValue * 100) / 100,
    },
  };
}

export const cartController = {
  get: asyncHandler(async (req, res) => {
    res.json(await buildCartResponse(req.user.id));
  }),

  add: asyncHandler(async (req, res, next) => {
    const { listingId } = req.body;
    const quantity = Number(req.body.quantity) || 1;
    if (!listingId || quantity <= 0) return next(badRequest('Requête invalide'));

    const listing = await listingModel.findById(listingId);
    if (!listing || listing.status !== 'ACTIVE') return next(notFound('Offre introuvable'));
    if (quantity > listing.quantity) return next(conflict('Quantité demandée indisponible'));

    await cartModel.addOrIncrement(req.user.id, listingId, quantity);
    res.status(201).json(await buildCartResponse(req.user.id));
  }),

  updateQuantity: asyncHandler(async (req, res, next) => {
    const item = await cartModel.findById(req.params.id);
    if (!item || item.userId !== req.user.id) return next(notFound('Article introuvable'));

    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) return next(badRequest('Quantité invalide'));

    await cartModel.updateQuantity(item.id, quantity);
    res.json(await buildCartResponse(req.user.id));
  }),

  remove: asyncHandler(async (req, res, next) => {
    const item = await cartModel.findById(req.params.id);
    if (!item || item.userId !== req.user.id) return next(notFound('Article introuvable'));
    await cartModel.remove(item.id);
    res.json(await buildCartResponse(req.user.id));
  }),
};

export { buildCartResponse };
