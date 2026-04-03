/**
 * Generate RoleBasedRedirect component
 * Redirects users to their role-specific dashboard based on authentication
 */
export function generateRoleBasedRedirect(roleConfig: Record<string, { defaultRoute: string; roleName: string; aliases?: string[]; canAccess?: string[] }>): string {
  // Generate role mapping logic from catalog
  const roleMapping = Object.entries(roleConfig)
    .map(([roleKey, config]) => {
      const roleName = config.roleName.toLowerCase();
      const aliases = config.aliases || [];

      // All role names that should map to this route: roleName + aliases
      const allRoleNames = [roleName, ...aliases.map(a => a.toLowerCase())];

      // Generate case statements for role and all its aliases
      return allRoleNames.map(alias => `      case '${alias}':`)
        .join('\n') + `\n        return '${config.defaultRoute}';`;
    })
    .join('\n');

  // Get first role's route as fallback
  const fallbackRoute = Object.values(roleConfig)[0]?.defaultRoute || '/dashboard';

  return `import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * RoleBasedRedirect
 * Redirects authenticated users to their role-specific dashboard
 * Generated from catalog roleConfig
 */
export default function RoleBasedRedirect() {
  const { user, isLoading } = useAuth();

  // Wait for auth to load
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Get user's role from multiple possible locations
  const userRole = user?.role || user?.appMetadata?.role || user?.metadata?.role || 'user';

  console.log('RoleBasedRedirect - User role:', userRole, 'User object:', user);

  // Determine redirect target based on role
  const getRedirectPath = (role: string): string => {
    switch (role.toLowerCase()) {
${roleMapping}
      default:
        return '${fallbackRoute}';
    }
  };

  const redirectPath = getRedirectPath(userRole);
  console.log('RoleBasedRedirect - Redirecting to:', redirectPath);

  return <Navigate to={redirectPath} replace />;
}
`;
}
