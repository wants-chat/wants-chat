/**
 * Entity Grid Generator
 *
 * Generates a card-based grid view with:
 * - API data fetching
 * - Pagination or infinite scroll
 * - Card actions (view, edit, delete)
 * - Responsive layout
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface GridDisplayConfig {
  title: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  meta?: string[];
}

export interface EntityGridOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  displayConfig: GridDisplayConfig;
  endpoint?: string;
  queryKey?: string;
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  columns?: 2 | 3 | 4;
  createRoute?: string;
  viewRoute?: string;
}

/**
 * Generate an entity grid component
 */
export function generateEntityGrid(options: EntityGridOptions): string {
  const {
    entity,
    displayConfig,
    showCreate = true,
    showEdit = true,
    showDelete = true,
    columns = 3,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'Grid';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const createRoute = options.createRoute || `/${tableName}/new`;
  const viewRoute = options.viewRoute || `/${tableName}/\${id}`;

  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  className?: string;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  className,
  onView,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
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

  const handleView = (item: any) => {
    if (onView) onView(item);
    else navigate(\`${viewRoute.replace('${id}', '${item.id || item._id}')}\`);
    setOpenMenu(null);
  };

  const handleEdit = (item: any) => {
    if (onEdit) onEdit(item);
    else navigate(\`/${tableName}/\${item.id || item._id}/edit\`);
    setOpenMenu(null);
  };

  const handleDeleteClick = (item: any) => {
    setDeleteModal({ open: true, item });
    setOpenMenu(null);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      published: 'bg-green-100 text-green-700',
      available: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      draft: 'bg-yellow-100 text-yellow-700',
      inactive: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className={cn('', className)}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">${displayName}s</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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

        {/* Grid */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No ${displayName.toLowerCase()}s found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 ${gridColsClass} gap-6">
            {filteredData.map((item: any) => {
              const itemId = item.id || item._id;
              return (
                <div
                  key={itemId}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Image */}
                  ${displayConfig.image ? `<div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                    {item.${displayConfig.image} ? (
                      <img
                        src={item.${displayConfig.image}}
                        alt={item.${displayConfig.title}}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {/* Menu Button */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === itemId ? null : itemId); }}
                        className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      {openMenu === itemId && (
                        <div className="absolute right-0 top-10 z-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                          ${showEdit ? '<button onClick={() => handleView(item)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"><Eye className="w-4 h-4" /> View</button>' : ''}
                          ${showEdit ? '<button onClick={() => handleEdit(item)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"><Edit className="w-4 h-4" /> Edit</button>' : ''}
                          ${showDelete ? '<button onClick={() => handleDeleteClick(item)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>' : ''}
                        </div>
                      )}
                    </div>
                  </div>` : ''}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600"
                          onClick={() => handleView(item)}
                        >
                          {item.${displayConfig.title} || 'Untitled'}
                        </h3>
                        ${displayConfig.subtitle ? `<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {item.${displayConfig.subtitle} || ''}
                        </p>` : ''}
                      </div>
                      ${displayConfig.badge ? `{item.${displayConfig.badge} && (
                        <span className={\`inline-flex px-2 py-1 text-xs font-medium rounded-full \${getStatusColor(item.${displayConfig.badge})}\`}>
                          {item.${displayConfig.badge}}
                        </span>
                      )}` : ''}
                    </div>
                    ${displayConfig.meta ? `<div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      ${displayConfig.meta.map(m => `{item.${m} && <span>{item.${m}}</span>}`).join('\n                      ')}
                    </div>` : ''}
                    ${!displayConfig.image ? `<div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => handleView(item)} className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">View</button>
                      ${showEdit ? '<button onClick={() => handleEdit(item)} className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Edit</button>' : ''}
                    </div>` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              <button onClick={handleDeleteConfirm} disabled={deleteMutation.isPending} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
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
