import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden');
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h1>Crear cuenta</h1>
      {error && <p className="out">{error}</p>}
      <label>Nombre<input type="text" placeholder="Tu nombre" value={form.name} onChange={set('name')} required /></label>
      <label>Email<input type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} required /></label>
      <label>Contraseña<input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} required minLength={6} /></label>
      <label>Repetir contraseña<input type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required /></label>
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Creando...' : 'Registrarse'}</button>
      <p>¿Ya tenés cuenta? <Link to="/login">Ingresá</Link></p>
    </form>
  );
}
