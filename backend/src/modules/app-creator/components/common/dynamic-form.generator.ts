/**
 * Dynamic Form Generator for App Creator
 *
 * Generates create/edit form components with:
 * - Form validation
 * - Field type mapping
 * - API submission
 * - Loading states
 * - FK dropdowns for relationships
 */

import { snakeCase, pascalCase, camelCase } from 'change-case';
import pluralize from 'pluralize';
import { EnhancedEntityDefinition, EnhancedFieldDefinition } from '../../dto/create-app.dto';

interface FormOptions {
  mode: 'create' | 'edit';
  submitRoute?: string;
  successRedirect?: string;
  cancelRoute?: string;
  relatedEntities?: EnhancedEntityDefinition[];
}

/**
 * Generate a form component for an entity
 */
export function generateDynamicForm(
  entity: EnhancedEntityDefinition,
  options: FormOptions
): string {
  const {
    mode,
    relatedEntities = [],
  } = options;

  const entityName = entity.name;
  const tableName = snakeCase(pluralize.plural(entityName));
  const componentName = `${pascalCase(entityName)}${mode === 'create' ? 'Create' : 'Edit'}Form`;
  const displayName = entity.displayName || pascalCase(entityName);

  // Filter fields for form (skip auto-generated fields)
  const formFields = entity.fields.filter(f =>
    !['id', 'created_at', 'updated_at', 'deleted_at'].includes(f.name)
  );

  // Find FK fields to generate dropdowns
  const fkFields = formFields.filter(f => f.name.endsWith('_id'));
  const regularFields = formFields.filter(f => !f.name.endsWith('_id'));

  // Routes with defaults
  const submitRoute = options.submitRoute || `/${tableName}`;
  const successRedirect = options.successRedirect || `/${tableName}`;
  const cancelRoute = options.cancelRoute || `/${tableName}`;

  // Generate initial state object
  const initialState = formFields
    .map(f => `${camelCase(f.name)}: ${getDefaultValue(f)}`)
    .join(',\n    ');

  // Generate form fields JSX
  const fieldInputs = regularFields
    .map(f => generateFormField(f))
    .join('\n\n          ');

  // Generate FK dropdown fields
  const fkInputs = fkFields
    .map(f => generateFKDropdown(f, relatedEntities))
    .join('\n\n          ');

  // Generate FK queries
  const fkQueries = fkFields
    .map(f => generateFKQuery(f))
    .join('\n\n  ');

  return `import React, { useState${mode === 'edit' ? ', useEffect' : ''} } from 'react';
import { useNavigate${mode === 'edit' ? ', useParams' : ''} } from 'react-router-dom';
import { useMutation, useQuery${fkFields.length > 0 ? ', useQueryClient' : ''} } from '@tanstack/react-query';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  className?: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  onSuccess,
  onCancel,
  initialData,
}) => {
  const navigate = useNavigate();
  ${mode === 'edit' ? "const { id } = useParams();" : ''}

  const [formData, setFormData] = useState({
    ${initialState}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  ${mode === 'edit' ? `// Fetch existing data for editing
  const { data: existingData, isLoading: isLoadingData } = useQuery({
    queryKey: ['${tableName}', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/${tableName}/\${id}\`);
      return response?.data || response;
    },
    enabled: !!id && !initialData,
  });

  // Populate form when data loads
  useEffect(() => {
    const data = initialData || existingData;
    if (data) {
      setFormData({
        ${formFields.map(f => `${camelCase(f.name)}: data.${f.name} ?? ${getDefaultValue(f)}`).join(',\n        ')}
      });
    }
  }, [existingData, initialData]);` : ''}

  ${fkQueries}

  // Submit mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      ${mode === 'edit'
        ? `return api.put<any>(\`/${tableName}/\${id}\`, data);`
        : `return api.post<any>('/${tableName}', data);`
      }
    },
    onSuccess: (response) => {
      toast.success('${displayName} ${mode === 'edit' ? 'updated' : 'created'} successfully!');
      if (onSuccess) {
        onSuccess(response);
      } else {
        navigate('${successRedirect}');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to ${mode === 'edit' ? 'update' : 'create'} ${displayName.toLowerCase()}');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value ? parseFloat(value) : '') : value,
    }));

    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    ${formFields
      .filter(f => f.required)
      .map(f => `if (!formData.${camelCase(f.name)}) newErrors.${camelCase(f.name)} = '${formatFieldLabel(f.name)} is required';`)
      .join('\n    ')
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Transform camelCase to snake_case for API
    const apiData: Record<string, any> = {};
    ${formFields.map(f => `apiData.${f.name} = formData.${camelCase(f.name)};`).join('\n    ')}

    mutation.mutate(apiData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('${cancelRoute}');
    }
  };

  ${mode === 'edit' ? `if (isLoadingData && !initialData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }` : ''}

  return (
    <div className={cn('max-w-2xl mx-auto p-6', className)}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            ${mode === 'edit' ? 'Edit' : 'Create'} ${displayName}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          ${fkInputs}

          ${fieldInputs}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 inline-block mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 inline-block mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 inline-block mr-2" />
              )}
              ${mode === 'edit' ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Get default value for a field type
 */
function getDefaultValue(field: EnhancedFieldDefinition): string {
  if (field.default !== undefined) {
    return typeof field.default === 'string' ? `'${field.default}'` : String(field.default);
  }

  switch (field.type) {
    case 'boolean': return 'false';
    case 'number':
    case 'integer':
    case 'decimal': return "''";
    case 'json':
    case 'array': return '[]';
    default: return "''";
  }
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
 * Generate form field JSX based on field type
 */
function generateFormField(field: EnhancedFieldDefinition): string {
  const fieldName = field.name;
  const camelName = camelCase(fieldName);
  const label = formatFieldLabel(fieldName);
  const required = field.required ? ' *' : '';

  // Text area for text/long content
  if (field.type === 'text' || fieldName.match(/description|content|bio|notes|body/i)) {
    return `<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label}${required}
            </label>
            <textarea
              name="${camelName}"
              value={formData.${camelName}}
              onChange={handleChange}
              rows={4}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
                errors.${camelName} ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
            {errors.${camelName} && <p className="mt-1 text-sm text-red-500">{errors.${camelName}}</p>}
          </div>`;
  }

  // Enum/select field
  if (field.type === 'enum' && field.enumValues) {
    const options = field.enumValues
      .map(v => `<option value="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</option>`)
      .join('\n                ');

    return `<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label}${required}
            </label>
            <select
              name="${camelName}"
              value={formData.${camelName}}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
                errors.${camelName} ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            >
              <option value="">Select ${label}</option>
              ${options}
            </select>
            {errors.${camelName} && <p className="mt-1 text-sm text-red-500">{errors.${camelName}}</p>}
          </div>`;
  }

  // Boolean/checkbox
  if (field.type === 'boolean') {
    return `<div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="${camelName}"
              checked={formData.${camelName}}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ${label}
            </label>
          </div>`;
  }

  // Number input
  if (field.type === 'number' || field.type === 'integer' || field.type === 'decimal') {
    const step = field.type === 'decimal' ? 'step="0.01"' : '';
    return `<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label}${required}
            </label>
            <input
              type="number"
              name="${camelName}"
              value={formData.${camelName}}
              onChange={handleChange}
              ${step}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
                errors.${camelName} ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
            {errors.${camelName} && <p className="mt-1 text-sm text-red-500">{errors.${camelName}}</p>}
          </div>`;
  }

  // Email input
  if (field.type === 'email' || fieldName.includes('email')) {
    return `<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label}${required}
            </label>
            <input
              type="email"
              name="${camelName}"
              value={formData.${camelName}}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
                errors.${camelName} ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
            {errors.${camelName} && <p className="mt-1 text-sm text-red-500">{errors.${camelName}}</p>}
          </div>`;
  }

  // URL input
  if (field.type === 'url' || fieldName.match(/url|website|link/i)) {
    return `<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label}${required}
            </label>
            <input
              type="url"
              name="${camelName}"
              value={formData.${camelName}}
              onChange={handleChange}
              placeholder="https://"
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
                errors.${camelName} ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
            {errors.${camelName} && <p className="mt-1 text-sm text-red-500">{errors.${camelName}}</p>}
          </div>`;
  }

  // Date input
  if (field.type === 'date' || field.type === 'datetime') {
    const inputType = field.type === 'datetime' ? 'datetime-local' : 'date';
    return `<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label}${required}
            </label>
            <input
              type="${inputType}"
              name="${camelName}"
              value={formData.${camelName}}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
                errors.${camelName} ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
            {errors.${camelName} && <p className="mt-1 text-sm text-red-500">{errors.${camelName}}</p>}
          </div>`;
  }

  // Default text input
  return `<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label}${required}
            </label>
            <input
              type="text"
              name="${camelName}"
              value={formData.${camelName}}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
                errors.${camelName} ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            />
            {errors.${camelName} && <p className="mt-1 text-sm text-red-500">{errors.${camelName}}</p>}
          </div>`;
}

/**
 * Generate FK dropdown field
 */
function generateFKDropdown(
  field: EnhancedFieldDefinition,
  relatedEntities: EnhancedEntityDefinition[]
): string {
  const fieldName = field.name;
  const camelName = camelCase(fieldName);
  const relatedEntityName = fieldName.replace(/_id$/, '');
  const relatedTableName = pluralize.plural(relatedEntityName);
  const label = formatFieldLabel(relatedEntityName);
  const required = field.required ? ' *' : '';

  return `<div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label}${required}
            </label>
            <select
              name="${camelName}"
              value={formData.${camelName}}
              onChange={handleChange}
              className={cn(
                "w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800",
                errors.${camelName} ? "border-red-500" : "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
            >
              <option value="">Select ${label}</option>
              {${camelCase(relatedTableName)}?.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name || item.title || item.id}
                </option>
              ))}
            </select>
            {errors.${camelName} && <p className="mt-1 text-sm text-red-500">{errors.${camelName}}</p>}
          </div>`;
}

/**
 * Generate query to fetch related entity data for FK dropdown
 */
function generateFKQuery(field: EnhancedFieldDefinition): string {
  const relatedEntityName = field.name.replace(/_id$/, '');
  const relatedTableName = pluralize.plural(relatedEntityName);
  const camelTableName = camelCase(relatedTableName);

  return `// Fetch ${relatedTableName} for dropdown
  const { data: ${camelTableName} } = useQuery({
    queryKey: ['${relatedTableName}'],
    queryFn: async () => {
      const response = await api.get<any>('/${relatedTableName}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });`;
}
