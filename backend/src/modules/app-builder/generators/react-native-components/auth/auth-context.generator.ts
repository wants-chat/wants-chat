/**
 * Generate Auth Context for React Native mobile app
 *
 * Creates a context-based authentication system with:
 * - User state management
 * - Login/register/logout functionality
 * - Token persistence using AsyncStorage
 * - Auth state checking on app load
 */
export function generateAuthContext(): string {
  return `import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Load token and user from AsyncStorage (matches frontend behavior)
      const token = await AsyncStorage.getItem('auth_token');
      const savedUser = await AsyncStorage.getItem('auth_user');

      if (token) {
        // Restore user from storage if available
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            console.error('Failed to parse saved user data');
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password }, { requireAuth: false });

    // Handle multiple possible response formats (matches frontend behavior)
    const token = response.data?.access_token || response.access_token || response.token;
    const user = response.data?.user || response.user;

    if (!token) {
      throw new Error('No token received from server');
    }

    // Store both token and user data (matches frontend behavior)
    await AsyncStorage.setItem('auth_token', token);
    if (user) {
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    }
    setUser(user);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await apiClient.post('/auth/register', { email, password, name }, { requireAuth: false });

    // Handle multiple possible response formats (matches frontend behavior)
    const token = response.data?.access_token || response.access_token || response.token;
    const user = response.data?.user || response.user;

    if (!token) {
      throw new Error('No token received from server');
    }

    // Store both token and user data (matches frontend behavior)
    await AsyncStorage.setItem('auth_token', token);
    if (user) {
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    }
    setUser(user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};`;
}
