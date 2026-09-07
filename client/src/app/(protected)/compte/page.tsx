'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { accountApi } from '@/lib/api/account';
import { ApiError } from '@/lib/api/client';

// Pas de carnet d'adresses côté backend (datPersonne ne porte qu'une adresse
// inline) : les champs adresse font partie du même formulaire de profil.
export default function AccountProfilePage() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', adresse: '', codePostal: '', ville: '', pays: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom ?? '',
        prenom: user.prenom ?? '',
        telephone: user.telephone ?? '',
        adresse: user.adresse ?? '',
        codePostal: user.codePostal ?? '',
        ville: user.ville ?? '',
        pays: user.pays ?? '',
      });
    }
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const updated = await accountApi.updateProfile(form);
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
    router.push('/');
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2 style={{ marginBottom: 'var(--space-4)' }}>Informations personnelles</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" className="input" value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="nom">Nom</label>
          <input id="nom" className="input" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" className="input" value={user?.email ?? ''} disabled />
        </div>
        <div className="field">
          <label htmlFor="telephone">Téléphone</label>
          <input id="telephone" className="input" value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="adresse">Adresse</label>
          <input id="adresse" className="input" value={form.adresse} onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="codePostal">Code postal</label>
          <input id="codePostal" className="input" value={form.codePostal} onChange={(e) => setForm((f) => ({ ...f, codePostal: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="ville">Ville</label>
          <input id="ville" className="input" value={form.ville} onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="pays">Pays</label>
          <input id="pays" className="input" value={form.pays} onChange={(e) => setForm((f) => ({ ...f, pays: e.target.value }))} />
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
