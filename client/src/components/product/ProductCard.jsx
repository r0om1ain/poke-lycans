import { Link } from 'react-router-dom';
import { uploadUrl } from '../../api/client.js';
import { SeriesLabel } from './SeriesLabel.jsx';

export function ProductCard({ product, price }) {
  return (
    <Link to={`/produits/${product.id}`} className="product-card">
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
        {price !== undefined && <div className="product-card-price price">{price}</div>}
      </div>
    </Link>
  );
}
