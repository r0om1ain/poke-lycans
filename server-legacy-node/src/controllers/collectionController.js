import { z } from 'zod';
import { collectionModel } from '../models/collectionModel.js';
import { listingModel } from '../models/listingModel.js';
import { productModel } from '../models/productModel.js';
import { pricingService } from '../services/pricingService.js';
import { seriesProgressService } from '../services/seriesProgressService.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { badRequest, forbidden, notFound } from '../lib/httpError.js';
import { pickExemplarFields } from '../lib/characteristics.js';
import { serializeCollectionItem, serializeListing } from '../lib/serializers.js';

const createSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

const sellFromItemSchema = z.object({
  price: z.number().positive(),
  quantity: z.number().int().positive().optional(),
  description: z.string().max(2000).optional(),
});

export const collectionController = {
  // Collection personnelle (specs §46-48)
  list: asyncHandler(async (req, res) => {
    const items = await collectionModel.listByUser(req.user.id, { seriesId: req.query.seriesId });
    res.json({ items: items.map(serializeCollectionItem) });
  }),

  create: asyncHandler(async (req, res, next) => {
    const parsed = createSchema.safeParse({
      ...req.body,
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : undefined,
    });
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));

    const product = await productModel.findById(parsed.data.productId);
    if (!product) return next(notFound('Produit introuvable'));

    const item = await collectionModel.create({
      ...parsed.data,
      userId: req.user.id,
      ...pickExemplarFields(req.body),
    });
    res.status(201).json({ item: serializeCollectionItem(item) });
  }),

  update: asyncHandler(async (req, res, next) => {
    const existing = await collectionModel.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) return next(notFound('Élément introuvable'));

    const data = { ...pickExemplarFields(req.body) };
    if (req.body.quantity !== undefined) data.quantity = Number(req.body.quantity);

    const item = await collectionModel.update(req.params.id, data);
    res.json({ item: serializeCollectionItem(item) });
  }),

  remove: asyncHandler(async (req, res, next) => {
    const existing = await collectionModel.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) return next(notFound('Élément introuvable'));
    await collectionModel.remove(req.params.id);
    res.status(204).end();
  }),

  // Progression par série (specs §49)
  progress: asyncHandler(async (req, res) => {
    const progress = await seriesProgressService.getProgressForUser(req.user.id);
    res.json({ progress });
  }),

  // Valeur estimée (specs §50-51) : par carte, et total de la collection
  estimatedValue: asyncHandler(async (req, res, next) => {
    const item = await collectionModel.findById(req.params.id);
    if (!item || item.userId !== req.user.id) return next(notFound('Élément introuvable'));
    const estimate = await pricingService.estimateCollectionItem(item);
    res.json({ estimate });
  }),

  totalValue: asyncHandler(async (req, res) => {
    const items = await collectionModel.listByUser(req.user.id);
    const total = await pricingService.estimateCollectionTotal(items);
    res.json({ total });
  }),

  // "Mettre en vente" depuis la collection (specs §52) : reprend les
  // caractéristiques existantes, l'utilisateur ne complète que prix/quantité/description.
  sell: asyncHandler(async (req, res, next) => {
    const item = await collectionModel.findById(req.params.id);
    if (!item || item.userId !== req.user.id) return next(forbidden());

    const parsed = sellFromItemSchema.safeParse({
      ...req.body,
      price: Number(req.body.price),
      quantity: req.body.quantity !== undefined ? Number(req.body.quantity) : undefined,
    });
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));

    const listing = await listingModel.create({
      productId: item.productId,
      sellerId: req.user.id,
      price: parsed.data.price,
      quantity: parsed.data.quantity ?? item.quantity,
      description: parsed.data.description,
      state: item.state,
      languageId: item.languageId,
      holo: item.holo,
      firstEdition: item.firstEdition,
      pokeball: item.pokeball,
      miscutMisprint: item.miscutMisprint,
      stamp: item.stamp,
      reverse: item.reverse,
      graded: item.graded,
      gradingCompanyId: item.gradingCompanyId,
      gradingNote: item.gradingNote,
    });
    res.status(201).json({ listing: serializeListing(listing) });
  }),
};
