import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog.js';
import { auctionsApi } from '../api/auctions.js';
import { useFetch } from '../hooks/useApi.js';
import { ExemplarFormFields } from '../components/product/ExemplarFormFields.jsx';
import { SeriesLabel } from '../components/product/SeriesLabel.jsx';
import { LoadingBlock } from '../components/common/Spinner.jsx';
import { ApiError } from '../api/client.js';

const MAX_DAYS = 7;

function defaultEndAt() {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}

// Création d'une enchère (specs §42-44) — durée max 7 jours, prix de réserve optionnel.
export function CreateAuction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useFetch(() => catalogApi.productDetail(id), [id]);

  const [form, setForm] = useState({
    startPrice: '',
    useReserve: false,
    reservePrice: '',
    endAt: defaultEndAt(),
    description: '',
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    const maxDate = new Date(Date.now() + MAX_DAYS * 24 * 60 * 60 * 1000);
    if (new Date(form.endAt) > maxDate) {
      setError(`La date de fin ne peut pas dépasser ${MAX_DAYS} jours.`);
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set('productId', id);
      fd.set('startPrice', form.startPrice);
      fd.set('endAt', new Date(form.endAt).toISOString());
      if (form.useReserve && form.reservePrice) fd.set('reservePrice', form.reservePrice);
      if (form.description) fd.set('description', form.description);
      for (const key of ['state', 'languageId', 'holo', 'firstEdition', 'pokeball', 'miscutMisprint', 'stamp', 'reverse', 'graded', 'gradingCompanyId', 'gradingNote']) {
        if (form[key] !== undefined && form[key] !== '') fd.set(key, form[key]);
      }
      for (const file of photos) fd.append('photos', file);

      const { auction } = await auctionsApi.create(fd);
      navigate(`/encheres/${auction.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de créer l’enchère');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingBlock />;
  if (!data) return null;

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <h1 className="page-title">Créer une enchère</h1>
      <p style={{ marginBottom: 'var(--space-5)' }}>
        <strong>{data.product.name}</strong> — <SeriesLabel series={data.product.series} />
      </p>

      <form onSubmit={onSubmit} className="card">
        <div className="field">
          <label htmlFor="photos">Photos du produit réel</label>
          <input id="photos" type="file" accept="image/*" multiple onChange={(e) => setPhotos([...e.target.files])} />
        </div>

        <div className="field">
          <label htmlFor="startPrice">Prix de départ (€)</label>
          <input
            id="startPrice"
            type="number"
            min="0.01"
            step="0.01"
            className="input"
            required
            value={form.startPrice}
            onChange={(e) => setForm((f) => ({ ...f, startPrice: e.target.value }))}
          />
        </div>

        <div className="field">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.useReserve}
              onChange={(e) => setForm((f) => ({ ...f, useReserve: e.target.checked }))}
            />
            Prix de réserve
          </label>
        </div>
        {form.useReserve && (
          <div className="field">
            <label htmlFor="reservePrice">Montant du prix de réserve (€)</label>
            <input
              id="reservePrice"
              type="number"
              min="0.01"
              step="0.01"
              className="input"
              value={form.reservePrice}
              onChange={(e) => setForm((f) => ({ ...f, reservePrice: e.target.value }))}
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="endAt">Date et heure de fin (max {MAX_DAYS} jours)</label>
          <input
            id="endAt"
            type="datetime-local"
            className="input"
            required
            value={form.endAt}
            onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
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
          {submitting ? 'Création...' : 'Créer l’enchère'}
        </button>
      </form>
    </div>
  );
}
