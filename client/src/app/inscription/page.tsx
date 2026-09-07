'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ pseudo: '', email: '', motDePasse: '', prenom: '', nom: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      router.replace('/');
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
            <label htmlFor="pseudo">Pseudo</label>
            <input id="pseudo" className="input" value={form.pseudo} onChange={update('pseudo')} required minLength={3} />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" className="input" value={form.email} onChange={update('email')} required />
          </div>
          <div className="field">
            <label htmlFor="motDePasse">Mot de passe</label>
            <input id="motDePasse" type="password" className="input" value={form.motDePasse} onChange={update('motDePasse')} required minLength={8} />
          </div>
          <div className="field">
            <label htmlFor="prenom">Prénom</label>
            <input id="prenom" className="input" value={form.prenom} onChange={update('prenom')} />
          </div>
          <div className="field">
            <label htmlFor="nom">Nom</label>
            <input id="nom" className="input" value={form.nom} onChange={update('nom')} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Déjà inscrit ? <Link href="/connexion" style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
