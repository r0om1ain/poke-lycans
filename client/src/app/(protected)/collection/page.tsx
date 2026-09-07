'use client';

import { useState } from 'react';
import { collectionApi } from '@/lib/api/collection';
import { uploadUrl, ApiError } from '@/lib/api/client';
import { useFetch } from '@/hooks/useFetch';
import { ProductPicker } from '@/components/product/ProductPicker';
import { ExemplarFormFields } from '@/components/product/ExemplarFormFields';
import { ExemplarBadges } from '@/components/product/ExemplarBadges';
import { SeriesLabel } from '@/components/product/SeriesLabel';
import { LoadingBlock } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatPrice } from '@/lib/format';
import type { CollectionCarte, CollectionItem, Estimation, ProduitResume, ProgressionSerie, ValeurTotale } from '@/types';

function AddItemForm({ onAdded }: { onAdded: () => void }) {
  const [product, setProduct] = useState<ProduitResume | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({ quantite: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setError(null);
    try {
      const quantite = Number(form.quantite) || 1;
      if (product.type === 'carte') {
        await collectionApi.addCarte({ idCarte: product.id, quantite, ...form });
      } else {
        await collectionApi.addItem({ idItem: product.id, quantite, idLangue: form.idLangue, etat: form.etat });
      }
      setProduct(null);
      setForm({ quantite: 1 });
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ajout impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card section">
      <h3 style={{ marginBottom: 'var(--space-3)' }}>Ajouter à ma collection</h3>
      {!product ? (
        <ProductPicker onSelect={setProduct} />
      ) : (
        <form onSubmit={onSubmit}>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>{product.nom}</strong>{' '}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProduct(null)}>Changer</button>
          </p>
          <div className="field">
            <label htmlFor="quantite">Quantité</label>
            <input
              id="quantite"
              type="number"
              min="1"
              className="input"
              value={form.quantite as number}
              onChange={(e) => setForm((f) => ({ ...f, quantite: e.target.value }))}
            />
          </div>
          {product.type === 'carte' ? (
            <ExemplarFormFields value={form} onChange={setForm} />
          ) : (
            <div className="field">
              <label htmlFor="etat">État</label>
              <input id="etat" className="input" value={(form.etat as string) ?? ''} onChange={(e) => setForm((f) => ({ ...f, etat: e.target.value }))} />
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>
      )}
    </div>
  );
}

function SellFromCarteForm({ item, onDone }: { item: CollectionCarte; onDone: () => void }) {
  const [form, setForm] = useState({ prix: '', quantite: item.quantite, description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await collectionApi.sell(item.id, {
        prix: Number(form.prix),
        quantite: Number(form.quantite) || 1,
        description: form.description || undefined,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mise en vente impossible');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
      <input
        type="number"
        min="0.01"
        step="0.01"
        className="input"
        style={{ width: 110 }}
        placeholder="Prix €"
        value={form.prix}
        onChange={(e) => setForm((f) => ({ ...f, prix: e.target.value }))}
        required
      />
      <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>Publier</button>
      {error && <span className="form-error">{error}</span>}
    </form>
  );
}

function CollectionCarteRow({ item, onChanged }: { item: CollectionCarte; onChanged: () => void }) {
  const [selling, setSelling] = useState(false);
  const [estimate, setEstimate] = useState<Estimation | null | undefined>(undefined);

  function loadEstimate() {
    if (estimate !== undefined) return;
    collectionApi.estimatedValue(item.id).then(setEstimate).catch(() => {});
  }

  async function onRemove() {
    await collectionApi.removeCarte(item.id);
    onChanged();
  }

  return (
    <div className="list-row-item" style={{ flexWrap: 'wrap' }}>
      <div className="list-row-thumb">
        {item.produit.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={uploadUrl(item.produit.image) ?? undefined} alt="" />
        )}
      </div>
      <div className="list-row-main">
        <div className="list-row-name">{item.produit.nom}</div>
        <SeriesLabel series={item.produit.serie} />
        <div style={{ marginTop: 4 }}>
          <ExemplarBadges item={item.caracteristiques} compact />
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Quantité : {item.quantite}</div>
        {selling && <SellFromCarteForm item={item} onDone={() => { setSelling(false); onChanged(); }} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <button type="button" className="btn btn-ghost btn-sm" onMouseEnter={loadEstimate} onClick={loadEstimate}>
          {estimate === undefined ? 'Voir la valeur estimée' : estimate ? `≈ ${formatPrice(estimate.estime ?? 0)}` : 'Non estimable'}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelling((s) => !s)}>Mettre en vente</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>Retirer</button>
        </div>
      </div>
    </div>
  );
}

// Les produits scellés de la collection n'ont pas d'estimation/mise en vente/
// suppression côté backend (CollectionController n'a que des endpoints pour les
// cartes) — affichage lecture seule pour cette catégorie.
function CollectionItemRow({ item }: { item: CollectionItem }) {
  return (
    <div className="list-row-item" style={{ flexWrap: 'wrap' }}>
      <div className="list-row-thumb">
        {item.produit.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={uploadUrl(item.produit.image) ?? undefined} alt="" />
        )}
      </div>
      <div className="list-row-main">
        <div className="list-row-name">{item.produit.nom}</div>
        <SeriesLabel series={item.produit.serie} />
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Quantité : {item.quantite}{item.etat ? ` · ${item.etat}` : ''}
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const { data, loading, refresh } = useFetch<{ cartes: CollectionCarte[]; items: CollectionItem[] }>(() => collectionApi.list(), []);
  const { data: progress } = useFetch<ProgressionSerie[]>(() => collectionApi.progress(), [data]);
  const { data: totalValue } = useFetch<ValeurTotale>(() => collectionApi.totalValue(), [data]);

  const totalCount = (data?.cartes.length ?? 0) + (data?.items.length ?? 0);

  return (
    <div className="page">
      <h1 className="page-title">Ma collection</h1>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile-label">Cartes / produits</div>
          <div className="stat-tile-value">{data ? totalCount : '—'}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Valeur estimée</div>
          <div className="stat-tile-value">{totalValue ? formatPrice(totalValue.total) : '—'}</div>
        </div>
      </div>

      {progress && progress.length > 0 && (
        <section className="section">
          <div className="section-header"><h2 className="section-title">Progression des séries</h2></div>
          <div className="card">
            {progress.map((row) => (
              <div className="series-progress-row" key={row.serie.id}>
                <span className="series-label" style={{ minWidth: 160 }}>{row.serie.label}</span>
                <div className="series-progress-track">
                  <div className="series-progress-fill" style={{ width: `${row.pourcentage}%` }} />
                </div>
                <span className="series-progress-pct">{row.pourcentage}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <AddItemForm onAdded={refresh} />

      <section className="section">
        <div className="section-header"><h2 className="section-title">Mes cartes et produits</h2></div>
        {loading && <LoadingBlock />}
        {!loading && totalCount === 0 && (
          <EmptyState title="Collection vide" description="Ajoutez vos premières cartes ci-dessus." />
        )}
        {!loading && data && totalCount > 0 && (
          <div className="row-list">
            {data.cartes.map((item) => (
              <CollectionCarteRow key={`carte-${item.id}`} item={item} onChanged={refresh} />
            ))}
            {data.items.map((item) => (
              <CollectionItemRow key={`item-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
