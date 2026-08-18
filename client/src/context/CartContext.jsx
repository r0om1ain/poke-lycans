import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cartApi } from '../api/cart.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ sellers: [], summary: { sellerCount: 0, itemCount: 0, totalValue: 0 } });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart({ sellers: [], summary: { sellerCount: 0, itemCount: 0, totalValue: 0 } });
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

  const add = useCallback(async (listingId, quantity = 1) => {
    const data = await cartApi.add(listingId, quantity);
    setCart(data);
    return data;
  }, []);

  const updateQuantity = useCallback(async (id, quantity) => {
    const data = await cartApi.updateQuantity(id, quantity);
    setCart(data);
    return data;
  }, []);

  const remove = useCallback(async (id) => {
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
