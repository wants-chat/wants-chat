/**
 * Data Table Generator for App Creator
 *
 * Generates a fully functional data table component with:
 * - API data fetching
 * - Pagination
 * - Sorting
 * - CRUD operations
 * - Delete confirmation modal
 */

import { snakeCase, pascalCase, camelCase } from 'change-case';
import pluralize from 'pluralize';
import { EnhancedEntityDefinition, EnhancedFieldDefinition } from '../../dto/create-app.dto';

interface DataTableOptions {
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  itemsPerPage?: number;
  createRoute?: string;
  editRoute?: string;
  detailRoute?: string;
}

/**
 * Generate a data table component for an entity
 */
export function generateDataTable(
  entity: EnhancedEntityDefinition,
  options: DataTableOptions = {}
): string {
  const {
    showCreate = true,
    showEdit = true,
    showDelete = true,
    showView = true,
    itemsPerPage = 10,
  } = options;

  const entityName = entity.name;
  const tableName = snakeCase(pluralize.plural(entityName));
  const componentName = `${pascalCase(entityName)}Table`;
  const displayName = entity.displayName || pascalCase(entityName);

  // Filter fields for table display (skip large text fields, limit to 5)
  const displayFields = entity.fields
    .filter(f => f.type !== 'text' && f.type !== 'json' && !f.name.endsWith('_id'))
    .slice(0, 5);

  // Generate table headers
  const headers = displayFields
    .map(f => formatFieldLabel(f.name))
    .map(label => `<th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">${label}</th>`)
    .join('\n                  ');

  // Generate table cells
  const cells = displayFields
    .map(f => generateTableCell(f))
    .join('\n                      ');

  // Routes with defaults
  const createRoute = options.createRoute || `/${tableName}/new`;
  const editRoute = options.editRoute || `/${tableName}/:id/edit`;
  const detailRoute = options.detailRoute || `/${tableName}/:id`;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit, Trash2, Eye, X, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  className?: string;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  itemsPerPage?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  className,
  onView,
  onEdit,
  onDelete,
  itemsPerPage = ${itemsPerPage},
}) => {
  const navigate = useNavigate();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${tableName}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/${tableName}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch ${tableName}:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });

  // Use prop data if available, otherwise use fetched data
  const sourceData = propData && propData.length > 0 ? propData : (fetchedData || []);

  // Filter out deleted items
  const data = useMemo(() => {
    return sourceData.filter((item: any) => {
      const itemId = String(item.id || item._id);
      return !deletedIds.has(itemId);
    });
  }, [sourceData, deletedIds]);

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const handleView = (item: any) => {
    if (onView) {
      onView(item);
    } else {
      navigate(\`${detailRoute.replace(':id', '${item.id || item._id}')}\`);
    }
    setOpenDropdown(null);
  };

  const handleEdit = (item: any) => {
    if (onEdit) {
      onEdit(item);
    } else {
      navigate(\`${editRoute.replace(':id', '${item.id || item._id}')}\`);
    }
    setOpenDropdown(null);
  };

  const handleDeleteClick = (item: any) => {
    setDeleteModal({ open: true, item });
    setOpenDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    const itemId = deleteModal.item.id || deleteModal.item._id;

    try {
      await api.delete<any>(\`/${tableName}/\${itemId}\`);
      setDeletedIds(prev => new Set(prev).add(String(itemId)));
      if (onDelete) onDelete({ id: itemId });
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete. Please try again.');
    }
    setDeleteModal({ open: false, item: null });
  };

  return (
    <>
      <div className={cn('w-full max-w-6xl mx-auto p-4', className)}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">${displayName}s</h2>
            ${showCreate ? `<button
              onClick={() => navigate('${createRoute}')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create ${displayName}
            </button>` : ''}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  ${headers}
                  <th className="w-12 py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={${displayFields.length + 1}} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={${displayFields.length + 1}} className="py-12 text-center text-red-500">
                      Failed to load data.
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={${displayFields.length + 1}} className="py-12 text-center text-gray-500">
                      No ${displayName.toLowerCase()}s found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item: any) => {
                    const itemId = item.id || item._id;
                    return (
                      <tr key={itemId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        ${cells}
                        <td className="py-4 px-6 relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === itemId ? null : itemId)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                          {openDropdown === itemId && (
                            <div className="absolute right-0 top-12 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                              ${showView ? `<button onClick={() => handleView(item)} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> View
                              </button>` : ''}
                              ${showEdit ? `<button onClick={() => handleEdit(item)} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                                <Edit className="w-4 h-4" /> Edit
                              </button>` : ''}
                              ${showDelete ? `<button onClick={() => handleDeleteClick(item)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg disabled:opacity-50"
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
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm Delete</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this ${displayName.toLowerCase()}?
                </p>
              </div>
              <button onClick={() => setDeleteModal({ open: false, item: null })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal({ open: false, item: null })} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete
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

/**
 * Format field name to human-readable label
 */
function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generate table cell JSX based on field type
 */
function generateTableCell(field: EnhancedFieldDefinition): string {
  const fieldName = field.name;
  const accessor = `item.${fieldName}`;

  // Image fields
  if (field.type === 'image' || fieldName.match(/image|photo|avatar|thumbnail/i)) {
    return `<td className="py-4 px-6">
                          {${accessor} ? (
                            <img src={${accessor}} alt="" className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700" />
                          )}
                        </td>`;
  }

  // Status fields
  if (fieldName === 'status') {
    return `<td className="py-4 px-6">
                          <span className={\`inline-flex px-2 py-1 text-xs font-medium rounded-full \${
                            ${accessor} === 'active' || ${accessor} === 'published'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : ${accessor} === 'pending' || ${accessor} === 'draft'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }\`}>
                            {${accessor}}
                          </span>
                        </td>`;
  }

  // Date fields
  if (field.type === 'date' || field.type === 'datetime' || fieldName.endsWith('_at')) {
    return `<td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                          {${accessor} ? new Date(${accessor}).toLocaleDateString() : '-'}
                        </td>`;
  }

  // Price/decimal fields
  if (field.type === 'decimal' || fieldName.match(/price|amount|total|cost/i)) {
    return `<td className="py-4 px-6 text-gray-900 dark:text-gray-100 font-medium">
                          {${accessor} ? \`$\${parseFloat(${accessor}).toFixed(2)}\` : '-'}
                        </td>`;
  }

  // Boolean fields
  if (field.type === 'boolean') {
    return `<td className="py-4 px-6">
                          <span className={\`inline-flex px-2 py-1 text-xs font-medium rounded-full \${
                            ${accessor} ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }\`}>
                            {${accessor} ? 'Yes' : 'No'}
                          </span>
                        </td>`;
  }

  // Default text field
  return `<td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                          {${accessor} ?? '-'}
                        </td>`;
}
