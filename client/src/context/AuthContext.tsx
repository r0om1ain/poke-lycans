'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import type { Personne } from '@/types';

interface AuthContextValue {
  user: Personne | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<Personne>;
  register: (data: { pseudo: string; email: string; motDePasse: string; nom: string; prenom: string }) => Promise<Personne>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: Personne | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Personne | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const user = await authApi.me();
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, motDePasse: string) => {
    const user = await authApi.login({ email, motDePasse });
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data: { pseudo: string; email: string; motDePasse: string; nom: string; prenom: string }) => {
    const user = await authApi.register(data);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
