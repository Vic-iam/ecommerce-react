import { useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { useProducts } from '../hooks.js';

export default function Products() {
  const { data, loading, error } = useProducts();
  const [category, setCategory] = useState('Todas');
  const [query, setQuery] = useState('');

  const products = data ?? [];
  const categories = ['Todas', ...new Set(products.map((p) => p.category))];
  const filtered = products.filter(
    (p) =>
      (category === 'Todas' || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <h1>Productos</h1>
      <div className="filters">
        <input placeholder="Buscar producto..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p className="out">{error}</p>}
      {data && filtered.length === 0 && <p>No se encontraron productos.</p>}
      <div className="grid">
        {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  );
}
