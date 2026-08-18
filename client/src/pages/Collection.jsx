import { useState } from 'react';
import { collectionApi } from '../api/collection.js';
import { uploadUrl, ApiError } from '../api/client.js';
import { useFetch } from '../hooks/useApi.js';
import { ProductPicker } from '../components/product/ProductPicker.jsx';
import { ExemplarFormFields } from '../components/product/ExemplarFormFields.jsx';
import { ExemplarBadges } from '../components/product/ExemplarBadges.jsx';
import { SeriesLabel } from '../components/product/SeriesLabel.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatPrice } from '../lib/format.js';

function AddItemForm({ onAdded }) {
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ quantity: 1 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setError(null);
    try {
      await collectionApi.create({ productId: product.id, quantity: Number(form.quantity) || 1, ...form });
      setProduct(null);
      setForm({ quantity: 1 });
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
            <strong>{product.name}</strong>{' '}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProduct(null)}>Changer</button>
          </p>
          <div className="field">
            <label htmlFor="quantity">Quantité</label>
            <input
              id="quantity"
              type="number"
              min="1"
              className="input"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            />
          </div>
          <ExemplarFormFields value={form} onChange={setForm} />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>
      )}
    </div>
  );
}

function SellFromItemForm({ item, onDone }) {
  const [form, setForm] = useState({ price: '', quantity: item.quantity, description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await collectionApi.sell(item.id, {
        price: Number(form.price),
        quantity: Number(form.quantity) || undefined,
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
        value={form.price}
        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        required
      />
      <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>Publier</button>
      {error && <span className="form-error">{error}</span>}
    </form>
  );
}

function CollectionItemRow({ item, onChanged }) {
  const [selling, setSelling] = useState(false);
  const [estimate, setEstimate] = useState(undefined);

  function loadEstimate() {
    if (estimate !== undefined) return;
    collectionApi.estimatedValue(item.id).then((r) => setEstimate(r.estimate));
  }

  async function onRemove() {
    await collectionApi.remove(item.id);
    onChanged();
  }

  return (
    <div className="list-row-item" style={{ flexWrap: 'wrap' }}>
      <div className="list-row-thumb">{item.product.imageUrl && <img src={uploadUrl(item.product.imageUrl)} alt="" />}</div>
      <div className="list-row-main">
        <div className="list-row-name">{item.product.name}</div>
        <SeriesLabel series={item.product.series} />
        <div style={{ marginTop: 4 }}>
          <ExemplarBadges item={item} compact />
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Quantité : {item.quantity}</div>
        {selling && <SellFromItemForm item={item} onDone={() => { setSelling(false); onChanged(); }} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <button type="button" className="btn btn-ghost btn-sm" onMouseEnter={loadEstimate} onClick={loadEstimate}>
          {estimate === undefined ? 'Voir la valeur estimée' : estimate ? `≈ ${formatPrice(estimate.estimated)}` : 'Non estimable'}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelling((s) => !s)}>Mettre en vente</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>Retirer</button>
        </div>
      </div>
    </div>
  );
}

export function Collection() {
  const { data: items, loading, refresh } = useFetch(() => collectionApi.list(), []);
  const { data: progress } = useFetch(() => collectionApi.progress(), [items]);
  const { data: totalValue } = useFetch(() => collectionApi.totalValue(), [items]);

  return (
    <div className="page">
      <h1 className="page-title">Ma collection</h1>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-tile-label">Cartes / produits</div>
          <div className="stat-tile-value">{items?.items.length ?? '—'}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Valeur estimée</div>
          <div className="stat-tile-value">{totalValue ? formatPrice(totalValue.total.total) : '—'}</div>
        </div>
      </div>

      {progress?.progress.length > 0 && (
        <section className="section">
          <div className="section-header"><h2 className="section-title">Progression des séries</h2></div>
          <div className="card">
            {progress.progress.map((row) => (
              <div className="series-progress-row" key={row.series.id}>
                <span className="series-label" style={{ minWidth: 160 }}>{row.series.label}</span>
                <div className="series-progress-track">
                  <div className="series-progress-fill" style={{ width: `${row.percent}%` }} />
                </div>
                <span className="series-progress-pct">{row.percent}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <AddItemForm onAdded={refresh} />

      <section className="section">
        <div className="section-header"><h2 className="section-title">Mes cartes et produits</h2></div>
        {loading && <LoadingBlock />}
        {!loading && items?.items.length === 0 && (
          <EmptyState title="Collection vide" description="Ajoutez vos premières cartes ci-dessus." />
        )}
        {!loading && items?.items.length > 0 && (
          <div className="row-list">
            {items.items.map((item) => (
              <CollectionItemRow key={item.id} item={item} onChanged={refresh} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
