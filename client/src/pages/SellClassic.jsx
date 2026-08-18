import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog.js';
import { listingsApi } from '../api/listings.js';
import { useFetch } from '../hooks/useApi.js';
import { ExemplarFormFields } from '../components/product/ExemplarFormFields.jsx';
import { SeriesLabel } from '../components/product/SeriesLabel.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { ApiError } from '../api/client.js';

// Mise en vente classique (specs §19)
export function SellClassic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useFetch(() => catalogApi.productDetail(id), [id]);

  const [form, setForm] = useState({ price: '', quantity: 1, description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await listingsApi.create({
        productId: id,
        price: Number(form.price),
        quantity: Number(form.quantity) || 1,
        description: form.description || undefined,
        ...form,
      });
      navigate(`/produits/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de créer l’offre');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingBlock />;
  if (!data) return null;

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <h1 className="page-title">Mettre en vente</h1>
      <p style={{ marginBottom: 'var(--space-5)' }}>
        <strong>{data.product.name}</strong> — <SeriesLabel series={data.product.series} />
      </p>

      <form onSubmit={onSubmit} className="card">
        <div className="field">
          <label htmlFor="price">Prix (€)</label>
          <input
            id="price"
            type="number"
            min="0.01"
            step="0.01"
            className="input"
            required
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </div>
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

        <div className="field">
          <label htmlFor="description">Description (facultatif)</label>
          <textarea
            id="description"
            className="textarea"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Publication...' : 'Publier l’offre'}
        </button>
      </form>
    </div>
  );
}
