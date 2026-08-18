import { useState } from 'react';
import { accountApi } from '../../api/account.js';
import { useFetch } from '../../hooks/useApi.js';
import { LoadingBlock } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ApiError } from '../../api/client.js';

const empty = { label: '', recipient: '', line1: '', line2: '', city: '', zip: '', country: '', phone: '' };

export function AccountAddresses() {
  const { data, loading, refresh } = useFetch(() => accountApi.listAddresses(), []);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await accountApi.createAddress(form);
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
    await accountApi.removeAddress(id);
    refresh();
  }

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Adresses</h2>

      {data.addresses.length === 0 && <EmptyState title="Aucune adresse enregistrée" />}

      <div className="row-list" style={{ marginBottom: 'var(--space-5)' }}>
        {data.addresses.map((a) => (
          <div className="list-item-row" key={a.id}>
            <div>
              <strong>{a.label}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {a.recipient} — {a.line1}, {a.zip} {a.city}, {a.country}
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => onRemove(a.id)}>Supprimer</button>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>Ajouter une adresse</button>
      ) : (
        <form onSubmit={onSubmit} className="card" style={{ maxWidth: 480 }}>
          {[
            ['label', 'Nom de l’adresse (ex : Domicile)'],
            ['recipient', 'Destinataire'],
            ['line1', 'Adresse'],
            ['line2', 'Complément (facultatif)'],
            ['city', 'Ville'],
            ['zip', 'Code postal'],
            ['country', 'Pays'],
            ['phone', 'Téléphone (facultatif)'],
          ].map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                className="input"
                required={!['line2', 'phone'].includes(key)}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
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
