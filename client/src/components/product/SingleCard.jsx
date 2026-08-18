import { Link } from 'react-router-dom';
import { uploadUrl } from '../../api/client.js';
import { gradientFor, initials } from '../../lib/placeholders.js';
import { formatPrice } from '../../lib/format.js';
import { productUrl } from '../../lib/productUrl.js';

// Carte du catalogue (specs §13 : image, nom, série, type). Reprend le
// gabarit "single-card" fourni : visuel carré + bandeau nom/série/prix.
export function SingleCard({ product }) {
  return (
    <Link to={productUrl(product)} className="single-card">
      <div className="single-card__visual" style={product.imageUrl ? undefined : { background: gradientFor(product.id) }}>
        {product.series && <span className="single-card__set-tag">{product.series.code}</span>}
        {product.imageUrl ? (
          <img src={uploadUrl(product.imageUrl)} alt={product.name} loading="lazy" />
        ) : (
          <div className="single-card__fallback">
            <strong>{initials(product.name)}</strong>
            <small>{product.category?.name}</small>
          </div>
        )}
      </div>
      <div className="single-card__body">
        <span className="single-card__name">{product.name}</span>
        {product.series && <span className="single-card__set-name">{product.series.label}</span>}
        <div className="single-card__stats">
          <span>{product.fromPrice != null ? 'À partir de' : 'Aucune offre'}</span>
          {product.fromPrice != null && <strong>{formatPrice(product.fromPrice)}</strong>}
        </div>
      </div>
    </Link>
  );
}
