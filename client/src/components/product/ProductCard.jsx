import { Link } from 'react-router-dom';
import { uploadUrl } from '../../api/client.js';
import { SeriesLabel } from './SeriesLabel.jsx';
import { formatPrice } from '../../lib/format.js';
import { productUrl } from '../../lib/productUrl.js';

// price : prix exact à afficher tel quel (ex. une offre précise). Si absent,
// on retombe sur product.fromPrice ("À partir de X €", comme Cardmarket).
export function ProductCard({ product, price }) {
  const hasFromPrice = product.fromPrice !== undefined && product.fromPrice !== null;

  return (
    <Link to={productUrl(product)} className="product-card">
      <div className="product-card-img">
        {product.imageUrl ? (
          <img src={uploadUrl(product.imageUrl)} alt={product.name} loading="lazy" />
        ) : (
          <span className="placeholder">Pas d’image</span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        {product.series && <SeriesLabel series={product.series} />}
        {price && <div className="product-card-price"><strong>{price}</strong></div>}
        {!price && hasFromPrice && (
          <div className="product-card-price">À partir de <strong>{formatPrice(product.fromPrice)}</strong></div>
        )}
      </div>
    </Link>
  );
}
