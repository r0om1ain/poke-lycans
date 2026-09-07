'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api/client';
import { LoadingBlock } from '@/components/common/Spinner';

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, motDePasse);
      router.replace(searchParams.get('from') ?? '/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card auth-card">
        <h1 className="page-title">Connexion</h1>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="motDePasse">Mot de passe</label>
            <input id="motDePasse" type="password" className="input" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p style={{ marginTop: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Pas encore de compte ? <Link href="/inscription" style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>S’inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <LoginInner />
    </Suspense>
  );
}
