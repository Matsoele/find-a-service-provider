import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('fasp_token');
    if (!t) { setLoading(false); return; }
    api.get('/auth/me')
      .then((r) => { setUser(r.data.user); setProvider(r.data.provider); })
      .catch(() => localStorage.removeItem('fasp_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, u, p) => {
    localStorage.setItem('fasp_token', token);
    setUser(u); setProvider(p);
  };

  const logout = () => {
    localStorage.removeItem('fasp_token');
    setUser(null); setProvider(null);
  };

  return (
    <AuthContext.Provider value={{ user, provider, loading, login, logout, setProvider }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);