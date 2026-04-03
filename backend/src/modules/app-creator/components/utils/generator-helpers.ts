/**
 * Generator Helpers - Shared utilities for all component generators
 */

import { snakeCase, pascalCase, camelCase, kebabCase } from 'change-case';
import pluralize from 'pluralize';
import { EnhancedEntityDefinition, EnhancedFieldDefinition } from '../../dto/create-app.dto';

// Re-export case utilities for convenience
export { snakeCase, pascalCase, camelCase, kebabCase };
export { pluralize };

/**
 * Format field name to human-readable label
 */
export function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Get table name from entity name
 */
export function getTableName(entityName: string): string {
  return snakeCase(pluralize.plural(entityName));
}

/**
 * Get API endpoint from entity name
 */
export function getEndpoint(entityName: string): string {
  return '/' + getTableName(entityName);
}

/**
 * Get component name from entity name and type
 */
export function getComponentName(entityName: string, componentType: string): string {
  return pascalCase(entityName) + pascalCase(componentType);
}

/**
 * Common React imports as a string
 */
export const REACT_IMPORTS = `import React, { useState, useMemo } from 'react';`;

/**
 * React Router imports
 */
export const ROUTER_IMPORTS = `import { useNavigate, useParams, Link } from 'react-router-dom';`;

/**
 * TanStack Query imports
 */
export const QUERY_IMPORTS = `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';`;

/**
 * Common Lucide icons import
 */
export function getLucideImports(icons: string[]): string {
  if (icons.length === 0) return '';
  return `import { ${icons.join(', ')} } from 'lucide-react';`;
}

/**
 * Common utility imports
 */
export const UTIL_IMPORTS = `import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

/**
 * Generate standard component interface
 */
export function generateComponentInterface(
  componentName: string,
  extraProps: Array<{ name: string; type: string; optional?: boolean }> = []
): string {
  const props = [
    { name: 'className', type: 'string', optional: true },
    ...extraProps,
  ];

  const propLines = props.map(p =>
    `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`
  ).join('\n');

  return `interface ${componentName}Props {\n${propLines}\n}`;
}

/**
 * Map field type to display format
 */
export function getFieldDisplayValue(field: EnhancedFieldDefinition, accessor: string): string {
  const { type, name } = field;

  if (type === 'date' || type === 'datetime' || name.endsWith('_at')) {
    return `${accessor} ? new Date(${accessor}).toLocaleDateString() : '-'`;
  }

  if (type === 'decimal' || name.match(/price|amount|total|cost|fee/i)) {
    return `${accessor} ? '$' + Number(${accessor}).toFixed(2) : '-'`;
  }

  if (type === 'boolean') {
    return `${accessor} ? 'Yes' : 'No'`;
  }

  if (type === 'phone') {
    return `${accessor} || '-'`;
  }

  return `${accessor} ?? '-'`;
}

/**
 * Get status badge color classes
 */
export function getStatusBadgeClasses(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
}

/**
 * Generate API fetch hook
 */
export function generateFetchHook(
  queryKey: string,
  endpoint: string,
  options: { enabled?: string; single?: boolean } = {}
): string {
  const { enabled, single } = options;

  return `const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['${queryKey}'${single ? ', id' : ''}],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}'${single ? ' + id' : ''});
        return ${single ? 'response?.data || response' : 'Array.isArray(response) ? response : (response?.data || [])'};
      } catch (err) {
        console.error('Failed to fetch:', err);
        return ${single ? 'null' : '[]'};
      }
    },${enabled ? `\n    enabled: ${enabled},` : ''}
    retry: 1,
  });`;
}

/**
 * Generate delete mutation
 */
export function generateDeleteMutation(endpoint: string, queryKey: string): string {
  return `const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });`;
}

/**
 * Common icon mapping for different field types/categories
 */
export const ICON_MAP: Record<string, string> = {
  // Status/State
  status: 'CheckCircle',
  state: 'Circle',
  active: 'CheckCircle',

  // User/Person
  user: 'User',
  customer: 'User',
  client: 'User',
  member: 'Users',
  owner: 'User',
  author: 'User',

  // Contact
  email: 'Mail',
  phone: 'Phone',
  address: 'MapPin',
  location: 'MapPin',

  // Time/Date
  date: 'Calendar',
  time: 'Clock',
  created_at: 'Calendar',
  updated_at: 'RefreshCw',
  due_date: 'CalendarCheck',
  start_date: 'Calendar',
  end_date: 'CalendarX',

  // Money
  price: 'DollarSign',
  amount: 'DollarSign',
  total: 'Receipt',
  cost: 'DollarSign',
  payment: 'CreditCard',

  // Content
  title: 'Type',
  name: 'Tag',
  description: 'FileText',
  notes: 'StickyNote',
  content: 'FileText',

  // Media
  image: 'Image',
  photo: 'Image',
  video: 'Video',
  file: 'File',
  document: 'FileText',

  // Categories
  category: 'Folder',
  type: 'Tag',
  tags: 'Tags',

  // Metrics
  count: 'Hash',
  quantity: 'Package',
  number: 'Hash',
};

/**
 * Get icon for a field name
 */
export function getIconForField(fieldName: string): string {
  const lowerName = fieldName.toLowerCase();

  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }

  return 'Info';
}

/**
 * Generate loading state JSX
 */
export function generateLoadingState(colSpan?: number): string {
  if (colSpan) {
    return `<tr>
      <td colSpan={${colSpan}} className="py-12 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </td>
    </tr>`;
  }

  return `<div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
  </div>`;
}

/**
 * Generate empty state JSX
 */
export function generateEmptyState(message: string, colSpan?: number): string {
  if (colSpan) {
    return `<tr>
      <td colSpan={${colSpan}} className="py-12 text-center text-gray-500">
        ${message}
      </td>
    </tr>`;
  }

  return `<div className="text-center py-12">
    <p className="text-gray-500">${message}</p>
  </div>`;
}

/**
 * Generate error state JSX
 */
export function generateErrorState(colSpan?: number): string {
  if (colSpan) {
    return `<tr>
      <td colSpan={${colSpan}} className="py-12 text-center text-red-500">
        Failed to load data. Please try again.
      </td>
    </tr>`;
  }

  return `<div className="text-center py-12">
    <p className="text-red-500">Failed to load data. Please try again.</p>
  </div>`;
}

/**
 * Generate pagination component
 */
export function generatePagination(): string {
  return `{totalPages > 1 && (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )}`;
}

/**
 * Generate delete confirmation modal
 */
export function generateDeleteModal(entityDisplayName: string): string {
  return `{deleteModal.open && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteModal({ open: false, item: null })} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm Delete</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this ${entityDisplayName.toLowerCase()}? This action cannot be undone.
            </p>
          </div>
          <button onClick={() => setDeleteModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteModal({ open: false, item: null })}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )}`;
}
