'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { cartApi } from '@/lib/api/cart';
import { useAuth } from './AuthContext';
import type { Panier } from '@/types';

interface CartContextValue {
  cart: Panier;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (idAnnonce: number, quantite?: number) => Promise<Panier>;
  updateQuantity: (id: number, quantite: number) => Promise<Panier>;
  remove: (id: number) => Promise<Panier>;
}

const EMPTY_CART: Panier = { vendeurs: [], summary: { nombreVendeurs: 0, nombreArticles: 0, valeurTotale: 0 } };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Panier>(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(EMPTY_CART);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(async (idAnnonce: number, quantite = 1) => {
    const data = await cartApi.add(idAnnonce, quantite);
    setCart(data);
    return data;
  }, []);

  const updateQuantity = useCallback(async (id: number, quantite: number) => {
    const data = await cartApi.updateQuantity(id, quantite);
    setCart(data);
    return data;
  }, []);

  const remove = useCallback(async (id: number) => {
    const data = await cartApi.remove(id);
    setCart(data);
    return data;
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, refresh, add, updateQuantity, remove }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
