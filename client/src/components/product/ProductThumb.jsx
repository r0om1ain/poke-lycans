import { uploadUrl } from '../../api/client.js';
import { gradientFor, initials } from '../../lib/placeholders.js';

// Vignette produit : image réelle si disponible, sinon un dégradé de repli
// (gabarit fourni) avec les initiales du nom — jamais de case vide.
export function ProductThumb({ product, className, children }) {
  if (product.imageUrl) {
    return (
      <div className={className}>
        <img src={uploadUrl(product.imageUrl)} alt={product.name} loading="lazy" />
        {children}
      </div>
    );
  }
  return (
    <div className={className} style={{ background: gradientFor(product.id) }}>
      <div className="podium-fallback">{initials(product.name)}</div>
      {children}
    </div>
  );
}
