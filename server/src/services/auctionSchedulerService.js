import { auctionModel } from '../models/auctionModel.js';

const CHECK_INTERVAL_MS = 30_000;

// Specs §45 : à la date/heure de fin, l'enchère se termine. Le gagnant est le
// plus haut enchérisseur, sous réserve d'avoir atteint le prix de réserve
// éventuel (le montant de réserve n'est jamais dépassé automatiquement : s'il
// n'est pas atteint, l'enchère se termine simplement sans vente, comme
// l'indiquent les specs §43 en laissant l'app afficher "non atteint").
async function closeExpiredAuctions() {
  const expired = await auctionModel.findExpiredActive();
  for (const auction of expired) {
    const topBid = auction.bids[0];
    const reserveMet =
      auction.reservePrice == null || (topBid && Number(topBid.amount) >= Number(auction.reservePrice));
    const won = Boolean(topBid) && reserveMet;
    await auctionModel.markEnded(auction.id, {
      winnerId: won ? topBid.userId : undefined,
      winningBidId: won ? topBid.id : undefined,
    });
  }
}

let timer = null;

export function startAuctionScheduler() {
  if (timer) return;
  timer = setInterval(() => {
    closeExpiredAuctions().catch((err) => console.error('[auctionScheduler]', err));
  }, CHECK_INTERVAL_MS);
  closeExpiredAuctions().catch((err) => console.error('[auctionScheduler]', err));
}

export function stopAuctionScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}
