import { useEffect, useState } from 'react';
import { catalogApi } from '../../api/catalog.js';
import { uploadUrl } from '../../api/client.js';

export function ProductPicker({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const id = setTimeout(() => {
      catalogApi.search({ name: query, pageSize: 8 }).then((r) => setResults(r.items));
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
              key={p.id}
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
                <div className="list-row-thumb">{p.imageUrl && <img src={uploadUrl(p.imageUrl)} alt="" />}</div>
                <div>
                  <div className="list-row-name">{p.name}</div>
                  {p.series && <div className="list-row-series">{p.series.label}</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
