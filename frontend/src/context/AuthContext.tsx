import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as loginApi, getCurrentUser } from '../services/api';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'responsable';
  area: string | null;
}

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (correo: string, password: string) => {
    const response = await loginApi(correo, password);
    const { access_token } = response;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};