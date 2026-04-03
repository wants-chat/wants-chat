export function generateAuthContext(): string {
  return `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  phone?: string;
  bio?: string;
  appMetadata?: {
    role?: string;
    [key: string]: any;
  };
  metadata?: {
    role?: string;
    [key: string]: any;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse saved user data');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ success?: boolean; data?: { access_token?: string; token?: string; user?: User } }>('/auth/login', { email, password });

    // Backend wraps response in {success, data: {access_token, user}}
    const data = (response as any).data || response;
    const newToken = (data as any).access_token || (data as any).token;
    const userData = (data as any).user;

    if (!newToken) {
      throw new Error('No token received from server');
    }

    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);

    if (userData) {
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await apiClient.post<{ success?: boolean; data?: { access_token?: string; token?: string; user?: User } }>('/auth/signup', { email, password, name });

    // Backend wraps response in {success, data: {access_token, user}}
    const data = (response as any).data || response;
    const newToken = (data as any).access_token || (data as any).token;
    const userData = (data as any).user;

    if (!newToken) {
      throw new Error('No token received from server');
    }

    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);

    if (userData) {
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, token, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}`;
}
