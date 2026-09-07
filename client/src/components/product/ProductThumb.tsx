import type { ReactNode } from 'react';
import { uploadUrl } from '@/lib/api/client';
import { gradientFor, initials } from '@/lib/placeholders';
import type { ProduitResume } from '@/types';

export function ProductThumb({ product, className, children }: { product: ProduitResume; className?: string; children?: ReactNode }) {
  if (product.image) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={uploadUrl(product.image) ?? undefined} alt={product.nom} loading="lazy" />
        {children}
      </div>
    );
  }
  return (
    <div className={className} style={{ background: gradientFor(product.id) }}>
      <div className="podium-fallback">{initials(product.nom)}</div>
      {children}
    </div>
  );
}
