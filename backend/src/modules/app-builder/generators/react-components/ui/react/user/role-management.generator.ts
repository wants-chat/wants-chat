import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRoleManagement = (
  resolved: ResolvedComponent,
  variant: 'table' | 'cards' | 'hierarchy' = 'table'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();
  const entity = dataSource?.split('.').pop() || 'roles';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'roles'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Users, Shield, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    table: `
${commonImports}

interface Permission {
  id: string;
  label: string;
  granted: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isDefault: boolean;
  color: string;
  permissions: Permission[];
  createdAt: string;
}

interface RoleManagementProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const sectionTitle = ${getField('sectionTitle')};
  const rolesList: Role[] = ${getField('roles')};
  const createRoleLabel = ${getField('createRoleLabel')};
  const editLabel = ${getField('editLabel')};
  const deleteLabel = ${getField('deleteLabel')};
  const usersLabel = ${getField('usersLabel')};
  const defaultRoleLabel = ${getField('defaultRoleLabel')};
  const permissionsLabel = ${getField('permissionsLabel')};

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{sectionTitle}</CardTitle>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            {createRoleLabel}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Role Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Users
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {permissionsLabel}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rolesList.map((role) => {
                const grantedPermissions = role.permissions.filter((p: any) => p.granted).length;
                const totalPermissions = role.permissions.length;

                return (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: role.color }}
                        >
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {role.name}
                            </span>
                            {role.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                {defaultRoleLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                      {role.description}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {role.userCount}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {usersLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {grantedPermissions}/{totalPermissions}
                        </span>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: \`\${(grantedPermissions / totalPermissions) * 100}%\`,
                              backgroundColor: role.color
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRole(role)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title={editLabel}
                        >
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          title={deleteLabel}
                          disabled={role.isDefault}
                        >
                          <Trash2 className={\`h-4 w-4 \${role.isDefault ? 'text-gray-300 dark:text-gray-600' : 'text-red-600 dark:text-red-400'}\`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Permission Details Modal/Panel */}
        {selectedRole && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Role: {selectedRole.name}
                </h3>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedRole.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {permission.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {permission.granted ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                      <input
                        type="checkbox"
                        checked={permission.granted}
                        onChange={() => {}}
                        className="rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleManagement;
    `,

    cards: `
${commonImports}

interface Permission {
  id: string;
  label: string;
  granted: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isDefault: boolean;
  color: string;
  permissions: Permission[];
  createdAt: string;
}

interface RoleManagementProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const sectionTitle = ${getField('sectionTitle')};
  const sectionSubtitle = ${getField('sectionSubtitle')};
  const rolesList: Role[] = ${getField('roles')};
  const createRoleLabel = ${getField('createRoleLabel')};
  const editLabel = ${getField('editLabel')};
  const deleteLabel = ${getField('deleteLabel')};
  const usersLabel = ${getField('usersLabel')};
  const defaultRoleLabel = ${getField('defaultRoleLabel')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{sectionTitle}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{sectionSubtitle}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          {createRoleLabel}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rolesList.map((role) => {
          const grantedPermissions = role.permissions.filter((p: any) => p.granted).length;
          const totalPermissions = role.permissions.length;

          return (
            <Card key={role.id} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  {role.isDefault && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                      {defaultRoleLabel}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {role.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {role.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {role.userCount}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {usersLabel}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Permissions</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {grantedPermissions}/{totalPermissions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: \`\${(grantedPermissions / totalPermissions) * 100}%\`,
                          backgroundColor: role.color
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Edit className="h-4 w-4" />
                      {editLabel}
                    </button>
                    <button
                      disabled={role.isDefault}
                      className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoleManagement;
    `,

    hierarchy: `
${commonImports}

interface Permission {
  id: string;
  label: string;
  granted: boolean;
}

interface PermissionCategory {
  name: string;
  permissions: { id: string; label: string }[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isDefault: boolean;
  color: string;
  permissions: Permission[];
  createdAt: string;
}

interface RoleManagementProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  ${dataName}: propData,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const sectionTitle = ${getField('sectionTitle')};
  const rolesList: Role[] = ${getField('roles')};
  const permissionCategories: PermissionCategory[] = ${getField('permissionCategories')};
  const createRoleLabel = ${getField('createRoleLabel')};
  const usersLabel = ${getField('usersLabel')};

  const [selectedRole, setSelectedRole] = useState<string>(roles[0]?.id || '');

  const currentRole = roles.find(r => r.id === selectedRole);

  const hasPermission = (permissionId: string) => {
    return currentRole?.permissions.find(p => p.id === permissionId)?.granted || false;
  };

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{sectionTitle}</CardTitle>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            {createRoleLabel}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Roles
            </h3>
            {rolesList.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  selectedRole === role.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {role.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {role.userCount} {usersLabel}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Permission Matrix */}
          <div className="lg:col-span-8">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {currentRole?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentRole?.description}
              </p>
            </div>

            <div className="space-y-6">
              {permissionCategories.map((category) => (
                <div key={category.name}>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {category.name}
                  </h4>
                  <div className="space-y-2">
                    {category.permissions.map((permission) => {
                      const isGranted = hasPermission(permission.id);

                      return (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {permission.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              isGranted
                                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            )}>
                              {isGranted ? 'Granted' : 'Denied'}
                            </div>
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => {}}
                              className="rounded"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
              <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleManagement;
    `
  };

  return variants[variant] || variants.table;
};
