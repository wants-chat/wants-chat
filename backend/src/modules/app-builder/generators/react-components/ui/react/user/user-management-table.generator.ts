import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateUserManagementTable = (
  resolved: ResolvedComponent,
  variant: 'table' | 'cards' | 'list' = 'table'
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

  const commonImports = `
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus, Download, Edit, Trash2, Eye, ChevronUp, ChevronDown, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    table: `
${commonImports}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  lastActive: string;
  department: string;
  joinDate: string;
}

interface Column {
  key: string;
  label: string;
  sortable: boolean;
}

interface UserManagementTableProps {
  className?: string;
  showFilters?: boolean;
  onRoleAssign?: (userId: string, role: string) => void;
  onRoleUpdate?: (userId: string, role: string) => void;
  onRoleDelete?: (userId: string, roleId: string) => void;
  [key: string]: any;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  className,
  showFilters = true,
  onRoleAssign,
  onRoleUpdate,
  onRoleDelete
}) => {
  // Fetch users from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'users'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'users'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const users: User[] = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.users || []);
  const sectionTitle = 'User Management';
  const columns: Column[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastActive', label: 'Last Active', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];
  const addUserLabel = 'Add User';
  const exportLabel = 'Export';
  const searchPlaceholder = 'Search users...';
  const editLabel = 'Edit';
  const deleteLabel = 'Delete';
  const viewLabel = 'View';

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn as keyof User];
        const bValue = b[sortColumn as keyof User];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, sortColumn, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg font-bold';
      case 'inactive':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg font-bold';
      case 'suspended':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg font-bold';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg font-bold';
    }
  };

  const handleRoleClick = (user: User) => {
    console.log('Role clicked for user:', user);
    if (onRoleUpdate) {
      onRoleUpdate(user.id, user.role);
    } else {
      alert(\`Update role for \${user.name}\\nCurrent role: \${user.role}\`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("w-full rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm", className)}>
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("w-full rounded-2xl shadow-xl border border-red-200/50 dark:border-red-700/50 backdrop-blur-sm", className)}>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
            <span className="text-red-600 dark:text-red-400 font-medium">Failed to load users</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm", className)}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">{sectionTitle}</CardTitle>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <UserPlus className="h-4 w-4" />
              {addUserLabel}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
              <Download className="h-4 w-4" />
              {exportLabel}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 shadow-md"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {column.label}
                        {sortColumn === column.key && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {user.avatar}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td
                    className="px-4 py-3 text-sm text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={() => handleRoleClick(user)}
                  >
                    {user.role}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.department}</td>
                  <td className="px-4 py-3">
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(user.status)}\`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title={viewLabel}>
                        <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title={editLabel}>
                        <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title={deleteLabel}>
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={\`px-3 py-1 rounded \${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-gray-600'}\`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementTable;
    `,

    cards: `
${commonImports}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  lastActive: string;
  department: string;
  joinDate: string;
}

interface UserManagementTableProps {
  className?: string;
  showFilters?: boolean;
  onRoleAssign?: (userId: string, role: string) => void;
  onRoleUpdate?: (userId: string, role: string) => void;
  onRoleDelete?: (userId: string, roleId: string) => void;
  [key: string]: any;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  className,
  showFilters = true,
  onRoleAssign,
  onRoleUpdate,
  onRoleDelete
}) => {
  // Fetch users from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'users'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'users'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const users: User[] = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.users || []);
  const sectionTitle = 'User Management';
  const sectionSubtitle = 'Manage your team members';
  const addUserLabel = 'Add User';
  const searchPlaceholder = 'Search users...';
  const editLabel = 'Edit';
  const deleteLabel = 'Delete';
  const viewLabel = 'View';

  const [searchTerm, setSearchTerm] = useState('');

  // Loading and error states
  if (isLoading) {
    return (
      <div className={cn("w-full p-12", className)}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("w-full p-12", className)}>
        <div className="flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg p-8">
          <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
          <span className="text-red-600 dark:text-red-400 font-medium">Failed to load users</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg font-bold';
      case 'inactive':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg font-bold';
      case 'suspended':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg font-bold';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg font-bold';
    }
  };

  const handleRoleClick = (user: User) => {
    console.log('Role clicked for user:', user);
    if (onRoleUpdate) {
      onRoleUpdate(user.id, user.role);
    } else {
      alert(\`Update role for \${user.name}\\nCurrent role: \${user.role}\`);
    }
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{sectionTitle}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{sectionSubtitle}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <UserPlus className="h-4 w-4" />
          {addUserLabel}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                    {user.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    <p
                      className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => handleRoleClick(user)}
                    >
                      {user.role}
                    </p>
                  </div>
                </div>
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(user.status)}\`}>
                  {user.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Email:</span>
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Department:</span>
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium mr-2">Last Active:</span>
                  <span>{user.lastActive}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50">
                  <Eye className="h-4 w-4" />
                  {viewLabel}
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Edit className="h-4 w-4" />
                  {editLabel}
                </button>
                <button className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManagementTable;
    `,

    list: `
${commonImports}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
  lastActive: string;
  department: string;
  joinDate: string;
}

interface UserManagementTableProps {
  className?: string;
  showFilters?: boolean;
  onRoleAssign?: (userId: string, role: string) => void;
  onRoleUpdate?: (userId: string, role: string) => void;
  onRoleDelete?: (userId: string, roleId: string) => void;
  [key: string]: any;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
  className,
  showFilters = true,
  onRoleAssign,
  onRoleUpdate,
  onRoleDelete
}) => {
  // Fetch users from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'users'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'users'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const users: User[] = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.users || []);
  const sectionTitle = 'User Management';
  const addUserLabel = 'Add User';
  const searchPlaceholder = 'Search users...';
  const editLabel = 'Edit';
  const deleteLabel = 'Delete';

  const [searchTerm, setSearchTerm] = useState('');

  // Loading and error states
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
            <span className="text-red-600 dark:text-red-400 font-medium">Failed to load users</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg font-bold';
      case 'inactive':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg font-bold';
      case 'suspended':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg font-bold';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg font-bold';
    }
  };

  const handleRoleClick = (user: User) => {
    console.log('Role clicked for user:', user);
    if (onRoleUpdate) {
      onRoleUpdate(user.id, user.role);
    } else {
      alert(\`Update role for \${user.name}\\nCurrent role: \${user.role}\`);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{sectionTitle}</CardTitle>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="h-4 w-4" />
            {addUserLabel}
          </button>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                    <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${getStatusColor(user.status)}\`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>{user.email}</span>
                    <span>•</span>
                    <span
                      className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => handleRoleClick(user)}
                    >
                      {user.role}
                    </span>
                    <span>•</span>
                    <span>{user.department}</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.lastActive}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title={editLabel}>
                  <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title={deleteLabel}>
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagementTable;
    `
  };

  return variants[variant] || variants.table;
};
