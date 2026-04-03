/**
 * Detail Generator
 *
 * Generates specialized detail view components:
 * - AppointmentDetail: Appointment/booking details with calendar integration
 * - TaskDetail: Task/todo item details with status management
 *
 * Features:
 * - Comprehensive data display
 * - Status management
 * - Related information sections
 * - Action buttons
 * - Dark mode support
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface DetailFieldConfig {
  key: string;
  label?: string;
  type?: 'text' | 'date' | 'datetime' | 'time' | 'currency' | 'boolean' | 'email' | 'phone' | 'url' | 'badge' | 'html' | 'user' | 'duration';
  icon?: string;
  fullWidth?: boolean;
}

export interface DetailSectionConfig {
  title: string;
  fields: DetailFieldConfig[];
}

export interface SpecializedDetailOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  endpoint?: string;
  queryKey?: string;
  titleField: string;
  subtitleField?: string;
  statusField?: string;
  sections: DetailSectionConfig[];
  showEdit?: boolean;
  showDelete?: boolean;
  showStatusActions?: boolean;
  statusOptions?: string[];
  backRoute?: string;
  editRoute?: string;
  variant?: 'appointment' | 'task' | 'default';
}

/**
 * Generate a specialized detail component
 */
export function generateSpecializedDetail(options: SpecializedDetailOptions): string {
  const {
    entity,
    titleField,
    subtitleField,
    statusField = 'status',
    sections,
    showEdit = true,
    showDelete = true,
    showStatusActions = true,
    statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'],
    variant = 'default',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'Detail';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const backRoute = options.backRoute || `/${tableName}`;
  const editRoute = options.editRoute || `/${tableName}/\${id}/edit`;

  // Collect unique icons based on variant
  const variantIcons: Record<string, string[]> = {
    appointment: ['Calendar', 'Clock', 'MapPin', 'User', 'Phone', 'Mail', 'FileText', 'Bell'],
    task: ['CheckSquare', 'Clock', 'Flag', 'Tag', 'User', 'Paperclip', 'MessageSquare', 'AlertCircle'],
    default: ['FileText', 'Clock', 'User', 'Tag'],
  };

  const baseIcons = ['ArrowLeft', 'Loader2', 'Edit', 'Trash2', 'X', 'Check', 'MoreVertical'];
  const icons = [...new Set([...baseIcons, ...variantIcons[variant]])];

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ${icons.join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  id?: string;
  data?: any;
  className?: string;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onStatusChange?: (item: any, status: string) => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  id: propId,
  data: propData,
  className,
  onEdit,
  onDelete,
  onStatusChange,
  onBack,
}) => {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deleteModal, setDeleteModal] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);

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

  const statusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: string }) => {
      await api.patch(\`${endpoint}/\${itemId}\`, { ${statusField}: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}', id] });
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

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

  const handleStatusChange = async (newStatus: string) => {
    if (!item) return;
    try {
      await statusMutation.mutateAsync({ itemId: item.id || item._id, status: newStatus });
      if (onStatusChange) onStatusChange(item, newStatus);
    } catch (error) {
      console.error('Status update failed:', error);
    }
    setStatusMenu(false);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string }> = {
      pending: {
        color: 'text-yellow-700 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      },
      confirmed: {
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      },
      in_progress: {
        color: 'text-purple-700 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      },
      completed: {
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
      },
      cancelled: {
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
      },
      high: {
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
      },
      medium: {
        color: 'text-yellow-700 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      },
      low: {
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
      },
    };
    return configs[status?.toLowerCase()] || { color: 'text-gray-700', bgColor: 'bg-gray-100' };
  };

  const formatValue = (value: any, type?: string) => {
    if (value === undefined || value === null) return '-';

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'time':
        return new Date(value).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'currency':
        return '$' + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 });
      case 'boolean':
        return value ? (
          <span className="inline-flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" /> Yes
          </span>
        ) : (
          <span className="text-gray-500">No</span>
        );
      case 'email':
        return (
          <a href={\`mailto:\${value}\`} className="text-blue-600 hover:underline flex items-center gap-2">
            <Mail className="w-4 h-4" /> {value}
          </a>
        );
      case 'phone':
        return (
          <a href={\`tel:\${value}\`} className="text-blue-600 hover:underline flex items-center gap-2">
            <Phone className="w-4 h-4" /> {value}
          </a>
        );
      case 'url':
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
            {value}
          </a>
        );
      case 'badge':
        const statusConfig = getStatusConfig(value);
        return (
          <span className={cn('inline-flex px-3 py-1 text-sm font-medium rounded-full', statusConfig.bgColor, statusConfig.color)}>
            {value}
          </span>
        );
      case 'user':
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <span>{value}</span>
          </div>
        );
      case 'duration':
        return value;
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: value }} />;
      default:
        return String(value);
    }
  };

  ${variant === 'appointment' ? `const getAppointmentIcon = () => <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />;` : ''}
  ${variant === 'task' ? `const getTaskIcon = () => <CheckSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />;` : ''}

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
          <button onClick={handleBack} className="mt-4 text-blue-600 hover:underline">
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
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                ${variant === 'appointment' ? '{getAppointmentIcon()}' : variant === 'task' ? '{getTaskIcon()}' : '<FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.${titleField} || '${displayName}'}
                </h1>
                ${subtitleField ? `{item.${subtitleField} && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {item.${subtitleField}}
                  </p>
                )}` : ''}
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  ID: {item.id || item._id}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-14 lg:ml-0">
            ${showStatusActions ? `{/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusMenu(!statusMenu)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium',
                  getStatusConfig(item.${statusField}).bgColor,
                  getStatusConfig(item.${statusField}).color
                )}
              >
                {item.${statusField} || 'Unknown'}
                <MoreVertical className="w-4 h-4" />
              </button>
              {statusMenu && (
                <div className="absolute right-0 top-12 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                    Change Status
                  </div>
                  ${statusOptions.map(status => `<button
                    onClick={() => handleStatusChange('${status}')}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between',
                      item.${statusField} === '${status}' && 'bg-gray-50 dark:bg-gray-700'
                    )}
                  >
                    ${formatFieldLabel(status)}
                    {item.${statusField} === '${status}' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>`).join('\n                  ')}
                </div>
              )}
            </div>` : ''}

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

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            ${sections.map(section => `{/* ${section.title} */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ${section.title}
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${section.fields.map(field => {
                  const label = field.label || formatFieldLabel(field.key);
                  const colSpan = field.fullWidth ? 'sm:col-span-2' : '';
                  return `<div className="${colSpan}">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">${label}</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {formatValue(item.${field.key}, '${field.type || 'text'}')}
                  </dd>
                </div>`;
                }).join('\n                ')}
              </dl>
            </div>`).join('\n            ')}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-900 dark:text-white">
                      {item.created_at || item.createdAt
                        ? new Date(item.created_at || item.createdAt).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                </div>
                {(item.updated_at || item.updatedAt) && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(item.updated_at || item.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            ${variant === 'appointment' ? `{/* Appointment Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Check className="w-4 h-4" /> Confirm
                </button>
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Bell className="w-4 h-4" /> Send Reminder
                </button>
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Calendar className="w-4 h-4" /> Reschedule
                </button>
              </div>
            </div>` : ''}

            ${variant === 'task' ? `{/* Task Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
              <div className="space-y-3">
                {item.${statusField} !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" /> Mark Complete
                  </button>
                )}
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Paperclip className="w-4 h-4" /> Add Attachment
                </button>
                <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <MessageSquare className="w-4 h-4" /> Add Comment
                </button>
              </div>
            </div>` : ''}
          </div>
        </div>
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

export default ${componentName};
`;
}

/**
 * Generate AppointmentDetail component
 */
export function generateAppointmentDetail(options?: Partial<SpecializedDetailOptions>): string {
  return generateSpecializedDetail({
    entity: 'appointment',
    displayName: 'Appointment',
    componentName: 'AppointmentDetail',
    variant: 'appointment',
    titleField: 'title',
    subtitleField: 'client_name',
    statusField: 'status',
    statusOptions: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    sections: [
      {
        title: 'Appointment Details',
        fields: [
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'time', label: 'Time', type: 'time' },
          { key: 'duration', label: 'Duration', type: 'duration' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'service', label: 'Service', type: 'text' },
          { key: 'price', label: 'Price', type: 'currency' },
          { key: 'notes', label: 'Notes', type: 'text', fullWidth: true },
        ],
      },
      {
        title: 'Client Information',
        fields: [
          { key: 'client_name', label: 'Name', type: 'user' },
          { key: 'client_email', label: 'Email', type: 'email' },
          { key: 'client_phone', label: 'Phone', type: 'phone' },
        ],
      },
    ],
    ...options,
  });
}

/**
 * Generate TaskDetail component
 */
export function generateTaskDetail(options?: Partial<SpecializedDetailOptions>): string {
  return generateSpecializedDetail({
    entity: 'task',
    displayName: 'Task',
    componentName: 'TaskDetail',
    variant: 'task',
    titleField: 'title',
    subtitleField: 'project_name',
    statusField: 'status',
    statusOptions: ['pending', 'in_progress', 'completed', 'cancelled'],
    sections: [
      {
        title: 'Task Details',
        fields: [
          { key: 'description', label: 'Description', type: 'text', fullWidth: true },
          { key: 'priority', label: 'Priority', type: 'badge' },
          { key: 'due_date', label: 'Due Date', type: 'date' },
          { key: 'estimated_hours', label: 'Estimated Hours', type: 'text' },
          { key: 'tags', label: 'Tags', type: 'text' },
        ],
      },
      {
        title: 'Assignment',
        fields: [
          { key: 'assigned_to', label: 'Assigned To', type: 'user' },
          { key: 'assigned_by', label: 'Assigned By', type: 'user' },
          { key: 'project_name', label: 'Project', type: 'text' },
        ],
      },
    ],
    ...options,
  });
}
