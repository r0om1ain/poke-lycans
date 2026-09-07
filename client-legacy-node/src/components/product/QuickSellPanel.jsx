import { useState } from 'react';
import { listingsApi } from '../../api/listings.js';
import { ExemplarFormFields } from './ExemplarFormFields.jsx';
import { ApiError } from '../../api/client.js';

// Mise en vente classique (specs §19), directement sur la fiche produit —
// pas de navigation vers une page annexe : le formulaire s'ouvre sur place.
export function QuickSellPanel({ productId, onCreated, onCancel }) {
  const [form, setForm] = useState({ price: '', quantity: 1, description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { listing } = await listingsApi.create({
        productId,
        price: Number(form.price),
        quantity: Number(form.quantity) || 1,
        description: form.description || undefined,
        ...form,
      });
      onCreated(listing);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de créer l’offre');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="quick-panel">
      <div className="quick-panel__grid">
        <div className="field">
          <label htmlFor="qs-price">Prix (€)</label>
          <input
            id="qs-price"
            type="number"
            min="0.01"
            step="0.01"
            className="input"
            required
            autoFocus
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="qs-quantity">Quantité</label>
          <input
            id="qs-quantity"
            type="number"
            min="1"
            className="input"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
        </div>

        <ExemplarFormFields value={form} onChange={setForm} />

        <div className="field quick-panel__span">
          <label htmlFor="qs-description">Commentaire (facultatif)</label>
          <textarea
            id="qs-description"
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
          {submitting ? 'Publication...' : 'Publier l’offre'}
        </button>
      </div>
    </form>
  );
}
