'use client';

import { useState } from 'react';
import { listingsApi } from '@/lib/api/listings';
import { ExemplarFormFields } from './ExemplarFormFields';
import { ApiError } from '@/lib/api/client';
import type { Annonce, ItemKind } from '@/types';

// Mise en vente classique (specs §19), directement sur la fiche produit.
// Photos multiples possibles (datPhotoAnnonce) — auparavant réservées aux enchères.
export function QuickSellPanel({
  kind,
  itemId,
  onCreated,
  onCancel,
}: {
  kind: ItemKind;
  itemId: number;
  onCreated: (listing: Annonce) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({ prix: '', quantite: 1, description: '' });
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set(kind === 'carte' ? 'idCarte' : 'idItem', String(itemId));
      fd.set('prix', String(form.prix));
      fd.set('quantite', String(Number(form.quantite) || 1));
      if (form.description) fd.set('description', String(form.description));
      for (const key of ['etat', 'idLangue', 'holo', 'edition1', 'pokeball', 'misscut', 'missprint', 'stamp', 'reverse', 'grade', 'idSocieteGradation', 'noteGradation']) {
        if (form[key] !== undefined && form[key] !== '') fd.set(key, String(form[key]));
      }
      for (const file of photos) fd.append('photos', file);

      const listing = await listingsApi.create(fd);
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
        <div className="field quick-panel__span">
          <label htmlFor="qs-photos">Photos (facultatif)</label>
          <input id="qs-photos" type="file" accept="image/*" multiple onChange={(e) => setPhotos([...(e.target.files ?? [])])} />
        </div>

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
            value={form.prix as string}
            onChange={(e) => setForm((f) => ({ ...f, prix: e.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="qs-quantity">Quantité</label>
          <input
            id="qs-quantity"
            type="number"
            min="1"
            className="input"
            value={form.quantite as number}
            onChange={(e) => setForm((f) => ({ ...f, quantite: e.target.value }))}
          />
        </div>

        <ExemplarFormFields value={form} onChange={setForm} />

        <div className="field quick-panel__span">
          <label htmlFor="qs-description">Commentaire (facultatif)</label>
          <textarea
            id="qs-description"
            className="textarea"
            value={form.description as string}
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
