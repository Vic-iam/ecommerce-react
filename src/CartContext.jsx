import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

const CartContext = createContext(null);

function getCartId() {
  let id = localStorage.getItem('cartId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('cartId', id);
  }
  return id;
}

export function CartProvider({ children }) {
  const [cartId] = useState(getCartId);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.cart(cartId)
      .then((items) => {
        setItems(items);
        setError(null);
      })
      .catch(() => setItems([]));
  }, [cartId]);

  const addToCart = useCallback(async (productId, qty = 1) => {
    try {
      const items = await api.addToCart(cartId, productId, qty);
      setItems(items);
      setError(null);
      return items;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [cartId]);

  const setQuantity = useCallback(async (productId, qty) => {
    try {
      const items = await api.setQuantity(cartId, productId, qty);
      setItems(items);
      setError(null);
      return items;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [cartId]);

  const remove = useCallback(async (productId) => {
    try {
      const items = await api.remove(cartId, productId);
      setItems(items);
      setError(null);
      return items;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, [cartId]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addToCart, setQuantity, remove, error }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

