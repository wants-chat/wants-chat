import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDetailPageHeader = (resolved: ResolvedComponent) => {
  const { dataSource } = resolved;
  const entity = resolved.data?.entity || dataSource;
  const fields = resolved.data?.fields || [];
  const props = resolved.props || {};

  // Generate API endpoint from entity name
  const apiEndpoint = `/api/v1/${entity}/:id`;
  const apiMethod = 'GET';

  // Get display fields from props or use all fields
  const displayFields = props.displayFields || fields.map(f => f.name).filter(n => n !== 'id' && n !== 'user_id');

  // Get routes from props
  const backRoute = props.backRoute || `/${entity}`;
  const editRoute = props.editRoute || `/${entity}/:id/edit`;
  const showBackButton = props.showBackButton !== false;
  const showEditButton = props.showEditButton !== false;
  const showDeleteButton = props.showDeleteButton !== false;

  // Find key fields
  const titleField = fields.find(f => f.name === 'title' || f.name === 'name')?.name || 'name';

  // Generate field display rows
  const generateFieldRows = () => {
    return displayFields.map(fieldName => {
      const field = fields.find(f => f.name === fieldName);
      const fieldType = field?.type || 'text';
      const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      if (fieldType === 'boolean') {
        return `
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">${label}</span>
                <span className={\`px-2 py-1 rounded text-xs font-medium \${data.${fieldName} ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}\`}>
                  {data.${fieldName} ? 'Yes' : 'No'}
                </span>
              </div>`;
      }

      if (fieldType === 'date' || fieldName.includes('date') || fieldName.includes('_at')) {
        return `
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">${label}</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {data.${fieldName} ? formatDate(data.${fieldName}) : '-'}
                </span>
              </div>`;
      }

      if (fieldType === 'number' || fieldName.includes('amount') || fieldName.includes('balance') || fieldName.includes('price')) {
        return `
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">${label}</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {data.currency && ['amount', 'balance', 'price', 'target_amount', 'current_amount'].some(k => '${fieldName}'.includes(k))
                    ? \`\${data.currency} \${Number(data.${fieldName} || 0).toLocaleString()}\`
                    : (data.${fieldName} ?? '-')}
                </span>
              </div>`;
      }

      if (fieldType === 'textarea' || fieldName === 'description' || fieldName === 'notes') {
        return `
              {data.${fieldName} && (
                <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 block mb-2">${label}</span>
                  <p className="text-gray-900 dark:text-white">{data.${fieldName}}</p>
                </div>
              )}`;
      }

      // Default text field
      return `
              <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">${label}</span>
                <span className="text-gray-900 dark:text-white font-medium">{data.${fieldName} || '-'}</span>
              </div>`;
    }).join('');
  };

  return `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface DetailPageHeaderProps {
  data?: any;
  className?: string;
  onBack?: () => void;
  onDelete?: (id: string) => void;
  [key: string]: any; // Accept any additional props from catalog
}

const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
  data: initialData,
  className,
  onBack,
  onDelete
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  // Fetch data from API if no initial data provided
  const { data: fetchedData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['${entity}', params.id],
    queryFn: async () => {
      try {
        let endpoint = '${apiEndpoint}';
        Object.keys(params).forEach(key => {
          endpoint = endpoint.replace(\`:$\{key}\`, params[key] as string);
        });

        const response = await api.get<any>(endpoint.replace('/api/v1', ''));
        return response.data || response;
      } catch (err: any) {
        console.error('Error fetching detail data:', err);
        throw err;
      }
    },
    enabled: !initialData && !!params.id,
    retry: 1,
  });

  const data = initialData || fetchedData;
  const error = queryError?.message || null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('${backRoute}');
    }
  };

  const handleEdit = () => {
    const editPath = '${editRoute}'.replace(':id', params.id || data?.id || '');
    navigate(editPath);
  };

  const handleDelete = async () => {
    if (!data?.id) return;

    try {
      setDeleting(true);
      await api.delete<any>(\`/${entity}/\${data.id}\`);
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete(data.id);
      }
      navigate('${backRoute}');
    } catch (err: any) {
      console.error('Error deleting:', err);
      alert('Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading && !initialData) {
    return (
      <div className={cn("flex items-center justify-center min-h-[200px]", className)}>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", className)}>
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn("p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", className)}>
        <p className="text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const title = data.${titleField} || 'Untitled';

  return (
    <>
      <div className={cn("bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700", className)}>
        {/* Header with Back and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          ${showBackButton ? `<button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>` : '<div />'}

          <div className="flex items-center gap-2">
            ${showEditButton ? `<button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>` : ''}
            ${showDeleteButton ? `<button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>` : ''}
          </div>
        </div>

        {/* Title */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>

        {/* Detail Fields */}
        <div className="p-6">
          ${generateFieldRows()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DetailPageHeader;
  `;
};
