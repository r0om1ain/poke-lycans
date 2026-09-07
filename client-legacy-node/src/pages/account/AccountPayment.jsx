import { useState } from 'react';
import { accountApi } from '../../api/account.js';
import { useFetch } from '../../hooks/useApi.js';
import { LoadingBlock } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ApiError } from '../../api/client.js';

const empty = { type: 'card', label: '', last4: '' };

export function AccountPayment() {
  const { data, loading, refresh } = useFetch(() => accountApi.listPaymentMethods(), []);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await accountApi.createPaymentMethod(form);
      setForm(empty);
      setShowForm(false);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ajout impossible');
    } finally {
      setSubmitting(false);
    }
  }

  async function onRemove(id) {
    await accountApi.removePaymentMethod(id);
    refresh();
  }

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Moyens de paiement</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 'var(--space-4)' }}>
        Le paiement est simulé sur cette version de la plateforme.
      </p>

      {data.paymentMethods.length === 0 && <EmptyState title="Aucun moyen de paiement enregistré" />}

      <div className="row-list" style={{ marginBottom: 'var(--space-5)' }}>
        {data.paymentMethods.map((m) => (
          <div className="list-item-row" key={m.id}>
            <div>
              <strong>{m.label}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {m.type}{m.last4 ? ` · •••• ${m.last4}` : ''}
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => onRemove(m.id)}>Supprimer</button>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>Ajouter un moyen de paiement</button>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420 }}>
          <div className="field">
            <label htmlFor="label">Nom</label>
            <input id="label" className="input" required value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="last4">4 derniers chiffres (facultatif)</label>
            <input id="last4" className="input" maxLength={4} value={form.last4} onChange={(e) => setForm((f) => ({ ...f, last4: e.target.value }))} />
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
