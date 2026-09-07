import { userModel } from '../models/userModel.js';
import { listingModel } from '../models/listingModel.js';
import { reviewModel } from '../models/reviewModel.js';
import { shippingMethodModel } from '../models/shippingMethodModel.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { notFound } from '../lib/httpError.js';
import {
  serializeUserPublic,
  serializeListing,
  serializeReview,
  serializeShippingMethod,
} from '../lib/serializers.js';

export const sellerController = {
  // Profil public vendeur (specs §21-22)
  profile: asyncHandler(async (req, res, next) => {
    const seller = await userModel.findById(req.params.id);
    if (!seller) return next(notFound('Vendeur introuvable'));

    const [stats, salesCount, categoryCounts] = await Promise.all([
      reviewModel.getStatsForUser(seller.id),
      userModel.salesCount(seller.id),
      listingModel.countsByCategoryForSeller(seller.id),
    ]);

    res.json({
      seller: serializeUserPublic(seller, stats),
      salesCount,
      categoryCounts, // ex: { card: { name: 'Carte', count: 126 }, etb: { name: 'ETB', count: 4 } } — specs §23
    });
  }),

  // Articles en vente du vendeur, par catégorie (specs §23-24)
  listings: asyncHandler(async (req, res) => {
    const { categoryId, page, pageSize } = req.query;
    const result = await listingModel.findBySeller(req.params.id, {
      categoryId,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 24,
    });
    res.json({ ...result, items: result.items.map(serializeListing) });
  }),

  reviews: asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const reviews = await reviewModel.listForTarget(req.params.id, {
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
    res.json({ reviews: reviews.map(serializeReview) });
  }),

  // Modes de livraison actifs du vendeur — nécessaire pour qu'un acheteur
  // choisisse une livraison (panier §35-36, finalisation d'achat après
  // enchère remportée §44-45).
  shippingMethods: asyncHandler(async (req, res) => {
    const methods = await shippingMethodModel.listBySeller(req.params.id, { activeOnly: true });
    res.json({ shippingMethods: methods.map(serializeShippingMethod) });
  }),
};
