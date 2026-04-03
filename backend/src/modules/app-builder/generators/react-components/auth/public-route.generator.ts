export function generatePublicRoute(): string {
  return `import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    // Redirect to home page if already authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}`;
}
