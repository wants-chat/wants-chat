export function generateRoleGuard(roleConfig?: Record<string, { defaultRoute: string; roleName: string; aliases?: string[]; canAccess?: string[] }>): string {
  // Build role mapping and permissions from catalog
  let roleAliasMapping = '{}';
  let rolePermissionsMapping = '{}';

  if (roleConfig) {
    // Map database role names (including aliases) to catalog role name
    const aliasMap: Record<string, string> = {};
    const permissionsMap: Record<string, string[]> = {};

    for (const [roleKey, config] of Object.entries(roleConfig)) {
      const roleName = config.roleName.toLowerCase();
      const aliases = config.aliases || [];
      const canAccess = config.canAccess || [roleName];

      // Map roleName and all aliases to the canonical role name
      aliasMap[roleName] = roleName;
      for (const alias of aliases) {
        aliasMap[alias.toLowerCase()] = roleName;
      }

      // Store what this role can access
      permissionsMap[roleName] = canAccess.map(r => r.toLowerCase());
    }

    roleAliasMapping = JSON.stringify(aliasMap, null, 2).replace(/\n/g, '\n  ');
    rolePermissionsMapping = JSON.stringify(permissionsMap, null, 2).replace(/\n/g, '\n  ');
  }

  return `import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles: string[];
}

export default function RoleGuard({ children, requiredRoles }: RoleGuardProps) {
  const { user } = useAuth();

  // If no roles specified, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has one of the required roles
  // Try multiple possible locations for role data
  const userRole = user?.role || user?.appMetadata?.role || user?.metadata?.role || 'user';

  console.log('RoleGuard - Required roles:', requiredRoles, 'User role:', userRole, 'User:', user);

  // Role alias mapping: maps database role names to catalog role names
  const roleAliasMap: Record<string, string> = ${roleAliasMapping};

  // Role permissions: which routes each role can access
  const rolePermissions: Record<string, string[]> = ${rolePermissionsMapping};

  // Normalize user role to canonical role name
  const normalizedUserRole = userRole.toLowerCase();
  const canonicalRole = roleAliasMap[normalizedUserRole] || normalizedUserRole;

  // Get what routes this user can access
  const accessibleRoles = rolePermissions[canonicalRole] || [canonicalRole];

  console.log('RoleGuard - Canonical role:', canonicalRole, 'Can access:', accessibleRoles);

  // Check if any of the user's accessible roles match required roles
  const hasAccess = requiredRoles.some(requiredRole =>
    accessibleRoles.includes(requiredRole.toLowerCase())
  );

  if (!hasAccess) {
    // User doesn't have required role - redirect to login
    console.log('RoleGuard - Access denied, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
`;
}
