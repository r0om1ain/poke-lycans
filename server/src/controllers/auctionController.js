import { z } from 'zod';
import { auctionModel } from '../models/auctionModel.js';
import { productModel } from '../models/productModel.js';
import { orderModel } from '../models/orderModel.js';
import { addressModel } from '../models/addressModel.js';
import { shippingMethodModel } from '../models/shippingMethodModel.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { badRequest, forbidden, notFound, conflict } from '../lib/httpError.js';
import { pickExemplarFields } from '../lib/characteristics.js';
import { serializeAuction, serializeBid, serializeOrder } from '../lib/serializers.js';
import { publicUploadPath } from '../middleware/upload.js';

const MAX_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // specs §44

const createSchema = z.object({
  productId: z.string().min(1),
  startPrice: z.number().positive(),
  reservePrice: z.number().positive().optional(),
  endAt: z.string().datetime().or(z.string().min(1)),
  description: z.string().max(2000).optional(),
});

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(60, Math.max(1, Number(query.pageSize) || 24));
  return { page, pageSize };
}

export const auctionController = {
  // Page Enchères (specs §37-39)
  list: asyncHandler(async (req, res) => {
    const { page, pageSize } = parsePagination(req.query);
    const { categoryId, seriesId, name, page: _page, pageSize: _pageSize, ...characteristics } = req.query;
    const result = await auctionModel.list({ categoryId, seriesId, name, ...characteristics, page, pageSize });
    res.json({ ...result, items: result.items.map(serializeAuction) });
  }),

  // Détail d'une enchère (specs §40-41)
  detail: asyncHandler(async (req, res, next) => {
    const auction = await auctionModel.findById(req.params.id);
    if (!auction) return next(notFound('Enchère introuvable'));
    res.json({
      auction: serializeAuction(auction),
      bids: auction.bids.map(serializeBid),
    });
  }),

  // Création d'une enchère (specs §42-44)
  create: asyncHandler(async (req, res, next) => {
    const parsed = createSchema.safeParse({
      ...req.body,
      startPrice: Number(req.body.startPrice),
      reservePrice: req.body.reservePrice ? Number(req.body.reservePrice) : undefined,
    });
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));

    const product = await productModel.findById(parsed.data.productId);
    if (!product) return next(notFound('Produit introuvable'));

    const endAt = new Date(parsed.data.endAt);
    const maxEndAt = new Date(Date.now() + MAX_DURATION_MS);
    if (Number.isNaN(endAt.getTime()) || endAt <= new Date()) {
      return next(badRequest('Date de fin invalide'));
    }
    if (endAt > maxEndAt) {
      return next(badRequest('Une enchère ne peut pas durer plus de 7 jours'));
    }

    const photos = (req.files ?? []).map((file) => publicUploadPath('auctions', file.filename));

    const auction = await auctionModel.create({
      productId: parsed.data.productId,
      sellerId: req.user.id,
      startPrice: parsed.data.startPrice,
      currentPrice: parsed.data.startPrice,
      reservePrice: parsed.data.reservePrice,
      description: parsed.data.description,
      endAt,
      photos,
      ...pickExemplarFields(req.body),
    });
    res.status(201).json({ auction: serializeAuction(auction) });
  }),

  // Enchérir (specs §45)
  placeBid: asyncHandler(async (req, res, next) => {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return next(badRequest('Montant invalide'));

    try {
      const bid = await auctionModel.placeBid(req.params.id, req.user.id, amount);
      res.status(201).json({ bid: serializeBid(bid) });
    } catch (err) {
      if (err.message === 'AUCTION_NOT_FOUND') return next(notFound('Enchère introuvable'));
      if (err.message === 'AUCTION_NOT_ACTIVE' || err.message === 'AUCTION_ENDED') {
        return next(conflict('Cette enchère est terminée'));
      }
      if (err.message === 'BID_TOO_LOW') return next(conflict('Le montant doit être supérieur au prix actuel'));
      throw err;
    }
  }),

  // Le gagnant finalise l'achat (adresse + livraison) : l'enchère remportée
  // devient une vraie commande, suivie dans "Mes achats"/"Mes ventes" (§44-45, §57-61).
  finalizePurchase: asyncHandler(async (req, res, next) => {
    const auction = await auctionModel.findById(req.params.id);
    if (!auction) return next(notFound('Enchère introuvable'));
    if (auction.status !== 'ENDED') return next(conflict("Cette enchère n'est pas terminée"));
    if (auction.winnerId !== req.user.id) return next(forbidden("Vous n'avez pas remporté cette enchère"));
    if (auction.order) return next(conflict('Achat déjà finalisé pour cette enchère'));

    const address = await addressModel.findById(req.body.addressId);
    if (!address || address.userId !== req.user.id) return next(notFound('Adresse introuvable'));

    let shippingMethod = null;
    if (req.body.shippingMethodId) {
      shippingMethod = await shippingMethodModel.findById(req.body.shippingMethodId);
      if (!shippingMethod || shippingMethod.sellerId !== auction.sellerId) {
        return next(badRequest('Mode de livraison invalide'));
      }
    }

    const order = await orderModel.createOrderForAuctionWin({
      auction,
      buyerId: req.user.id,
      addressId: address.id,
      shippingMethod,
    });
    res.status(201).json({ order: serializeOrder(order, { perspective: 'buyer' }) });
  }),

  // "Mes enchères" (specs §62) : créées + auxquelles je participe
  mine: asyncHandler(async (req, res) => {
    const [created, participated] = await Promise.all([
      auctionModel.findByUser(req.user.id),
      auctionModel.findParticipatedByUser(req.user.id),
    ]);
    res.json({
      created: created.map(serializeAuction),
      participated: participated.map(serializeAuction),
    });
  }),
};
