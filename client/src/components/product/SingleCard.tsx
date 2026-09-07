import Link from 'next/link';
import { uploadUrl } from '@/lib/api/client';
import { gradientFor, initials } from '@/lib/placeholders';
import { formatPrice } from '@/lib/format';
import { productUrl } from '@/lib/productUrl';
import type { ProduitResume } from '@/types';

export function SingleCard({ product }: { product: ProduitResume }) {
  return (
    <Link href={productUrl(product)} className="single-card">
      <div className="single-card__visual" style={product.image ? undefined : { background: gradientFor(product.id) }}>
        {product.serie && <span className="single-card__set-tag">{product.serie.code}</span>}
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={uploadUrl(product.image) ?? undefined} alt={product.nom} loading="lazy" />
        ) : (
          <div className="single-card__fallback">
            <strong>{initials(product.nom)}</strong>
            {product.rarete && <small>{product.rarete}</small>}
          </div>
        )}
      </div>
      <div className="single-card__body">
        <span className="single-card__name">{product.nom}</span>
        {product.serie && <span className="single-card__set-name">{product.serie.label}</span>}
        <div className="single-card__stats">
          <span>{product.prixMin != null ? 'À partir de' : 'Aucune offre'}</span>
          {product.prixMin != null && <strong>{formatPrice(product.prixMin)}</strong>}
        </div>
      </div>
    </Link>
  );
}
