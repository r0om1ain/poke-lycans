'use client';

import { useEffect, useState } from 'react';
import { catalogApi } from '@/lib/api/catalog';
import { uploadUrl } from '@/lib/api/client';
import type { ProduitResume } from '@/types';

export function ProductPicker({ onSelect }: { onSelect: (product: ProduitResume) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProduitResume[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => {
      catalogApi.search({ q: query, pageSize: 8 }).then((r) => setResults(r.resultats)).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <div>
      <input
        className="input"
        placeholder="Rechercher une carte ou un produit..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="row-list" style={{ marginTop: 'var(--space-2)', maxHeight: 260, overflowY: 'auto' }}>
          {results.map((p) => (
            <button
              key={`${p.type}-${p.id}`}
              type="button"
              className="list-item-row"
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                onSelect(p);
                setQuery('');
                setResults([]);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div className="list-row-thumb">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={uploadUrl(p.image) ?? undefined} alt="" />
                  )}
                </div>
                <div>
                  <div className="list-row-name">{p.nom}</div>
                  {p.serie && <div className="list-row-series">{p.serie.label}</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
