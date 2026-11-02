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

  useEffect(() => {
    api.cart(cartId).then(setItems).catch(() => {});
  }, [cartId]);

  const addToCart = useCallback(async (productId, qty = 1) => setItems(await api.addToCart(cartId, productId, qty)), [cartId]);
  const setQuantity = useCallback(async (productId, qty) => setItems(await api.setQuantity(cartId, productId, qty)), [cartId]);
  const remove = useCallback(async (productId) => setItems(await api.remove(cartId, productId)), [cartId]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addToCart, setQuantity, remove }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
