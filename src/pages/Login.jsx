import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h1>Ingresar</h1>
      {error && <p className="out">{error}</p>}
      <label>Email<input type="email" placeholder="tu@email.com" value={form.email} onChange={set('email')} required /></label>
      <label>Contraseña<input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required /></label>
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Ingresando...' : 'Ingresar'}</button>
      <p>¿No tenés cuenta? <Link to="/registro">Registrate</Link></p>
    </form>
  );
}
