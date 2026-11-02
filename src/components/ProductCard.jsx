import { Link } from 'react-router-dom';
import { formatPrice } from '../api.js';

export default function ProductCard({ product }) {
  return (
    <article className="card">
      <Link to={`/productos/${product.id}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="card-body">
        <span className="tag">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="price">{formatPrice(product.price)}</p>
        <Link className="btn" to={`/productos/${product.id}`}>Ver detalle</Link>
      </div>
    </article>
  );
}
