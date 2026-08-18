import { useState } from 'react';
import { accountApi } from '../../api/account.js';
import { useFetch } from '../../hooks/useApi.js';
import { LoadingBlock } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ApiError } from '../../api/client.js';
import { formatPrice } from '../../lib/format.js';

const empty = { name: '', price: '', country: '' };

export function AccountShipping() {
  const { data, loading, refresh } = useFetch(() => accountApi.listShippingMethods(), []);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await accountApi.createShippingMethod({ ...form, price: Number(form.price) });
      setForm(empty);
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ajout impossible');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(method) {
    await accountApi.updateShippingMethod(method.id, { active: !method.active });
    refresh();
  }

  async function onRemove(id) {
    await accountApi.removeShippingMethod(id);
    refresh();
  }

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-2)' }}>Modes de livraison (vendeur)</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 'var(--space-4)' }}>
        Proposés aux acheteurs dans le panier pour vos offres.
      </p>

      {data.shippingMethods.length === 0 && <EmptyState title="Aucun mode de livraison configuré" />}

      <div className="row-list" style={{ marginBottom: 'var(--space-5)' }}>
        {data.shippingMethods.map((m) => (
          <div className="list-item-row" key={m.id}>
            <div>
              <strong>{m.name}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatPrice(m.price)}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(m)}>
                {m.active ? 'Désactiver' : 'Activer'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onRemove(m.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>Ajouter un mode de livraison</button>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420 }}>
          <div className="field">
            <label htmlFor="name">Nom (ex : Mondial Relay)</label>
            <input id="name" className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="price">Prix (€)</label>
            <input id="price" type="number" min="0" step="0.01" className="input" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="country">Pays (facultatif, sinon valable partout)</label>
            <input id="country" className="input" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>Enregistrer</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}
    </div>
  );
}
