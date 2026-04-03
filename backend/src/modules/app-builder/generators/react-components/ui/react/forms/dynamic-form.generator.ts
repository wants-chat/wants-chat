import { ResolvedComponent } from '../../../types/resolved-component.interface';

interface Field {
  name: string;
  type: string;
  required: boolean;
  label?: string;
  placeholder?: string;
  options?: string[];
}

export const generateDynamicForm = (resolved: ResolvedComponent) => {
  const dataSource = resolved.dataSource;
  const fields: Field[] = (resolved.data?.fields || []) as Field[];

  if (fields.length === 0) {
    console.warn(`No fields found for form component ${resolved.componentType}`);
  }

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) return part;
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
  const entityName = resolved.data?.entity || dataSource;

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'data';

  // Generate label from field name
  const generateLabel = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate input field based on type
  const generateField = (field: Field): string => {
    const label = field.label || generateLabel(field.name);
    const placeholder = field.placeholder || `Enter ${label.toLowerCase()}`;
    const required = field.required ? 'required' : '';
    const requiredStar = field.required ? '<span className="text-red-500">*</span>' : '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return `
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${label} ${requiredStar}
          </label>
          <input
            type="${field.type}"
            name="${field.name}"
            placeholder="${placeholder}"
            ${required}
            defaultValue={${dataName}?.${field.name} || ''}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>`;

      case 'number':
      case 'currency':
        return `
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${label} ${requiredStar}
          </label>
          <input
            type="number"
            name="${field.name}"
            placeholder="${placeholder}"
            ${required}
            step="${field.type === 'currency' ? '0.01' : '1'}"
            defaultValue={${dataName}?.${field.name} || ''}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>`;

      case 'date':
        return `
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${label} ${requiredStar}
          </label>
          <input
            type="date"
            name="${field.name}"
            ${required}
            defaultValue={${dataName}?.${field.name} || ''}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>`;

      case 'select':
      case 'dropdown':
        // Generate common options based on field name
        let options: string[] = [];
        if (field.name.includes('account_type')) {
          options = ['Checking', 'Savings', 'Credit Card', 'Investment'];
        } else if (field.name.includes('currency')) {
          options = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY'];
        } else if (field.name.includes('category')) {
          options = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Personal Care', 'Other'];
        } else if (field.name.includes('frequency')) {
          options = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];
        } else if (field.name.includes('payment_method') || field.name.includes('payment')) {
          options = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Check', 'Other'];
        } else if (field.name.includes('period')) {
          options = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
        } else if (field.name.includes('status')) {
          options = ['Active', 'Inactive', 'Pending', 'Completed'];
        } else {
          options = field.options || ['Option 1', 'Option 2', 'Option 3'];
        }

        return `
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${label} ${requiredStar}
          </label>
          <select
            name="${field.name}"
            ${required}
            defaultValue={${dataName}?.${field.name} || ''}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Select ${label}</option>
            ${options.map(opt => `<option value="${opt.toLowerCase().replace(/\s+/g, '_')}">${opt}</option>`).join('\n            ')}
          </select>
        </div>`;

      case 'boolean':
      case 'checkbox':
        return `
        <div className="flex items-center">
          <input
            type="checkbox"
            name="${field.name}"
            id="${field.name}"
            defaultChecked={${dataName}?.${field.name} || false}
            className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="${field.name}" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            ${label}
          </label>
        </div>`;

      case 'textarea':
        return `
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${label} ${requiredStar}
          </label>
          <textarea
            name="${field.name}"
            placeholder="${placeholder}"
            ${required}
            rows={4}
            defaultValue={${dataName}?.${field.name} || ''}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>`;

      case 'file':
      case 'image':
      case 'upload':
        const acceptType = field.type === 'image' ? 'image/*' : '*/*';
        return `
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${label} ${requiredStar}
          </label>
          <input
            type="file"
            name="${field.name}"
            ${required}
            accept="${acceptType}"
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {${dataName}?.${field.name} && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Current file: <a href={${dataName}.${field.name}} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{${dataName}.${field.name}}</a>
            </p>
          )}
        </div>`;

      default:
        return `
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${label} ${requiredStar}
          </label>
          <input
            type="text"
            name="${field.name}"
            placeholder="${placeholder}"
            ${required}
            defaultValue={${dataName}?.${field.name} || ''}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>`;
    }
  };

  const title = resolved.title || 'Form';
  const formFields = fields.map(field => generateField(field)).join('\n        ');

  return {
    code: `
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronRight, Save, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicFormProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ ${dataName}: propData, className }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await api.post<any>('/${entityName}', formData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      navigate('/${entityName?.replace(/_/g, '-') || 'data'}');
    },
    onError: (err: any) => {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to submit form');
      setIsSubmitting(false);
    },
  });

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, any> = {};

    formData.forEach((value, key) => {
      // Handle checkboxes
      if (value === 'on') {
        data[key] = true;
      } else if (value === 'off' || value === '') {
        // For checkboxes not checked or empty values
        const input = (e.target as HTMLFormElement).elements.namedItem(key) as HTMLInputElement;
        if (input && input.type === 'checkbox') {
          data[key] = false;
        } else if (value !== '') {
          data[key] = value;
        }
      } else {
        data[key] = value;
      }
    });

    console.log('Submitting form data:', data);
    submitMutation.mutate(data);
  };

  return (
    <div className={cn("max-w-3xl mx-auto", className)}>
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-gray-200">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/${entityName?.replace(/_/g, '-') || 'data'}" className="hover:text-gray-900 dark:hover:text-gray-200">
          ${generateLabel(entityName || 'Data')}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 dark:text-gray-200 font-medium">Add New</span>
      </nav>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">${title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Fill in the details below</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          ${formFields}

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/${entityName?.replace(/_/g, '-') || 'data'}')}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;
    `,
  };
};
