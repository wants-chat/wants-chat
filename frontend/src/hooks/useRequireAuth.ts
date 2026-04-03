import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook that ensures user is authenticated before accessing a component.
 * Handles the loading state properly to avoid unnecessary redirects on page refresh.
 * 
 * @param redirectTo - The route to redirect to if user is not authenticated (default: '/login')
 * @returns The authentication context values
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if auth is not loading and user is not authenticated
    if (!auth.loading && !auth.isAuthenticated) {
      navigate(redirectTo);
    }
  }, [auth.loading, auth.isAuthenticated, navigate, redirectTo]);

  return auth;
};