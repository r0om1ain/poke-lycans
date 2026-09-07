import Link from 'next/link';
import { uploadUrl } from '@/lib/api/client';
import { SeriesLabel } from './SeriesLabel';
import { formatPrice } from '@/lib/format';
import { productUrl } from '@/lib/productUrl';
import type { ProduitResume } from '@/types';

// price : prix exact à afficher tel quel. Si absent, repli sur
// product.prixMin ("À partir de X €", comme Cardmarket).
export function ProductCard({ product, price }: { product: ProduitResume; price?: string }) {
  const hasFromPrice = product.prixMin !== undefined && product.prixMin !== null;

  return (
    <Link href={productUrl(product)} className="product-card">
      <div className="product-card-img">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={uploadUrl(product.image) ?? undefined} alt={product.nom} loading="lazy" />
        ) : (
          <span className="placeholder">Pas d’image</span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.nom}</div>
        {product.serie && <SeriesLabel series={product.serie} />}
        {price && <div className="product-card-price"><strong>{price}</strong></div>}
        {!price && hasFromPrice && (
          <div className="product-card-price">À partir de <strong>{formatPrice(product.prixMin)}</strong></div>
        )}
      </div>
    </Link>
  );
}
