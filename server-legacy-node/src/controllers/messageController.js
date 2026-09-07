import { z } from 'zod';
import { conversationModel, messageModel } from '../models/conversationModel.js';
import { listingModel } from '../models/listingModel.js';
import { auctionModel } from '../models/auctionModel.js';
import { orderModel } from '../models/orderModel.js';
import { priceOfferModel } from '../models/priceOfferModel.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { badRequest, forbidden, notFound, conflict } from '../lib/httpError.js';
import { serializeConversation, serializeMessage, serializePriceOffer } from '../lib/serializers.js';
import { publicUploadPath } from '../middleware/upload.js';

const contactSchema = z.object({
  sellerId: z.string().optional(),
  listingId: z.string().optional(),
  auctionId: z.string().optional(),
  orderId: z.string().optional(),
});

// Détermine acheteur/vendeur de la conversation à créer, selon ce qui a servi
// de point d'entrée (profil, offre, enchère ou commande — specs §25-27, §64).
async function resolveParties(req, { sellerId, listingId, auctionId, orderId }) {
  if (orderId) {
    const order = await orderModel.findById(orderId);
    if (!order) throw notFound('Commande introuvable');
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) throw forbidden();
    return { buyerId: order.buyerId, sellerId: order.sellerId, listingId: null, auctionId: null, orderId };
  }
  if (listingId) {
    const listing = await listingModel.findById(listingId);
    if (!listing) throw notFound('Offre introuvable');
    if (listing.sellerId === req.user.id) throw badRequest('Vous ne pouvez pas vous contacter vous-même');
    return { buyerId: req.user.id, sellerId: listing.sellerId, listingId, auctionId: null, orderId: null };
  }
  if (auctionId) {
    const auction = await auctionModel.findById(auctionId);
    if (!auction) throw notFound('Enchère introuvable');
    if (auction.sellerId === req.user.id) throw badRequest('Vous ne pouvez pas vous contacter vous-même');
    return { buyerId: req.user.id, sellerId: auction.sellerId, listingId: null, auctionId, orderId: null };
  }
  if (sellerId) {
    if (sellerId === req.user.id) throw badRequest('Vous ne pouvez pas vous contacter vous-même');
    return { buyerId: req.user.id, sellerId, listingId: null, auctionId: null, orderId: null };
  }
  throw badRequest('sellerId, listingId, auctionId ou orderId requis');
}

export const messageController = {
  conversations: asyncHandler(async (req, res) => {
    const conversations = await conversationModel.listByUser(req.user.id);
    res.json({ conversations: conversations.map((c) => serializeConversation(c, req.user.id)) });
  }),

  // Contacter un vendeur (specs §25-27)
  contact: asyncHandler(async (req, res, next) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));

    let parties;
    try {
      parties = await resolveParties(req, parsed.data);
    } catch (err) {
      return next(err);
    }

    const conversation = await conversationModel.findOrCreate(parties);
    res.status(201).json({ conversation: serializeConversation(conversation, req.user.id) });
  }),

  messages: asyncHandler(async (req, res, next) => {
    const conversation = await conversationModel.findById(req.params.id);
    if (!conversation) return next(notFound('Conversation introuvable'));
    if (!conversationModel.isParticipant(conversation, req.user.id)) return next(forbidden());

    const messages = await messageModel.listByConversation(conversation.id);
    res.json({
      conversation: serializeConversation(conversation, req.user.id),
      messages: messages.map(serializeMessage),
    });
  }),

  // Message texte (specs §26-28)
  sendText: asyncHandler(async (req, res, next) => {
    const conversation = await conversationModel.findById(req.params.id);
    if (!conversation) return next(notFound('Conversation introuvable'));
    if (!conversationModel.isParticipant(conversation, req.user.id)) return next(forbidden());
    if (!req.body.content?.trim()) return next(badRequest('Message vide'));

    const message = await messageModel.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      type: 'TEXT',
      content: req.body.content.trim(),
    });
    res.status(201).json({ message: serializeMessage(message) });
  }),

  // Photos supplémentaires demandées par l'acheteur (specs §28)
  sendImage: asyncHandler(async (req, res, next) => {
    const conversation = await conversationModel.findById(req.params.id);
    if (!conversation) return next(notFound('Conversation introuvable'));
    if (!conversationModel.isParticipant(conversation, req.user.id)) return next(forbidden());
    if (!req.file) return next(badRequest('Image requise'));

    const message = await messageModel.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      type: 'IMAGE',
      imageUrl: publicUploadPath('messages', req.file.filename),
    });
    res.status(201).json({ message: serializeMessage(message) });
  }),

  // Négociation du prix (specs §29-30)
  makeOffer: asyncHandler(async (req, res, next) => {
    const conversation = await conversationModel.findById(req.params.id);
    if (!conversation) return next(notFound('Conversation introuvable'));
    if (!conversationModel.isParticipant(conversation, req.user.id)) return next(forbidden());
    if (conversation.buyerId !== req.user.id) return next(forbidden('Seul l’acheteur peut proposer un prix'));
    if (!conversation.listingId) return next(badRequest('Cette conversation ne porte pas sur une offre'));

    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) return next(badRequest('Montant invalide'));

    const priceOffer = await priceOfferModel.create({
      listingId: conversation.listingId,
      buyerId: conversation.buyerId,
      sellerId: conversation.sellerId,
      amount,
      conversationId: conversation.id,
    });
    const message = await messageModel.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      type: 'OFFER',
      priceOfferId: priceOffer.id,
    });
    res.status(201).json({ message: serializeMessage(message), priceOffer: serializePriceOffer(priceOffer) });
  }),

  // Le vendeur accepte / refuse (specs §29)
  respondOffer: asyncHandler(async (req, res, next) => {
    const offer = await priceOfferModel.findById(req.params.offerId);
    if (!offer) return next(notFound('Offre introuvable'));
    if (offer.sellerId !== req.user.id) return next(forbidden());
    if (offer.status !== 'PENDING') return next(conflict('Cette offre a déjà été traitée'));

    const accept = req.body.accept === true || req.body.accept === 'true';
    const updated = accept ? await priceOfferModel.accept(offer.id) : await priceOfferModel.refuse(offer.id);

    if (offer.conversationId) {
      await messageModel.create({
        conversationId: offer.conversationId,
        senderId: req.user.id,
        type: 'TEXT',
        content: accept
          ? `Offre acceptée à ${offer.amount} €.`
          : `Offre refusée.`,
      });
    }

    res.json({ priceOffer: serializePriceOffer(updated) });
  }),
};
