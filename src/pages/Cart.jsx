import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../api.js';
import { useCart } from '../CartContext.jsx';

export default function Cart() {
  const { items, total, setQuantity, remove } = useCart();
  const [error, setError] = useState(null);

  const run = async (fn) => {
    setError(null);
    try { await fn(); } catch (e) { setError(e.message); }
  };

  if (items.length === 0) {
    return (
      <>
        <h1>Carrito</h1>
        <p>Tu carrito está vacío.</p>
        <Link className="btn" to="/productos">Ver productos</Link>
      </>
    );
  }

  return (
    <>
      <h1>Carrito</h1>
      {error && <p className="out">{error}</p>}
      <div className="cart">
        {items.map((i) => (
          <div className="cart-row" key={i.productId}>
            <img src={i.image} alt={i.name} />
            <div className="cart-info">
              <Link to={`/productos/${i.productId}`}>{i.name}</Link>
              <span>{formatPrice(i.price)}</span>
            </div>
            <div className="qty">
              <button onClick={() => run(() => setQuantity(i.productId, i.quantity - 1))}>−</button>
              <span>{i.quantity}</span>
              <button disabled={i.quantity >= i.stock} onClick={() => run(() => setQuantity(i.productId, i.quantity + 1))}>+</button>
            </div>
            <strong>{formatPrice(i.price * i.quantity)}</strong>
            <button className="link-btn" onClick={() => run(() => remove(i.productId))}>Quitar</button>
          </div>
        ))}
        <p className="total">Total: {formatPrice(total)}</p>
      </div>
    </>
  );
}
