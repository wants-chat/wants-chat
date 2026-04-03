/**
 * Entity Table Generator
 *
 * Generates a fully functional data table with:
 * - API data fetching with TanStack Query
 * - Pagination
 * - CRUD operations
 * - Delete confirmation modal
 * - Actions dropdown
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface ColumnConfig {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'datetime' | 'currency' | 'status' | 'boolean' | 'image' | 'phone' | 'email';
  sortable?: boolean;
  width?: string;
}

export interface EntityTableOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  columns: ColumnConfig[];
  endpoint?: string;
  queryKey?: string;
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  itemsPerPage?: number;
  createRoute?: string;
  editRoute?: string;
  viewRoute?: string;
}

/**
 * Generate table cell based on column type
 */
function generateTableCell(column: ColumnConfig): string {
  const accessor = `item.${column.key}`;

  switch (column.type) {
    case 'image':
      return `<td className="py-4 px-6">
                {${accessor} ? (
                  <img src={${accessor}} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                )}
              </td>`;

    case 'status':
      return `<td className="py-4 px-6">
                <span className={\`inline-flex px-2.5 py-1 text-xs font-medium rounded-full \${getStatusColor(${accessor})}\`}>
                  {${accessor} ? ${accessor}.replace(/_/g, ' ').replace(/\\b\\w/g, (l: string) => l.toUpperCase()) : '-'}
                </span>
              </td>`;

    case 'date':
    case 'datetime':
      return `<td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                {${accessor} ? new Date(${accessor}).toLocaleDateString() : '-'}
              </td>`;

    case 'currency':
      return `<td className="py-4 px-6 text-gray-900 dark:text-gray-100 font-medium">
                {${accessor} != null ? '$' + Number(${accessor}).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
              </td>`;

    case 'boolean':
      return `<td className="py-4 px-6">
                <span className={\`inline-flex px-2 py-1 text-xs rounded-full \${${accessor} ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}\`}>
                  {${accessor} ? 'Yes' : 'No'}
                </span>
              </td>`;

    case 'phone':
      return `<td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                {${accessor} ? <a href={\`tel:\${${accessor}}\`} className="hover:text-blue-600">{${accessor}}</a> : '-'}
              </td>`;

    case 'email':
      return `<td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                {${accessor} ? <a href={\`mailto:\${${accessor}}\`} className="hover:text-blue-600">{${accessor}}</a> : '-'}
              </td>`;

    default:
      return `<td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                {${accessor} ?? '-'}
              </td>`;
  }
}

/**
 * Generate an entity table component
 */
export function generateEntityTable(options: EntityTableOptions): string {
  const {
    entity,
    columns,
    showCreate = true,
    showEdit = true,
    showDelete = true,
    showView = true,
    itemsPerPage = 10,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'Table';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const createRoute = options.createRoute || `/${tableName}/new`;
  const editRoute = options.editRoute || `/${tableName}/\${id}/edit`;
  const viewRoute = options.viewRoute || `/${tableName}/\${id}`;

  const headers = columns
    .map(col => `<th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">${col.label}</th>`)
    .join('\n                  ');

  const cells = columns.map(col => generateTableCell(col)).join('\n                    ');

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit, Trash2, Eye, X, Plus, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  className?: string;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
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
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
};

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  className,
  onView,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const itemsPerPage = ${itemsPerPage};

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });

  const sourceData = propData && propData.length > 0 ? propData : (fetchedData || []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sourceData;
    const query = searchQuery.toLowerCase();
    return sourceData.filter((item: any) =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(query)
      )
    );
  }, [sourceData, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleView = (item: any) => {
    if (onView) onView(item);
    else navigate(\`${viewRoute.replace('${id}', '${item.id || item._id}')}\`);
    setOpenDropdown(null);
  };

  const handleEdit = (item: any) => {
    if (onEdit) onEdit(item);
    else navigate(\`${editRoute.replace('${id}', '${item.id || item._id}')}\`);
    setOpenDropdown(null);
  };

  const handleDeleteClick = (item: any) => {
    setDeleteModal({ open: true, item });
    setOpenDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      await deleteMutation.mutateAsync(deleteModal.item.id || deleteModal.item._id);
      if (onDelete) onDelete(deleteModal.item);
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setDeleteModal({ open: false, item: null });
  };

  return (
    <>
      <div className={cn('w-full', className)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">${displayName}s</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              ${showCreate ? `<button
                onClick={() => navigate('${createRoute}')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add ${displayName}
              </button>` : ''}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  ${headers}
                  <th className="w-16 py-4 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={${columns.length + 1}} className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={${columns.length + 1}} className="py-12 text-center text-red-500">
                      Failed to load data
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={${columns.length + 1}} className="py-12 text-center text-gray-500">
                      No ${displayName.toLowerCase()}s found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item: any) => {
                    const itemId = item.id || item._id;
                    return (
                      <tr
                        key={itemId}
                        className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                    ${cells}
                        <td className="py-4 px-6 relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === itemId ? null : itemId)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                          {openDropdown === itemId && (
                            <div className="absolute right-4 top-12 z-20 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                              ${showView ? `<button
                                onClick={() => handleView(item)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" /> View
                              </button>` : ''}
                              ${showEdit ? `<button
                                onClick={() => handleEdit(item)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" /> Edit
                              </button>` : ''}
                              ${showDelete ? `<button
                                onClick={() => handleDeleteClick(item)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>` : ''}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteModal({ open: false, item: null })} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete ${displayName}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this ${displayName.toLowerCase()}? This action cannot be undone.
                </p>
              </div>
              <button onClick={() => setDeleteModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, item: null })}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
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
      )}
    </>
  );
};

export default ${componentName};
`;
}
