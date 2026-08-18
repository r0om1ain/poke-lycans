import { z } from 'zod';
import { listingModel } from '../models/listingModel.js';
import { productModel } from '../models/productModel.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { badRequest, forbidden, notFound } from '../lib/httpError.js';
import { pickExemplarFields } from '../lib/characteristics.js';
import { serializeListing } from '../lib/serializers.js';

const createSchema = z.object({
  productId: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive().default(1),
  description: z.string().max(2000).optional(),
});

export const listingController = {
  // Mise en vente classique (specs §19) : le vendeur choisit un produit du
  // catalogue puis renseigne les caractéristiques de SON exemplaire — toutes
  // facultatives.
  create: asyncHandler(async (req, res, next) => {
    const parsed = createSchema.safeParse({
      ...req.body,
      price: Number(req.body.price),
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : undefined,
    });
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));

    const product = await productModel.findById(parsed.data.productId);
    if (!product) return next(notFound('Produit introuvable'));

    const listing = await listingModel.create({
      ...parsed.data,
      sellerId: req.user.id,
      ...pickExemplarFields(req.body),
    });
    res.status(201).json({ listing: serializeListing(listing) });
  }),

  // Offres actives d'une fiche produit, filtrables (specs §16, §18)
  forProduct: asyncHandler(async (req, res) => {
    const listings = await listingModel.findByProduct(req.params.productId, req.query);
    res.json({ listings: listings.map(serializeListing) });
  }),

  mine: asyncHandler(async (req, res) => {
    const { categoryId, page, pageSize } = req.query;
    const result = await listingModel.findBySeller(req.user.id, {
      categoryId,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 24,
    });
    res.json({ ...result, items: result.items.map(serializeListing) });
  }),

  remove: asyncHandler(async (req, res, next) => {
    const listing = await listingModel.findById(req.params.id);
    if (!listing) return next(notFound('Offre introuvable'));
    if (listing.sellerId !== req.user.id) return next(forbidden());
    const updated = await listingModel.remove(listing.id);
    res.json({ listing: serializeListing(updated) });
  }),
};
