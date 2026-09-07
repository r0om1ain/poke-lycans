import Link from 'next/link';
import { ExemplarBadges } from './ExemplarBadges';
import { formatPrice } from '@/lib/format';
import type { Annonce } from '@/types';

export function ListingRow({
  listing,
  onAddToCart,
  onContact,
  adding,
}: {
  listing: Annonce;
  onAddToCart?: (listing: Annonce) => void;
  onContact?: (listing: Annonce) => void;
  adding?: boolean;
}) {
  return (
    <div className="offer-card">
      <div className="offer-card-left">
        <Link href={`/vendeurs/${listing.vendeur.id}`} className="offer-seller">
          {listing.vendeur.pseudo}
        </Link>
        <ExemplarBadges item={listing.caracteristiques} />
        {listing.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{listing.description}</p>}
      </div>
      <div className="offer-card-right">
        <span className="price offer-price">{formatPrice(listing.prix)}</span>
        {onContact && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onContact(listing)}>
            Contacter
          </button>
        )}
        {onAddToCart && (
          <button type="button" className="btn btn-primary btn-sm" disabled={adding} onClick={() => onAddToCart(listing)}>
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
}
