import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <div className="container nav">
        <Link to="/" className="logo">LosChamos</Link>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/productos">Productos</NavLink>
          <NavLink to="/carrito">Carrito ({count})</NavLink>
          {user ? (
            <>
              <span className="user">Hola, {user.name}</span>
              <button className="link-btn plain" onClick={logout}>Salir</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Iniciar sesion</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
