import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { accountApi } from '../../api/account.js';
import { ApiError } from '../../api/client.js';

export function AccountProfile() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', country: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        country: user.country ?? '',
      });
    }
  }, [user]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const { user: updated } = await accountApi.updateProfile(form);
      setUser(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Mise à jour impossible');
    } finally {
      setSubmitting(false);
    }
  }

  async function onLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Informations personnelles</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="firstName">Prénom</label>
          <input id="firstName" className="input" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="lastName">Nom</label>
          <input id="lastName" className="input" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="country">Pays</label>
          <input id="country" className="input" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
        </div>
        {error && <p className="form-error">{error}</p>}
        {saved && <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginBottom: 'var(--space-3)' }}>Enregistré.</p>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      <button type="button" className="btn btn-ghost" style={{ marginTop: 'var(--space-5)' }} onClick={onLogout}>
        Se déconnecter
      </button>
    </div>
  );
}
