import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.me()
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true));
  }, []);

  const authenticate = async (call, body) => {
    const { token, user } = await call(body);
    localStorage.setItem('token', token);
    setUser(user);
  };

  const login = (body) => authenticate(api.login, body);
  const register = (body) => authenticate(api.register, body);
  const logout = async () => {
    await api.logout().catch(() => {});
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
