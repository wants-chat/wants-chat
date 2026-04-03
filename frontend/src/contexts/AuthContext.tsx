import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, isApiError, getErrorMessage } from '../lib/api';
import { authService, socketService } from '../services';
import type { User } from '../services';

// User interface is now imported from services

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for auth token storage event (from OAuth callback)
  useEffect(() => {
    const handleAuthTokenStored = () => {
      console.log('🔐 Auth token stored event received, refetching user...');
      checkAuth();
    };

    window.addEventListener('auth-token-stored', handleAuthTokenStored);
    return () => window.removeEventListener('auth-token-stored', handleAuthTokenStored);
  }, []);

  // Socket connection is now handled by useRealTime hook in components that need it
  // This prevents duplicate connection attempts and connection loops

  const checkAuth = async () => {
    try {
      setError(null);
      
      // Debug: Check what's in localStorage
      for (const key of Object.keys(localStorage)) {
      }
      
      // Ensure tokens are loaded from localStorage
      api.initializeTokens();
      
      // API client now handles localStorage fallback automatically
      const token = api.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Validate token by fetching user profile
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      if (isApiError(error) && error.statusCode === 401) {
        // Token is invalid, clear it
        api.setTokens(null, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setError(getErrorMessage(error));
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      setUser(null);
      
      const response = await authService.login({ email, password });
      const userData = response.user;
      setUser(userData);
      
      return userData;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Login error:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      setUser(null);
      
      const response = await authService.register({ email, password, name });
      const userData = response.user;
      setUser(userData);
      
      return userData;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Register error:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      socketService.disconnect();
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Check both user state AND token existence for authentication
  const hasValidToken = !!api.getToken();

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user && hasValidToken,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};