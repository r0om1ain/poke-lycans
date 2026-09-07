import { Link } from 'react-router-dom';
import { ExemplarBadges } from './ExemplarBadges.jsx';
import { formatPrice } from '../../lib/format.js';

export function ListingRow({ listing, onAddToCart, onContact, adding }) {
  return (
    <div className="offer-card">
      <div className="offer-card-left">
        <Link to={`/vendeurs/${listing.seller.id}`} className="offer-seller">
          {listing.seller.username}
        </Link>
        <ExemplarBadges item={listing} />
        {listing.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{listing.description}</p>}
      </div>
      <div className="offer-card-right">
        <span className="price offer-price">{formatPrice(listing.price)}</span>
        {onContact && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onContact(listing)}>
            Contacter
          </button>
        )}
        {onAddToCart && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={adding}
            onClick={() => onAddToCart(listing)}
          >
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
}
