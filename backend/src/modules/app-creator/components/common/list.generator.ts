/**
 * List Generator
 *
 * Generates list view components with:
 * - Compact list layout
 * - Clickable items
 * - Avatar/icon support
 * - Status badges
 * - Actions dropdown
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface ListItemConfig {
  primary: string;
  secondary?: string;
  tertiary?: string;
  avatar?: string;
  icon?: string;
  badge?: string;
  timestamp?: string;
}

export interface ListOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  endpoint?: string;
  queryKey?: string;
  itemConfig: ListItemConfig;
  showSearch?: boolean;
  showCreate?: boolean;
  showActions?: boolean;
  grouped?: boolean;
  groupBy?: string;
  createRoute?: string;
  viewRoute?: string;
  editRoute?: string;
}

/**
 * Generate a list component
 */
export function generateList(options: ListOptions): string {
  const {
    entity,
    itemConfig,
    showSearch = true,
    showCreate = true,
    showActions = true,
    grouped = false,
    groupBy,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'List';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const createRoute = options.createRoute || `/${tableName}/new`;
  const viewRoute = options.viewRoute || `/${tableName}/\${id}`;
  const editRoute = options.editRoute || `/${tableName}/\${id}/edit`;

  // Collect icons
  const icons = ['Search', 'Plus', 'MoreVertical', 'Eye', 'Edit', 'Trash2', 'User', 'Loader2'];
  if (itemConfig.icon) icons.push(itemConfig.icon);

  return `import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ${icons.join(', ')}, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  className?: string;
  onItemClick?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  className,
  onItemClick,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });

  const { data: fetchedData, isLoading } = useQuery({
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

  ${grouped && groupBy ? `const groupedData = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredData.forEach((item: any) => {
      const key = item.${groupBy} || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filteredData]);` : ''}

  const handleItemClick = (item: any) => {
    if (onItemClick) onItemClick(item);
    else navigate(\`${viewRoute.replace('${id}', '${item.id || item._id}')}\`);
  };

  const handleEdit = (item: any) => {
    if (onEdit) onEdit(item);
    else navigate(\`${editRoute.replace('${id}', '${item.id || item._id}')}\`);
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
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return \`\${days} days ago\`;
    return date.toLocaleDateString();
  };

  const renderListItem = (item: any) => {
    const itemId = item.id || item._id;
    return (
      <li
        key={itemId}
        className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
        onClick={() => handleItemClick(item)}
      >
        {/* Avatar/Icon */}
        ${itemConfig.avatar ? `<div className="flex-shrink-0">
          {item.${itemConfig.avatar} ? (
            <img
              src={item.${itemConfig.avatar}}
              alt={item.${itemConfig.primary}}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
          )}
        </div>` : itemConfig.icon ? `<div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <${itemConfig.icon} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>` : ''}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {item.${itemConfig.primary} || 'Untitled'}
            </p>
            ${itemConfig.badge ? `{item.${itemConfig.badge} && (
              <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(item.${itemConfig.badge}))}>
                {item.${itemConfig.badge}}
              </span>
            )}` : ''}
          </div>
          ${itemConfig.secondary ? `{item.${itemConfig.secondary} && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {item.${itemConfig.secondary}}
            </p>
          )}` : ''}
          ${itemConfig.tertiary ? `{item.${itemConfig.tertiary} && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {item.${itemConfig.tertiary}}
            </p>
          )}` : ''}
        </div>

        {/* Timestamp */}
        ${itemConfig.timestamp ? `<div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
          {formatTimestamp(item.${itemConfig.timestamp})}
        </div>` : ''}

        {/* Actions */}
        ${showActions ? `<div className="flex-shrink-0 relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setOpenMenu(openMenu === itemId ? null : itemId)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {openMenu === itemId && (
            <div className="absolute right-0 top-10 z-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
              <button
                onClick={() => { handleItemClick(item); setOpenMenu(null); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> View
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDeleteClick(item)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>` : ''}
      </li>
    );
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">${displayName}s</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            ${showSearch ? `<div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>` : ''}
            ${showCreate ? `<button
              onClick={() => navigate('${createRoute}')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add ${displayName}
            </button>` : ''}
          </div>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No ${displayName.toLowerCase()}s found</p>
            </div>
          ) : (
            ${grouped && groupBy ? `<div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(groupedData).map(([group, items]) => (
                <div key={group}>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {group}
                  </div>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(items as any[]).map(item => renderListItem(item))}
                  </ul>
                </div>
              ))}
            </div>` : `<ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((item: any) => renderListItem(item))}
            </ul>`}
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

/**
 * Generate list for a specific domain
 */
export function generateDomainList(
  domain: string,
  itemConfig: ListItemConfig,
  options?: Partial<ListOptions>
): string {
  return generateList({
    entity: domain,
    itemConfig,
    ...options,
  });
}
