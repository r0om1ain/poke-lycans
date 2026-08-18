import { z } from 'zod';
import { userModel } from '../models/userModel.js';
import { addressModel } from '../models/addressModel.js';
import { paymentMethodModel } from '../models/paymentMethodModel.js';
import { shippingMethodModel } from '../models/shippingMethodModel.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { badRequest, notFound } from '../lib/httpError.js';
import {
  serializeUserPrivate,
  serializeAddress,
  serializePaymentMethod,
  serializeShippingMethod,
} from '../lib/serializers.js';

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  country: z.string().optional(),
});

const addressSchema = z.object({
  label: z.string().min(1),
  recipient: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const paymentMethodSchema = z.object({
  type: z.string().min(1),
  label: z.string().min(1),
  last4: z.string().max(4).optional(),
  expMonth: z.number().int().min(1).max(12).optional(),
  expYear: z.number().int().optional(),
  isDefault: z.boolean().optional(),
});

const shippingMethodSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  country: z.string().optional(),
  active: z.boolean().optional(),
});

export const accountController = {
  updateProfile: asyncHandler(async (req, res, next) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const user = await userModel.updateProfile(req.user.id, parsed.data);
    res.json({ user: serializeUserPrivate(user) });
  }),

  listAddresses: asyncHandler(async (req, res) => {
    const addresses = await addressModel.listByUser(req.user.id);
    res.json({ addresses: addresses.map(serializeAddress) });
  }),

  createAddress: asyncHandler(async (req, res, next) => {
    const parsed = addressSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const address = await addressModel.create(req.user.id, parsed.data);
    res.status(201).json({ address: serializeAddress(address) });
  }),

  updateAddress: asyncHandler(async (req, res, next) => {
    const existing = await addressModel.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) return next(notFound('Adresse introuvable'));
    const parsed = addressSchema.partial().safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const address = await addressModel.update(req.params.id, req.user.id, parsed.data);
    res.json({ address: serializeAddress(address) });
  }),

  removeAddress: asyncHandler(async (req, res, next) => {
    const existing = await addressModel.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) return next(notFound('Adresse introuvable'));
    await addressModel.remove(req.params.id);
    res.status(204).end();
  }),

  listPaymentMethods: asyncHandler(async (req, res) => {
    const methods = await paymentMethodModel.listByUser(req.user.id);
    res.json({ paymentMethods: methods.map(serializePaymentMethod) });
  }),

  createPaymentMethod: asyncHandler(async (req, res, next) => {
    const parsed = paymentMethodSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const method = await paymentMethodModel.create(req.user.id, parsed.data);
    res.status(201).json({ paymentMethod: serializePaymentMethod(method) });
  }),

  removePaymentMethod: asyncHandler(async (req, res, next) => {
    const existing = await paymentMethodModel.findById(req.params.id);
    if (!existing || existing.userId !== req.user.id) return next(notFound('Moyen de paiement introuvable'));
    await paymentMethodModel.remove(req.params.id);
    res.status(204).end();
  }),

  // Modes de livraison proposés par le vendeur (specs §35-36) : sans ça, le
  // panier n'a aucun mode de livraison à afficher pour ses offres.
  listShippingMethods: asyncHandler(async (req, res) => {
    const methods = await shippingMethodModel.listBySeller(req.user.id);
    res.json({ shippingMethods: methods.map(serializeShippingMethod) });
  }),

  createShippingMethod: asyncHandler(async (req, res, next) => {
    const parsed = shippingMethodSchema.safeParse({ ...req.body, price: Number(req.body.price) });
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const method = await shippingMethodModel.create(req.user.id, parsed.data);
    res.status(201).json({ shippingMethod: serializeShippingMethod(method) });
  }),

  updateShippingMethod: asyncHandler(async (req, res, next) => {
    const methods = await shippingMethodModel.listBySeller(req.user.id);
    const existing = methods.find((m) => m.id === req.params.id);
    if (!existing) return next(notFound('Mode de livraison introuvable'));
    const parsed = shippingMethodSchema.partial().safeParse({
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
    });
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const method = await shippingMethodModel.update(req.params.id, parsed.data);
    res.json({ shippingMethod: serializeShippingMethod(method) });
  }),

  removeShippingMethod: asyncHandler(async (req, res, next) => {
    const methods = await shippingMethodModel.listBySeller(req.user.id);
    const existing = methods.find((m) => m.id === req.params.id);
    if (!existing) return next(notFound('Mode de livraison introuvable'));
    await shippingMethodModel.remove(req.params.id);
    res.status(204).end();
  }),
};
