/**
 * Entity Detail Generator
 *
 * Generates detail view components for single entity display with:
 * - API data fetching
 * - Field display with proper formatting
 * - Edit/Delete actions
 * - Back navigation
 * - Related data sections
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel, getIconForField, getFieldDisplayValue } from '../utils/generator-helpers';
import { EnhancedFieldDefinition } from '../../dto/create-app.dto';

export interface DetailFieldConfig {
  key: string;
  label?: string;
  type?: 'text' | 'date' | 'datetime' | 'currency' | 'boolean' | 'email' | 'phone' | 'url' | 'image' | 'badge' | 'html';
  icon?: string;
  fullWidth?: boolean;
}

export interface RelatedSectionConfig {
  title: string;
  entity: string;
  endpoint: string;
  displayField: string;
  linkTo?: string;
}

export interface EntityDetailOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  fields: DetailFieldConfig[];
  endpoint?: string;
  queryKey?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  backRoute?: string;
  editRoute?: string;
  relatedSections?: RelatedSectionConfig[];
}

/**
 * Generate an entity detail component
 */
export function generateEntityDetail(options: EntityDetailOptions): string {
  const {
    entity,
    fields,
    showEdit = true,
    showDelete = true,
    relatedSections = [],
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'Detail';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const backRoute = options.backRoute || `/${tableName}`;
  const editRoute = options.editRoute || `/${tableName}/\${id}/edit`;

  // Collect unique icons
  const icons = new Set(['ArrowLeft', 'Loader2', 'Edit', 'Trash2', 'X']);
  fields.forEach(f => {
    if (f.icon) icons.add(f.icon);
    else icons.add(getIconForField(f.key));
  });

  const iconList = Array.from(icons).join(', ');

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ${iconList} } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  id?: string;
  data?: any;
  className?: string;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  id: propId,
  data: propData,
  className,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', id],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${id}\`);
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch:', err);
        return null;
      }
    },
    enabled: !propData && !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(\`${endpoint}/\${itemId}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
      handleBack();
    },
  });

  const [deleteModal, setDeleteModal] = useState(false);

  const item = propData || fetchedData;

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('${backRoute}');
  };

  const handleEdit = () => {
    if (onEdit && item) onEdit(item);
    else navigate(\`${editRoute.replace('${id}', '${item?.id || item?._id}')}\`);
  };

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!item) return;
    try {
      await deleteMutation.mutateAsync(item.id || item._id);
      if (onDelete) onDelete(item);
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setDeleteModal(false);
  };

  const formatValue = (value: any, type?: string) => {
    if (value === undefined || value === null) return '-';

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'currency':
        return '$' + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 });
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'email':
        return <a href={\`mailto:\${value}\`} className="text-blue-600 hover:underline">{value}</a>;
      case 'phone':
        return <a href={\`tel:\${value}\`} className="text-blue-600 hover:underline">{value}</a>;
      case 'url':
        return <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{value}</a>;
      case 'image':
        return value ? <img src={value} alt="" className="w-32 h-32 object-cover rounded-lg" /> : '-';
      case 'badge':
        return (
          <span className={cn(
            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
            getStatusColor(value)
          )}>
            {value}
          </span>
        );
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: value }} />;
      default:
        return String(value);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
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

  if (!item) {
    return (
      <div className={cn('', className)}>
        <div className="text-center py-12">
          <p className="text-gray-500">${displayName} not found</p>
          <button
            onClick={handleBack}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ${displayName} Details
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {item.id || item._id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            ${showEdit ? `<button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>` : ''}
            ${showDelete ? `<button
              onClick={handleDeleteClick}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>` : ''}
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${fields.map(field => {
                const label = field.label || formatFieldLabel(field.key);
                const fullWidthClass = field.fullWidth ? 'md:col-span-2' : '';
                return `<div className="${fullWidthClass}">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">${label}</dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {formatValue(item.${field.key}, '${field.type || 'text'}')}
                </dd>
              </div>`;
              }).join('\n              ')}
            </div>
          </div>

          {/* Timestamps */}
          {(item.created_at || item.createdAt || item.updated_at || item.updatedAt) && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
                {(item.created_at || item.createdAt) && (
                  <span>Created: {new Date(item.created_at || item.createdAt).toLocaleString()}</span>
                )}
                {(item.updated_at || item.updatedAt) && (
                  <span>Updated: {new Date(item.updated_at || item.updatedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          )}
        </div>

        ${relatedSections.length > 0 ? relatedSections.map(section => `
        {/* ${section.title} */}
        <RelatedSection
          title="${section.title}"
          endpoint={\`${section.endpoint.replace('{id}', '${item.id || item._id}')}\`}
          displayField="${section.displayField}"
          ${section.linkTo ? `linkTo="${section.linkTo}"` : ''}
        />`).join('\n') : ''}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete ${displayName}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this ${displayName.toLowerCase()}? This action cannot be undone.
                </p>
              </div>
              <button onClick={() => setDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
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

${relatedSections.length > 0 ? `
// Related Section Component
interface RelatedSectionProps {
  title: string;
  endpoint: string;
  displayField: string;
  linkTo?: string;
}

const RelatedSection: React.FC<RelatedSectionProps> = ({ title, endpoint, displayField, linkTo }) => {
  const navigate = useNavigate();

  const { data: items = [], isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      try {
        const response = await api.get<any>(endpoint);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No items found</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item: any) => (
            <li
              key={item.id || item._id}
              className={cn(
                'py-3',
                linkTo && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 rounded'
              )}
              onClick={() => linkTo && navigate(linkTo.replace('{id}', item.id || item._id))}
            >
              {item[displayField] || 'Untitled'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};` : ''}

export default ${componentName};
`;
}
