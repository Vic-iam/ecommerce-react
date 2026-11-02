import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useProducts } from '../hooks.js';

export default function Home() {
  const { data, loading, error } = useProducts();
  return (
    <>
      <section className="hero">
        <h1>Bienvenidos a LosChamos</h1>
        <p>Productos venezolanos: despensa, bebidas, dulces y artesanías, directo a tu casa.</p>
        <Link className="btn" to="/productos">Ver productos</Link>
      </section>
      <h2>Destacados</h2>
      {loading && <p>Cargando...</p>}
      {error && <p className="out">{error}</p>}
      <div className="grid">
        {data?.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  );
}
