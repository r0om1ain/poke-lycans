'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { uploadUrl } from '@/lib/api/client';
import { SeriesLabel } from '../product/SeriesLabel';
import { formatCountdown, formatPrice } from '@/lib/format';
import type { EnchereResume } from '@/types';

export function AuctionCard({ auction }: { auction: EnchereResume }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link href={`/encheres/${auction.id}`} className="auction-card">
      <div className="auction-card-img">
        {auction.produit.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={uploadUrl(auction.produit.image) ?? undefined} alt={auction.produit.nom} loading="lazy" />
        ) : null}
      </div>
      <div className="auction-card-body">
        <div className="auction-card-top">
          <div>
            <div className="list-row-name">{auction.produit.nom}</div>
            <SeriesLabel series={auction.produit.serie} />
          </div>
          <span className="countdown-badge">{formatCountdown(auction.dateFin)}</span>
        </div>
        <div>
          <div className="auction-current-price-label">Enchère actuelle</div>
          <span className="price" style={{ fontSize: '1.05rem' }}>{formatPrice(auction.prixCourant)}</span>
        </div>
      </div>
    </Link>
  );
}
