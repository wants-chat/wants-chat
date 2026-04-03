import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../hooks/useOnboarding';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Skip onboarding check for specific routes (like the onboarding page itself) */
  skipOnboardingCheck?: boolean;
}

/**
 * ProtectedRoute component - wraps protected pages that require authentication.
 * Also adds noindex/nofollow meta tag to prevent search engine indexing.
 * Redirects to onboarding if user hasn't completed it yet.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  skipOnboardingCheck = false
}) => {
  const { isAuthenticated, loading } = useAuth();
  // Only check onboarding AFTER user is authenticated (and not skipping check)
  const {
    shouldShowOnboarding,
    loading: onboardingLoading,
    checked: onboardingChecked
  } = useOnboarding({
    enabled: isAuthenticated && !loading && !skipOnboardingCheck
  });
  const location = useLocation();

  // Add noindex/nofollow meta tag for protected pages (SEO)
  useEffect(() => {
    // Check if meta tag already exists
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;

    // Store original content to restore later
    const originalContent = metaRobots?.getAttribute('content') || 'index, follow';

    if (metaRobots) {
      // Update existing meta tag
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      // Create new meta tag
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      metaRobots.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(metaRobots);
    }

    // Cleanup: restore original robots meta tag when leaving protected route
    return () => {
      const currentMetaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
      if (currentMetaRobots) {
        currentMetaRobots.setAttribute('content', originalContent);
      }
    };
  }, [location.pathname]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Show loading while checking onboarding status (only if we need to check)
  if (!skipOnboardingCheck && onboardingLoading && !onboardingChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  // Redirect to onboarding if user hasn't completed it
  if (!skipOnboardingCheck && shouldShowOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
