import { serializeSeries } from './formatSeries.js';

export function serializeUserPublic(user, stats) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    country: user.country,
    memberSince: user.createdAt,
    // Calculées depuis Review (voir reviewModel.getStatsForUser), pas stockées sur User.
    ratingPositive: stats?.positive ?? undefined,
    ratingNeutral: stats?.neutral ?? undefined,
    ratingNegative: stats?.negative ?? undefined,
  };
}

export function serializeUserPrivate(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function serializeLanguage(language) {
  if (!language) return null;
  return { id: language.id, code: language.code, name: language.name };
}

export function serializeGradingCompany(company) {
  if (!company) return null;
  return { id: company.id, name: company.name, logo: company.logo };
}

export function serializeCategory(category) {
  if (!category) return null;
  return { id: category.id, slug: category.slug, name: category.name };
}

export function serializeProduct(product) {
  if (!product) return null;
  return {
    id: product.id,
    category: serializeCategory(product.category),
    name: product.name,
    cardNumber: product.cardNumber,
    rarity: product.rarity,
    imageUrl: product.imageUrl,
    series: serializeSeries(product.series),
  };
}

// Champs d'exemplaire communs à Listing/Auction/CollectionItem/OrderItem.
// `language`/`gradingCompany` doivent être inclus (Prisma `include`) par
// l'appelant pour apparaître ici sous forme d'objet plutôt que d'id brut.
function pickExemplarOut(entity) {
  return {
    state: entity.state ?? null,
    language: entity.language ? serializeLanguage(entity.language) : null,
    holo: entity.holo,
    firstEdition: entity.firstEdition,
    pokeball: entity.pokeball,
    miscutMisprint: entity.miscutMisprint,
    stamp: entity.stamp,
    reverse: entity.reverse,
    graded: entity.graded,
    gradingCompany: entity.gradingCompany ? serializeGradingCompany(entity.gradingCompany) : null,
    gradingNote: entity.gradingNote ?? null,
  };
}

export function serializeListing(listing) {
  if (!listing) return null;
  return {
    id: listing.id,
    product: serializeProduct(listing.product),
    seller: serializeUserPublic(listing.seller),
    price: listing.price,
    quantity: listing.quantity,
    status: listing.status,
    description: listing.description,
    createdAt: listing.createdAt,
    ...pickExemplarOut(listing),
  };
}

export function serializeAuction(auction) {
  if (!auction) return null;
  return {
    id: auction.id,
    product: serializeProduct(auction.product),
    seller: serializeUserPublic(auction.seller),
    startPrice: auction.startPrice,
    hasReserve: auction.reservePrice != null,
    reserveMet:
      auction.reservePrice != null ? Number(auction.currentPrice) >= Number(auction.reservePrice) : null,
    currentPrice: auction.currentPrice,
    photos: auction.photos,
    status: auction.status,
    description: auction.description,
    endAt: auction.endAt,
    createdAt: auction.createdAt,
    bidCount: auction._count?.bids ?? undefined,
    winnerId: auction.winnerId ?? null,
    hasOrder: Boolean(auction.order),
    ...pickExemplarOut(auction),
  };
}

export function serializeBid(bid) {
  if (!bid) return null;
  return {
    id: bid.id,
    amount: bid.amount,
    createdAt: bid.createdAt,
    user: serializeUserPublic(bid.user),
  };
}

export function serializeCollectionItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    product: serializeProduct(item.product),
    quantity: item.quantity,
    createdAt: item.createdAt,
    ...pickExemplarOut(item),
  };
}

export function serializeCartItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    quantity: item.quantity,
    listing: serializeListing(item.listing),
  };
}

export function serializeAddress(address) {
  if (!address) return null;
  return { ...address };
}

export function serializePaymentMethod(pm) {
  if (!pm) return null;
  return {
    id: pm.id,
    type: pm.type,
    label: pm.label,
    last4: pm.last4,
    expMonth: pm.expMonth,
    expYear: pm.expYear,
    isDefault: pm.isDefault,
  };
}

export function serializeShippingMethod(method) {
  if (!method) return null;
  return {
    id: method.id,
    name: method.name,
    price: method.price,
    country: method.country,
    active: method.active,
  };
}

export function serializeOrderItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    quantity: item.quantity,
    name: item.nameSnapshot,
    price: item.priceSnapshot,
    ...pickExemplarOut(item),
  };
}

export function serializePayment(payment) {
  if (!payment) return null;
  return {
    id: payment.id,
    provider: payment.provider,
    transactionId: payment.transactionId,
    amount: payment.amount,
    status: payment.status,
    paidAt: payment.paidAt,
    refundedAt: payment.refundedAt,
  };
}

export function serializeOrder(order, { perspective }) {
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    shippingMethodName: order.shippingMethodSnapshot,
    total: order.total,
    createdAt: order.createdAt,
    address: serializeAddress(order.address),
    counterpart:
      perspective === 'buyer' ? serializeUserPublic(order.seller) : serializeUserPublic(order.buyer),
    items: order.items?.map(serializeOrderItem) ?? [],
    payment: order.payment ? serializePayment(order.payment) : null,
  };
}

export function serializeReview(review) {
  if (!review) return null;
  return {
    id: review.id,
    orderId: review.orderId,
    author: serializeUserPublic(review.author),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

export function serializePriceOffer(offer) {
  if (!offer) return null;
  return {
    id: offer.id,
    listingId: offer.listingId,
    buyerId: offer.buyerId,
    sellerId: offer.sellerId,
    amount: offer.amount,
    status: offer.status,
    createdAt: offer.createdAt,
    acceptedAt: offer.acceptedAt,
    expiresAt: offer.expiresAt,
    usedAt: offer.usedAt,
  };
}

export function serializeMessage(message) {
  if (!message) return null;
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    type: message.type,
    content: message.content,
    imageUrl: message.imageUrl,
    priceOffer: message.priceOffer ? serializePriceOffer(message.priceOffer) : null,
    createdAt: message.createdAt,
  };
}

export function serializeConversation(conversation, currentUserId) {
  if (!conversation) return null;
  const counterpart = conversation.buyerId === currentUserId ? conversation.seller : conversation.buyer;
  return {
    id: conversation.id,
    counterpart: serializeUserPublic(counterpart),
    listing: conversation.listing ? serializeListing(conversation.listing) : null,
    auction: conversation.auction ? serializeAuction(conversation.auction) : null,
    orderId: conversation.orderId ?? null,
    createdAt: conversation.createdAt,
    lastMessage: conversation.messages?.[0] ? serializeMessage(conversation.messages[0]) : null,
  };
}
