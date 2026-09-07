'use client';

import { useState } from 'react';
import { auctionsApi } from '@/lib/api/auctions';
import { ExemplarFormFields } from './ExemplarFormFields';
import { ApiError } from '@/lib/api/client';
import type { EnchereDetail, ItemKind } from '@/types';

const MAX_DAYS = 7;

function defaultEndAt() {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}

export function QuickAuctionPanel({
  kind,
  itemId,
  onCreated,
  onCancel,
}: {
  kind: ItemKind;
  itemId: number;
  onCreated: (auction: EnchereDetail) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({
    prixDepart: '',
    useReserve: false,
    prixReserve: '',
    endAt: defaultEndAt(),
    description: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const maxDate = new Date(Date.now() + MAX_DAYS * 24 * 60 * 60 * 1000);
    const endDate = new Date(form.endAt as string);
    if (endDate > maxDate) {
      setError(`La date de fin ne peut pas dépasser ${MAX_DAYS} jours.`);
      return;
    }
    // Le backend ne stocke qu'une durée en jours (pas de date de fin absolue).
    const dureeJours = Math.min(MAX_DAYS, Math.max(1, Math.ceil((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))));

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set(kind === 'carte' ? 'idCarte' : 'idItem', String(itemId));
      fd.set('prixDepart', form.prixDepart as string);
      fd.set('dureeJours', String(dureeJours));
      if (form.useReserve && form.prixReserve) fd.set('prixReserve', form.prixReserve as string);
      if (form.description) fd.set('description', form.description as string);
      for (const key of ['etat', 'idLangue', 'holo', 'edition1', 'pokeball', 'misscut', 'missprint', 'stamp', 'reverse', 'grade', 'idSocieteGradation', 'noteGradation']) {
        if (form[key] !== undefined && form[key] !== '') fd.set(key, String(form[key]));
      }
      for (const file of photos) fd.append('photos', file);

      const auction = await auctionsApi.create(fd);
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
          <input id="qa-photos" type="file" accept="image/*" multiple onChange={(e) => setPhotos([...(e.target.files ?? [])])} />
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
            value={form.prixDepart as string}
            onChange={(e) => setForm((f) => ({ ...f, prixDepart: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="qa-endAt">Fin (max {MAX_DAYS} jours)</label>
          <input
            id="qa-endAt"
            type="datetime-local"
            className="input"
            required
            value={form.endAt as string}
            onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
          />
        </div>

        <div className="field">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.useReserve as boolean}
              onChange={(e) => setForm((f) => ({ ...f, useReserve: e.target.checked }))}
            />
            Prix de réserve
          </label>
        </div>
        {Boolean(form.useReserve) && (
          <div className="field">
            <label htmlFor="qa-reservePrice">Montant du prix de réserve (€)</label>
            <input
              id="qa-reservePrice"
              type="number"
              min="0.01"
              step="0.01"
              className="input"
              value={form.prixReserve as string}
              onChange={(e) => setForm((f) => ({ ...f, prixReserve: e.target.value }))}
            />
          </div>
        )}

        <ExemplarFormFields value={form} onChange={setForm} />

        <div className="field quick-panel__span">
          <label htmlFor="qa-description">Description (facultatif)</label>
          <textarea
            id="qa-description"
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
          {submitting ? 'Création...' : 'Créer l’enchère'}
        </button>
      </div>
    </form>
  );
}
