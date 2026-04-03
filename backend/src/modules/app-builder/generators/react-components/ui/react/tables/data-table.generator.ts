import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDataTable = (resolved: ResolvedComponent) => {
  const dataSource = resolved.dataSource || resolved.data?.entity;
  const isOrdersTable = dataSource === 'orders';
  const isPostsTable = dataSource === 'posts';

  // Get field mappings - these are the actual fields from the catalog
  const fields = resolved.fieldMappings || [];

  // Get route props from catalog - these define custom navigation paths
  const createRoute = resolved.props?.createRoute || resolved.props?.createButtonLink;
  const createLabel = resolved.props?.createLabel || resolved.props?.createButtonText || 'Create New';
  const editRoute = resolved.props?.editRoute; // e.g., '/admin/products/:id/edit'
  const detailRoute = resolved.props?.detailRoute; // e.g., '/admin/products/:id'

  // Control visibility of action buttons
  const showEditButton = resolved.props?.showEditButton !== false && !!editRoute;
  const showDeleteButton = resolved.props?.showDeleteButton !== false;

  // Helper to get field accessor
  const getField = (fieldName: string, itemVarName: string = 'item'): string => {
    const mapping = fields.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `${itemVarName}.${mapping.sourceField}`;
    }
    // Fallback for common patterns
    if (fieldName === 'id' || fieldName.endsWith('_id')) {
      return `${itemVarName}.id || ${itemVarName}._id`;
    }
    return `${itemVarName}.${fieldName} || ''`;
  };

  // Format field label for display
  const formatLabel = (fieldName: string): string => {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter fields for display (skip ID fields except main id, limit to first 5)
  const displayFields = fields
    .filter(f => !f.targetField.endsWith('_id') || f.targetField === 'id')
    .slice(0, 5);

  // Generate table headers dynamically
  const generateHeaders = () => {
    return displayFields
      .map(field => `<th className={\`text-left py-4 px-6 font-medium \${styles.title}\`}>${formatLabel(field.targetField)}</th>`)
      .join('\n                ');
  };

  // Generate field extractors
  const generateFieldExtractors = () => {
    return displayFields
      .map(field => `const ${field.targetField} = ${getField(field.targetField)};`)
      .join('\n                ');
  };

  // Check if this is an applications table
  const isApplicationsTable = dataSource === 'applications';

  // Generate table cells dynamically
  const generateCells = () => {
    return displayFields
      .map((field, idx) => {
        // Check if field is an image field
        const isImageField = field.targetField.match(/image|photo|picture|avatar|cover|thumbnail|poster/i);

        if (isImageField) {
          // Image thumbnail column
          return `<td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {${field.targetField} ? (
                          <img
                            src={${field.targetField}}
                            alt="Thumbnail"
                            className="w-12 h-12 rounded object-cover bg-gray-100 dark:bg-gray-700"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png';
                              e.currentTarget.onerror = null;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>`;
        }

        // Job title with link for applications table
        if (field.targetField === 'job_title' && isApplicationsTable) {
          return `<td className="py-4 px-6">
                      {item.job_id ? (
                        <Link
                          to={\`/jobs/\${item.job_id}\`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          {${field.targetField} || 'View Job'}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-300">{${field.targetField} || '-'}</span>
                      )}
                    </td>`;
        }

        // Resume/file URL field - show filename with icon
        if (field.targetField === 'resume_url' || field.targetField.includes('resume')) {
          return `<td className="py-4 px-6">
                      {${field.targetField} ? (
                        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-[120px]" title={getResumeFilename(${field.targetField})}>
                            {getResumeFilename(${field.targetField})}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>`;
        }

        if (idx === 0 && !isImageField) {
          // First column with icon (if not image) - handle objects safely
          return `<td className="py-4 px-6">
                      <div className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-xs">
                        {typeof ${field.targetField} === 'object' && ${field.targetField} !== null
                          ? JSON.stringify(${field.targetField})
                          : (${field.targetField} ?? '-')}
                      </div>
                    </td>`;
        }
        // Date formatting for date fields (includes _at suffix like created_at, applied_at, etc.)
        if (field.targetField.includes('date') || field.targetField.endsWith('_at')) {
          return `<td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {${field.targetField} ? new Date(${field.targetField}).toLocaleDateString() : '-'}
                    </td>`;
        }
        // Status badge for status fields - with dropdown for orders, simple badge for applications
        if (field.targetField === 'status') {
          if (isOrdersTable) {
            return `<td className="py-4 px-6 relative">
                      <button
                        onClick={() => toggleStatusDropdown(itemId)}
                        disabled={updatingStatus === itemId}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium capitalize cursor-pointer hover:opacity-80 transition-opacity",
                          getStatusColor(${field.targetField}),
                          updatingStatus === itemId && "opacity-50"
                        )}
                      >
                        {updatingStatus === itemId ? 'Updating...' : ${field.targetField}}
                      </button>
                      {statusDropdown === itemId && (
                        <div className={\`absolute left-0 top-12 z-20 w-44 rounded-lg shadow-lg py-1 \${styles.card} \${styles.border}\`}>
                          {ORDER_STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(item, s)}
                              className={cn(
                                "w-full px-4 py-2 text-left text-sm flex items-center justify-between capitalize",
                                styles.cardHover,
                                ${field.targetField} === s ? styles.background : ""
                              )}
                            >
                              {s}
                              {${field.targetField} === s && <Check className="w-4 h-4 text-green-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>`;
          }
          // Posts status dropdown
          if (isPostsTable) {
            return `<td className="py-4 px-6 relative">
                      <button
                        onClick={() => toggleStatusDropdown(itemId)}
                        disabled={updatingStatus === itemId}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium capitalize cursor-pointer hover:opacity-80 transition-opacity",
                          getPostStatusColor(${field.targetField}),
                          updatingStatus === itemId && "opacity-50"
                        )}
                      >
                        {updatingStatus === itemId ? 'Updating...' : ${field.targetField} || 'draft'}
                      </button>
                      {statusDropdown === itemId && (
                        <div className="absolute left-0 top-12 z-20 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                          {POST_STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(item, s)}
                              className={cn(
                                "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between capitalize",
                                ${field.targetField} === s ? "bg-gray-50 dark:bg-gray-700" : ""
                              )}
                            >
                              {s}
                              {${field.targetField} === s && <Check className="w-4 h-4 text-green-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>`;
          }
          // Applications status badge (simple, no dropdown - change from detail page)
          if (isApplicationsTable) {
            return `<td className="py-4 px-6">
                      <span className={cn(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize',
                        getApplicationStatusColor(${field.targetField})
                      )}>
                        {${field.targetField} || 'submitted'}
                      </span>
                    </td>`;
          }
          return `<td className="py-4 px-6">
                      <span className={\`inline-flex px-2 py-1 text-xs font-medium rounded-full \${
                        ${field.targetField} === 'confirmed' || ${field.targetField} === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : ${field.targetField} === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }\`}>
                        {${field.targetField}}
                      </span>
                    </td>`;
        }
        // Check if this is likely a JSONB/object field
        const isJsonField = field.targetField.match(/location|cuisine_types|opening_hours|metadata|settings|config|address|coordinates|preferences|data|options|details|info|extra|custom|attributes|properties|tags|categories|features|permissions|roles|social|links/i);

        if (isJsonField) {
          // JSONB field - render as string or show info property
          return `<td className={\`py-4 px-6 \${styles.text}\`}>
                      {typeof ${field.targetField} === 'object' && ${field.targetField} !== null
                        ? (${field.targetField}.info || ${field.targetField}.name || JSON.stringify(${field.targetField}).substring(0, 50) + '...')
                        : (${field.targetField} || '-')}
                    </td>`;
        }

        // Default cell - handle primitives safely
        return `<td className={\`py-4 px-6 \${styles.text}\`}>
                      {typeof ${field.targetField} === 'object' && ${field.targetField} !== null
                        ? JSON.stringify(${field.targetField})
                        : (${field.targetField} ?? '-')}
                    </td>`;
      })
      .join('\n                    ');
  };

  // Generate orders-specific imports and constants
  const ordersImports = isOrdersTable ? `
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
` : '';

  // Generate posts-specific imports and constants
  const postsImports = isPostsTable ? `
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const POST_STATUSES = ['published', 'draft'];
` : '';

  // Generate applications-specific imports and helpers
  const applicationsImports = isApplicationsTable ? `
import { Link } from 'react-router-dom';
` : '';

  const applicationsHelpers = isApplicationsTable ? `
  // Extract filename from resume_url
  const getResumeFilename = (url: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('file:')) {
      return url.replace('file:', '');
    }
    // Try to extract filename from URL
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'Resume';
    } catch {
      return 'Resume';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selected':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
` : '';

  const ordersStateVars = isOrdersTable ? `
  const queryClient = useQueryClient();
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
` : '';

  const postsStateVars = isPostsTable ? `
  const queryClient = useQueryClient();
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
` : '';

  const ordersHandlers = isOrdersTable ? `
  const toggleStatusDropdown = (itemId: string) => {
    setStatusDropdown(statusDropdown === itemId ? null : itemId);
  };

  const handleStatusChange = async (item: any, newStatus: string) => {
    const itemId = item.id || item._id;
    setUpdatingStatus(itemId);
    setStatusDropdown(null);

    try {
      await api.patch<any>(\`/orders/\${itemId}\`, { status: newStatus });
      toast.success(\`Order status updated to \${newStatus}\`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase() || 'pending';
    switch (normalized) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
` : '';

  const postsHandlers = isPostsTable ? `
  const toggleStatusDropdown = (itemId: string) => {
    setStatusDropdown(statusDropdown === itemId ? null : itemId);
  };

  const handleStatusChange = async (item: any, newStatus: string) => {
    const itemId = item.id || item._id;
    setUpdatingStatus(itemId);
    setStatusDropdown(null);

    try {
      await api.patch<any>(\`/posts/\${itemId}\`, { status: newStatus });
      toast.success(\`Post status updated to \${newStatus}\`);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Failed to update post status:', error);
      toast.error('Failed to update post status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getPostStatusColor = (status: string) => {
    const normalized = status?.toLowerCase() || 'draft';
    switch (normalized) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
` : '';

  return `
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MoreHorizontal, Edit, Trash2, Eye, X, Plus, ChevronLeft, ChevronRight, Loader2${isOrdersTable || isPostsTable ? ', Check' : ''}${isApplicationsTable ? ', ExternalLink, FileText' : ''} } from 'lucide-react';
import { useNavigate${isApplicationsTable ? ', Link' : ''} } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
${ordersImports}${postsImports}

interface TableProps {
  [key: string]: any;
  className?: string;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  itemsPerPage?: number;
  editRoute?: string;
  detailRoute?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
}

const Table: React.FC<TableProps> = ({
  className,
  onView,
  onEdit,
  onDelete,
  itemsPerPage = 10,
  editRoute: editRouteProp,
  detailRoute: detailRouteProp,
  variant = 'minimal',
  colorScheme = 'blue',
  ...props
}) => {
  const navigate = useNavigate();
  const entity = '${dataSource || 'items'}';
  const styles = getVariantStyles(variant, colorScheme);

  // Use routes from props or catalog defaults
  const configuredEditRoute = editRouteProp || '${editRoute || ''}';
  const configuredDetailRoute = detailRouteProp || '${detailRoute || ''}';

  // Extract data from props - memoized to prevent infinite re-renders
  const propData = useMemo(() => {
    const data = props['${dataSource?.replace(/\./g, '_') || 'orders'}'] || props.data || props.items || [];
    return Array.isArray(data) ? data : [];
  }, [props]);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`/\${entity}\`);
        // Handle both response formats: [...] directly or { data: [...] }
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error(\`Failed to fetch \${entity}:\`, err);
        return [];
      }
    },
    // Only fetch if no prop data provided
    enabled: propData.length === 0,
    retry: 1,
  });

  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });
${ordersStateVars}${postsStateVars}
${applicationsHelpers}
  // Use prop data if available, otherwise use fetched data
  const sourceData = propData.length > 0 ? propData : (fetchedData || []);

  // Filter out deleted items (optimistic deletion)
  const data = useMemo(() => {
    return sourceData.filter((item: any) => {
      const itemId = String(item.id || item._id);
      return !deletedIds.has(itemId);
    });
  }, [sourceData, deletedIds]);

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Helper to replace route params with actual values from item
  const replaceRouteParams = (route: string, item: any): string => {
    const itemId = item.id || item._id;
    // Replace all :param patterns with corresponding item values
    return route.replace(/:([a-zA-Z_]+)/g, (match, param) => {
      // Check if item has this property
      if (item[param] !== undefined) {
        return String(item[param]);
      }
      // Fallback to id for common patterns
      if (param === 'id' || param.endsWith('_id')) {
        return itemId;
      }
      return itemId; // Default fallback
    });
  };

  const handleView = (item: any) => {
    const itemId = item.id || item._id;
    if (onView) {
      onView(item);
    } else {
      // Use configured detail route from catalog, or fallback to entity-based route
      let viewRoute = configuredDetailRoute && configuredDetailRoute.length > 0
        ? replaceRouteParams(configuredDetailRoute, item)
        : \`/\${entity}/\${itemId}\`;
      navigate(viewRoute);
    }
    setOpenDropdown(null);
  };

  const handleEdit = (item: any) => {
    const itemId = item.id || item._id;
    if (onEdit) {
      onEdit(item);
    } else {
      // Use configured edit route from catalog, or fallback to entity-based route
      let editPath = configuredEditRoute && configuredEditRoute.length > 0
        ? replaceRouteParams(configuredEditRoute, item)
        : \`/\${entity}/\${itemId}/edit\`;
      navigate(editPath);
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

    if (!entity) {
      console.error('Cannot delete: entity is required');
      setDeleteModal({ open: false, item: null });
      return;
    }

    try {
      // Make API call to delete the item
      await api.delete<any>(\`/\${entity}/\${itemId}\`);

      // Remove from display (optimistic deletion)
      setDeletedIds(prev => new Set(prev).add(String(itemId)));

      // Call parent handler if provided
      if (onDelete) {
        onDelete({ id: itemId, entity });
      }

      setDeleteModal({ open: false, item: null });
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
      setDeleteModal({ open: false, item: null });
    }
  };

  const toggleDropdown = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };
${ordersHandlers}${postsHandlers}
  return (
    <>
      <div className={cn('w-full max-w-6xl mx-auto p-4', className)}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{entity.charAt(0).toUpperCase() + entity.slice(1).replace(/_/g, ' ')}</h2>
            ${createRoute ? `<button
              onClick={() => navigate('${createRoute}')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              ${createLabel}
            </button>` : ''}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  ${generateHeaders()}
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
                      Failed to load data. Please try again.
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={${displayFields.length + 1}} className="py-12 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item: any, index: number) => {
                    const itemId = item.id || item._id || index;
                    ${generateFieldExtractors()}

                    return (
                      <tr
                        key={itemId}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        ${generateCells()}
                        <td className="py-4 px-6 relative">
                          <button
                            onClick={() => toggleDropdown(itemId)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>

                          {openDropdown === itemId && (
                            <div className="absolute right-0 top-12 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                              <button
                                onClick={() => handleView(item)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              {${showEditButton} && configuredEditRoute && configuredEditRoute.length > 0 && (
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                              {${showDeleteButton} && (
                                <button
                                  onClick={() => handleDeleteClick(item)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              )}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage = page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1);

                    const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                                        (page === currentPage + 2 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={\`px-3 py-2 text-sm font-medium rounded-lg transition-colors \${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }\`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteModal({ open: false, item: null })}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Confirm Delete
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete this item? This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setDeleteModal({ open: false, item: null })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, item: null })}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;
  `;
};
