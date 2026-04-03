/**
 * Entity Form Generator
 *
 * Generates create/edit form components with:
 * - Dynamic field rendering based on type
 * - Form validation
 * - API submission (create/update)
 * - Loading and error states
 * - FK dropdown fields
 */

import { snakeCase, pascalCase, camelCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'password'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'file'
  | 'image'
  | 'color'
  | 'currency'
  | 'fk'; // Foreign key dropdown

export interface FormFieldConfig {
  name: string;
  label?: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  // For FK fields
  fkEntity?: string;
  fkEndpoint?: string;
  fkDisplayField?: string;
  fkValueField?: string;
  // Validation
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  // Layout
  fullWidth?: boolean;
  helpText?: string;
}

export interface EntityFormOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  fields: FormFieldConfig[];
  endpoint?: string;
  queryKey?: string;
  mode?: 'create' | 'edit' | 'both';
  redirectAfterSubmit?: string;
  columns?: 1 | 2;
}

/**
 * Generate an entity form component
 */
export function generateEntityForm(options: EntityFormOptions): string {
  const {
    entity,
    fields,
    mode = 'both',
    columns = 2,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'Form';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const redirectAfterSubmit = options.redirectAfterSubmit || `/${tableName}`;

  // Collect FK entities for data fetching
  const fkFields = fields.filter(f => f.type === 'fk' && f.fkEntity);

  // Build initial form data
  const initialFormData: Record<string, any> = {};
  fields.forEach(f => {
    if (f.type === 'checkbox' || f.type === 'switch') {
      initialFormData[f.name] = f.defaultValue ?? false;
    } else if (f.type === 'multiselect') {
      initialFormData[f.name] = f.defaultValue ?? [];
    } else if (f.type === 'number' || f.type === 'currency') {
      initialFormData[f.name] = f.defaultValue ?? '';
    } else {
      initialFormData[f.name] = f.defaultValue ?? '';
    }
  });

  const gridColsClass = columns === 2 ? 'md:grid-cols-2' : '';

  return `import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  id?: string;
  initialData?: any;
  className?: string;
  mode?: 'create' | 'edit';
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  id: propId,
  initialData,
  className,
  mode: propMode,
  onSuccess,
  onCancel,
}) => {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const isEditMode = propMode === 'edit' || (propMode !== 'create' && !!id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Record<string, any>>(${JSON.stringify(initialFormData)});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing data for edit mode
  const { data: existingData, isLoading: loadingData } = useQuery({
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
    enabled: isEditMode && !initialData && !!id,
  });

  ${fkFields.map(f => {
    const fkTableName = snakeCase(pluralize.plural(f.fkEntity || ''));
    const fkEndpoint = f.fkEndpoint || '/' + fkTableName;
    const queryKeyName = camelCase(f.fkEntity || '') + 'Options';
    return `// Fetch ${f.fkEntity} options
  const { data: ${queryKeyName} = [] } = useQuery({
    queryKey: ['${fkTableName}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${fkEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        return [];
      }
    },
  });`;
  }).join('\n\n  ')}

  // Set initial data
  useEffect(() => {
    const data = initialData || existingData;
    if (data) {
      setFormData(prev => ({
        ...prev,
        ${fields.map(f => `${f.name}: data.${f.name} ?? data.${snakeCase(f.name)} ?? prev.${f.name}`).join(',\n        ')},
      }));
    }
  }, [initialData, existingData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${endpoint}', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
      if (onSuccess) onSuccess(data);
      else navigate('${redirectAfterSubmit}');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put<any>(\`${endpoint}/\${id}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
      queryClient.invalidateQueries({ queryKey: ['${queryKey}', id] });
      if (onSuccess) onSuccess(data);
      else navigate('${redirectAfterSubmit}');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleMultiSelect = (name: string, value: string) => {
    setFormData(prev => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [name]: updated };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    ${fields.filter(f => f.required).map(f => `
    if (!formData.${f.name} && formData.${f.name} !== 0 && formData.${f.name} !== false) {
      newErrors.${f.name} = '${f.label || formatFieldLabel(f.name)} is required';
    }`).join('')}

    ${fields.filter(f => f.type === 'email').map(f => `
    if (formData.${f.name} && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(formData.${f.name})) {
      newErrors.${f.name} = 'Please enter a valid email';
    }`).join('')}

    ${fields.filter(f => f.minLength).map(f => `
    if (formData.${f.name} && formData.${f.name}.length < ${f.minLength}) {
      newErrors.${f.name} = '${f.label || formatFieldLabel(f.name)} must be at least ${f.minLength} characters';
    }`).join('')}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Convert field names to snake_case for API
    const apiData: Record<string, any> = {};
    for (const [key, value] of Object.entries(formData)) {
      apiData[key] = value;
    }

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync(apiData);
      } else {
        await createMutation.mutateAsync(apiData);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      setErrors({ _form: error.message || 'An error occurred' });
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate('${redirectAfterSubmit}');
  };

  if (loadingData) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit' : 'Create'} ${displayName}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {errors._form && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {errors._form}
            </div>
          )}

          <div className="grid grid-cols-1 ${gridColsClass} gap-6">
            ${fields.map(f => generateFormField(f, fkFields)).join('\n            ')}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Update' : 'Create'} ${displayName}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

function generateFormField(field: FormFieldConfig, fkFields: FormFieldConfig[]): string {
  const label = field.label || formatFieldLabel(field.name);
  const fullWidthClass = field.fullWidth ? 'md:col-span-2' : '';
  const required = field.required ? '<span className="text-red-500">*</span>' : '';

  const baseInputClasses = `w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent`;

  switch (field.type) {
    case 'textarea':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <textarea
                name="${field.name}"
                value={formData.${field.name}}
                onChange={handleChange}
                placeholder="${field.placeholder || ''}"
                rows={4}
                className="${baseInputClasses}"
                ${field.required ? 'required' : ''}
              />
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'select':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <select
                name="${field.name}"
                value={formData.${field.name}}
                onChange={handleChange}
                className="${baseInputClasses}"
                ${field.required ? 'required' : ''}
              >
                <option value="">Select ${label.toLowerCase()}</option>
                ${field.options?.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n                ') || ''}
              </select>
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'fk':
      const optionsVar = camelCase(field.fkEntity || '') + 'Options';
      const displayField = field.fkDisplayField || 'name';
      const valueField = field.fkValueField || 'id';
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <select
                name="${field.name}"
                value={formData.${field.name}}
                onChange={handleChange}
                className="${baseInputClasses}"
                ${field.required ? 'required' : ''}
              >
                <option value="">Select ${label.toLowerCase()}</option>
                {${optionsVar}.map((opt: any) => (
                  <option key={opt.${valueField} || opt._id} value={opt.${valueField} || opt._id}>
                    {opt.${displayField}}
                  </option>
                ))}
              </select>
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'checkbox':
    case 'switch':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="${field.name}"
                  checked={formData.${field.name}}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">${label}</span>
              </label>
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500 ml-8">${field.helpText}</p>` : ''}
            </div>`;

    case 'radio':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <div className="space-y-2">
                ${field.options?.map(opt => `
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="${field.name}"
                    value="${opt.value}"
                    checked={formData.${field.name} === '${opt.value}'}
                    onChange={handleChange}
                    className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">${opt.label}</span>
                </label>`).join('') || ''}
              </div>
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'multiselect':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <div className="space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 max-h-48 overflow-y-auto">
                ${field.options?.map(opt => `
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.${field.name} || []).includes('${opt.value}')}
                    onChange={() => handleMultiSelect('${field.name}', '${opt.value}')}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">${opt.label}</span>
                </label>`).join('') || ''}
              </div>
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'date':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <input
                type="date"
                name="${field.name}"
                value={formData.${field.name}}
                onChange={handleChange}
                className="${baseInputClasses}"
                ${field.required ? 'required' : ''}
              />
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'datetime':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <input
                type="datetime-local"
                name="${field.name}"
                value={formData.${field.name}}
                onChange={handleChange}
                className="${baseInputClasses}"
                ${field.required ? 'required' : ''}
              />
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'time':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <input
                type="time"
                name="${field.name}"
                value={formData.${field.name}}
                onChange={handleChange}
                className="${baseInputClasses}"
                ${field.required ? 'required' : ''}
              />
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'number':
    case 'currency':
      const prefix = field.type === 'currency' ? '<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>' : '';
      const paddingClass = field.type === 'currency' ? 'pl-8' : '';
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <div className="relative">
                ${prefix}
                <input
                  type="number"
                  name="${field.name}"
                  value={formData.${field.name}}
                  onChange={handleChange}
                  placeholder="${field.placeholder || ''}"
                  ${field.min !== undefined ? `min="${field.min}"` : ''}
                  ${field.max !== undefined ? `max="${field.max}"` : ''}
                  step="${field.type === 'currency' ? '0.01' : '1'}"
                  className="${baseInputClasses} ${paddingClass}"
                  ${field.required ? 'required' : ''}
                />
              </div>
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'file':
    case 'image':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag & drop or click to upload
                </p>
                <input
                  type="file"
                  name="${field.name}"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  ${field.type === 'image' ? 'accept="image/*"' : ''}
                />
              </div>
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    case 'color':
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="${field.name}"
                  value={formData.${field.name} || '#000000'}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.${field.name} || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ${field.name}: e.target.value }))}
                  placeholder="#000000"
                  className="${baseInputClasses} flex-1"
                />
              </div>
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;

    default: // text, email, phone, url, password
      return `{/* ${label} */}
            <div className="${fullWidthClass}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label} ${required}
              </label>
              <input
                type="${field.type === 'phone' ? 'tel' : field.type}"
                name="${field.name}"
                value={formData.${field.name}}
                onChange={handleChange}
                placeholder="${field.placeholder || ''}"
                ${field.minLength ? `minLength={${field.minLength}}` : ''}
                ${field.maxLength ? `maxLength={${field.maxLength}}` : ''}
                ${field.pattern ? `pattern="${field.pattern}"` : ''}
                className="${baseInputClasses}"
                ${field.required ? 'required' : ''}
              />
              ${field.helpText ? `<p className="mt-1 text-sm text-gray-500">${field.helpText}</p>` : ''}
              {errors.${field.name} && <p className="mt-1 text-sm text-red-500">{errors.${field.name}}</p>}
            </div>`;
  }
}
