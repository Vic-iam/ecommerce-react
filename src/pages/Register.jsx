import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      <h1>Crear cuenta</h1>
      <label>Nombre<input type="text" placeholder="Tu nombre" /></label>
      <label>Email<input type="email" placeholder="tu@email.com" /></label>
      <label>Contraseña<input type="password" placeholder="Mínimo 6 caracteres" /></label>
      <label>Repetir contraseña<input type="password" placeholder="••••••••" /></label>
      <button className="btn" type="submit">Registrarse</button>
      <p>¿Ya tenés cuenta? <Link to="/login">Ingresá</Link></p>
    </form>
  );
}

