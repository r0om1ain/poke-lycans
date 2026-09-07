import { useState } from 'react';
import { auctionsApi } from '../../api/auctions.js';
import { ExemplarFormFields } from './ExemplarFormFields.jsx';
import { ApiError } from '../../api/client.js';

const MAX_DAYS = 7;

function defaultEndAt() {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}

// Création d'une enchère (specs §42-44), directement sur la fiche produit —
// même logique que QuickSellPanel : pas de page annexe.
export function QuickAuctionPanel({ productId, onCreated, onCancel }) {
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
      fd.set('productId', productId);
      fd.set('startPrice', form.startPrice);
      fd.set('endAt', new Date(form.endAt).toISOString());
      if (form.useReserve && form.reservePrice) fd.set('reservePrice', form.reservePrice);
      if (form.description) fd.set('description', form.description);
      for (const key of ['state', 'languageId', 'holo', 'firstEdition', 'pokeball', 'miscutMisprint', 'stamp', 'reverse', 'graded', 'gradingCompanyId', 'gradingNote']) {
        if (form[key] !== undefined && form[key] !== '') fd.set(key, form[key]);
      }
      for (const file of photos) fd.append('photos', file);

      const { auction } = await auctionsApi.create(fd);
      onCreated(auction);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de créer l’enchère');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="quick-panel">
      <div className="quick-panel__grid">
        <div className="field quick-panel__span">
          <label htmlFor="qa-photos">Photos du produit réel</label>
          <input id="qa-photos" type="file" accept="image/*" multiple onChange={(e) => setPhotos([...e.target.files])} />
        </div>

        <div className="field">
          <label htmlFor="qa-startPrice">Prix de départ (€)</label>
          <input
            id="qa-startPrice"
            type="number"
            min="0.01"
            step="0.01"
            className="input"
            required
            autoFocus
            value={form.startPrice}
            onChange={(e) => setForm((f) => ({ ...f, startPrice: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="qa-endAt">Fin (max {MAX_DAYS} jours)</label>
          <input
            id="qa-endAt"
            type="datetime-local"
            className="input"
            required
            value={form.endAt}
            onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
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
            <label htmlFor="qa-reservePrice">Montant du prix de réserve (€)</label>
            <input
              id="qa-reservePrice"
              type="number"
              min="0.01"
              step="0.01"
              className="input"
              value={form.reservePrice}
              onChange={(e) => setForm((f) => ({ ...f, reservePrice: e.target.value }))}
            />
          </div>
        )}

        <ExemplarFormFields value={form} onChange={setForm} />

        <div className="field quick-panel__span">
          <label htmlFor="qa-description">Description (facultatif)</label>
          <textarea
            id="qa-description"
            className="textarea"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      <div className="quick-panel__actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Création...' : 'Créer l’enchère'}
        </button>
      </div>
    </form>
  );
}
