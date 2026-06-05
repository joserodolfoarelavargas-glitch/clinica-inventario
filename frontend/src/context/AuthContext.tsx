import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { login as loginApi, getCurrentUser } from '../services/api';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
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
          const data = await getCurrentUser();
          // Mapeamos 'correo' del backend a 'email' para el frontend
          setUser({ ...data, email: data.correo });
          setToken(storedToken);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password);
    const { access_token } = response;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    
    const data = await getCurrentUser();
    setUser({ ...data, email: data.correo });
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