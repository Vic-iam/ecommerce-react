import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatPrice } from '../api.js';
import { useFetch } from '../hooks.js';
import { useCart } from '../CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, loading, error } = useFetch(() => api.product(id), [id]);
  const { items, addToCart } = useCart();
  const [msg, setMsg] = useState(null);

  if (loading) return <p>Cargando...</p>;
  if (error || !product) {
    return (
      <>
        <p>{error || 'Producto no encontrado.'}</p>
        <Link to="/productos">Volver al listado</Link>
      </>
    );
  }

  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;

  const handleAdd = async () => {
    try {
      await addToCart(product.id, 1);
      setMsg({ ok: true, text: 'Producto agregado al carrito' });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    }
  };

  return (
    <>
      <Link to="/productos">← Volver al listado</Link>
      <div className="detail">
        <img src={product.image} alt={product.name} />
        <div>
          <span className="tag">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="price big">{formatPrice(product.price)}</p>
          <p>{product.description}</p>
          <p className={product.stock > 0 ? 'ok' : 'out'}>
            {product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Sin stock'}
          </p>
          <button className="btn" disabled={product.stock === 0 || inCart >= product.stock} onClick={handleAdd}>
            Agregar al carrito
          </button>
          {inCart > 0 && <p>Ya tenés {inCart} en el <Link to="/carrito">carrito</Link>.</p>}
          {msg && <p className={msg.ok ? 'ok' : 'out'}>{msg.text}</p>}
        </div>
      </div>
    </>
  );
}
