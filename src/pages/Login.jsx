import { Link } from 'react-router-dom';

// Solo maquetado: no envía datos a ningún lado
export default function Login() {
  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      <h1>Ingresar</h1>
      <label>Email<input type="email" placeholder="tu@email.com" /></label>
      <label>Contraseña<input type="password" placeholder="••••••••" /></label>
      <button className="btn" type="submit">Ingresar</button>
      <p>¿No tenés cuenta? <Link to="/registro">Registrate</Link></p>
    </form>
  );
}
