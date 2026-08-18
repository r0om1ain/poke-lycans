import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiError } from '../api/client.js';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card auth-card">
        <h1 className="page-title">Créer un compte</h1>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="username">Pseudo</label>
            <input id="username" className="input" value={form.username} onChange={update('username')} required minLength={3} />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" className="input" value={form.email} onChange={update('email')} required />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" className="input" value={form.password} onChange={update('password')} required minLength={8} />
          </div>
          <div className="field">
            <label htmlFor="firstName">Prénom</label>
            <input id="firstName" className="input" value={form.firstName} onChange={update('firstName')} />
          </div>
          <div className="field">
            <label htmlFor="lastName">Nom</label>
            <input id="lastName" className="input" value={form.lastName} onChange={update('lastName')} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Déjà inscrit ? <Link to="/connexion" style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
