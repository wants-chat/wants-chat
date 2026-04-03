import { ResolvedComponent } from '../../../types/resolved-component.interface';
//import { generateDynamicForm } from './dynamic-form.generator';

export const generateFormComponents = (
  resolved: ResolvedComponent,
  variant: 'card' | 'minimal' | 'modern' = 'modern'
) => {
  const dataSource = resolved.dataSource;

  // Use dynamic form generator for all forms based on catalog fields
  //return generateDynamicForm(resolved);

  // Special case: If dataSource is 'products', use the rich text editor form from the product generator
  /*if (dataSource === 'products') {
    // Import and use the product-specific form from rich-text-editor.generator
    const { generateRichTextEditor } = require('./rich-text-editor.generator');
    return generateRichTextEditor(resolved);
  }*/

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
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

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Upload, X, Image as ImageIcon, File as FileIcon, Music, Video, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

// File upload component with preview
const FileInput: React.FC<{
  name: string;
  label: string;
  accept?: string;
  required?: boolean;
  defaultValue?: string;
  type?: 'image' | 'video' | 'audio' | 'file';
  onChange?: (file: File | null, previewUrl: string | null) => void;
  [key: string]: any; // Allow data attributes
}> = ({ name, label, accept, required, defaultValue, type = 'file', onChange, ...rest }) => {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);

      // Create preview for images
      if (type === 'image' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      onChange?.(file, preview);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName('');
    onChange?.(null, null);
    // Reset file input
    const input = document.getElementById(\`file-input-\${name}\`) as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Set file on the hidden input
      const input = document.getElementById(\`file-input-\${name}\`) as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileChange({ target: input } as any);
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'image': return <ImageIcon className="w-8 h-8" />;
      case 'video': return <Video className="w-8 h-8" />;
      case 'audio': return <Music className="w-8 h-8" />;
      default: return <FileIcon className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden file input - always in DOM for form submission */}
      <input
        type="file"
        name={name}
        accept={accept}
        required={required && !preview && !fileName}
        onChange={handleFileChange}
        className="hidden"
        id={\`file-input-\${name}\`}
        {...rest}
      />

      {/* Preview */}
      {preview && type === 'image' && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* File name display for non-image files */}
      {fileName && type !== 'image' && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
          {getIcon()}
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{fileName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload area */}
      {!preview && !fileName && (
        <label
          htmlFor={\`file-input-\${name}\`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          )}
        >
          <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
            <Upload className="w-8 h-8" />
            <div className="text-sm">
              <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span>
              {' or drag and drop'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {type === 'image' && 'PNG, JPG, GIF up to 10MB'}
              {type === 'video' && 'MP4, WebM up to 100MB'}
              {type === 'audio' && 'MP3, WAV, OGG up to 10MB'}
              {type === 'file' && 'Any file up to 10MB'}
            </p>
          </div>
        </label>
      )}
    </div>
  );
};

// Dynamic select component that fetches options from API
const DynamicSelect: React.FC<{
  name: string;
  defaultValue?: string;
  required?: boolean;
  apiEndpoint: string;
  labelField: string;
  valueField: string;
  placeholder?: string;
}> = ({ name, defaultValue, required, apiEndpoint, labelField, valueField, placeholder }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get<any>(apiEndpoint);
        setOptions(Array.isArray(response) ? response : (response?.data || []));
      } catch (error) {
        console.error('Failed to fetch options:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [apiEndpoint]);

  return (
    <select
      name={name}
      defaultValue={defaultValue || ''}
      required={required}
      disabled={loading}
      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
    >
      <option value="">{loading ? 'Loading...' : (placeholder || 'Select an option')}</option>
      {options.map((opt: any) => (
        <option key={opt[valueField]} value={opt[valueField]}>
          {opt[labelField]}
        </option>
      ))}
    </select>
  );
};`;

  // Get fields from catalog definition
  const fields = resolved.data?.fields || [];
  const entityName = resolved.data?.entity || 'item';
  const formTitle = resolved.title || `Edit ${entityName}`;

  // Get API route from serverFunction if available (for create/update actions)
  const getApiRouteFromServerFunction = () => {
    if (!resolved.actions || resolved.actions.length === 0) {
      return null;
    }

    // Look for create or update action with serverFunction
    const submitAction = resolved.actions.find(
      action => (action.type === 'create' || action.type === 'update') && action.serverFunction
    );

    if (submitAction?.serverFunction?.route) {
      // Remove /api/v1/ prefix if present since api client adds it
      // Also convert hyphens to underscores to match backend route naming convention
      return submitAction.serverFunction.route
        .replace(/^\/api\/v1\//, '')
        .replace(/-/g, '_');
    }

    return null;
  };

  const serverFunctionRoute = getApiRouteFromServerFunction();

  // Generate form fields dynamically based on catalog field definitions
  const generateFormFields = () => {
    return fields.map((field: any) => {
      const fieldName = field.name;
      const fieldType = field.type;
      const isRequired = field.required;
      const label = fieldName.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      // Generate input based on field type
      if (fieldType === 'boolean') {
        return `
          <div key="${fieldName}">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="${fieldName}"
                defaultChecked={formData?.['${fieldName}'] || false}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">${label}</span>
            </label>
          </div>`;
      } else if (fieldType === 'number') {
        return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <input
              type="number"
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              ${isRequired ? 'required' : ''}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>`;
      } else if (fieldType === 'date') {
        return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <input
              type="date"
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              ${isRequired ? 'required' : ''}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>`;
      } else if (fieldType === 'select') {
        // Check if field has dataSource defined (from catalog - like music streaming)
        if (field.dataSource) {
          const ds = field.dataSource;
          return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label.replace(' Id', '')} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <DynamicSelect
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              required={${isRequired}}
              apiEndpoint="${ds.endpoint}"
              labelField="${ds.labelField}"
              valueField="${ds.valueField}"
              placeholder="Select ${label.replace(' Id', '')}"
            />
          </div>`;
        }

        // Check if field has optionsFrom defined (for dynamic dropdown from another entity)
        if (field.optionsFrom) {
          const entityEndpoint = '/' + field.optionsFrom;
          const labelField = field.labelField || 'name';
          const valueField = field.valueField || 'id';
          return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label.replace(' Id', '')} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <DynamicSelect
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              required={${isRequired}}
              apiEndpoint="${entityEndpoint}"
              labelField="${labelField}"
              valueField="${valueField}"
              placeholder="Select ${label.replace(' Id', '')}"
            />
          </div>`;
        }

        // Check if this is a foreign key field (ends with _id) - needs dynamic options from API
        if (fieldName.endsWith('_id')) {
          // Extract entity name from field name (e.g., category_id -> categories, album_id -> albums)
          const baseEntityName = fieldName.replace('_id', '');
          // Pluralize: category -> categories, album -> albums
          const entityName = baseEntityName.endsWith('y')
            ? baseEntityName.slice(0, -1) + 'ies'
            : baseEntityName + 's';
          // For expense_categories special case
          const apiEntity = fieldName === 'category_id' ? 'expense_categories' : entityName;

          // Determine labelField based on entity type
          let labelField = 'name';
          if (fieldName === 'trainer_id' || fieldName === 'member_id' || fieldName === 'user_id') {
            labelField = 'first_name'; // For people entities that have first_name/last_name
          }

          return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label.replace(' Id', '')} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <DynamicSelect
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              required={${isRequired}}
              apiEndpoint="/${apiEntity}"
              labelField="${labelField}"
              valueField="id"
              placeholder="Select ${label.replace(' Id', '')}"
            />
          </div>`;
        }

        // Check if field has explicit options from catalog
        if (field.options && Array.isArray(field.options)) {
          const optionsHtml = field.options.map((opt: any) => {
            const value = typeof opt === 'string' ? opt : (opt.value || opt);
            const label = typeof opt === 'string' ? opt : (opt.label || opt.value || opt);
            return `<option value="${value}">${label}</option>`;
          }).join('\\n              ');

          return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <select
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              ${isRequired ? 'required' : ''}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select ${label}</option>
              ${optionsHtml}
            </select>
          </div>`;
        }

        // Generate static options based on field name pattern (fallback)
        let options: string[] = [];
        if (fieldName.includes('account_type')) {
          options = ['Checking', 'Savings', 'Credit Card', 'Investment'];
        } else if (fieldName.includes('currency')) {
          options = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'JPY'];
        } else if (fieldName.includes('frequency')) {
          options = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually'];
        } else if (fieldName.includes('payment_method') || fieldName.includes('payment')) {
          options = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Check', 'Other'];
        } else if (fieldName.includes('period')) {
          options = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
        } else if (fieldName.includes('status')) {
          options = ['Active', 'Inactive', 'Pending', 'Completed'];
        } else if (fieldName.includes('class_type')) {
          options = ['Yoga', 'HIIT', 'Cardio', 'Strength Training', 'Pilates', 'Spinning', 'CrossFit', 'Zumba', 'Boxing', 'Dance'];
        } else if (fieldName.includes('difficulty') || fieldName.includes('level')) {
          options = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
        } else if (fieldName.includes('category')) {
          options = ['General', 'Premium', 'VIP', 'Standard'];
        } else {
          options = ['Option 1', 'Option 2', 'Option 3'];
        }

        const optionsHtml = options.map(opt => `<option value="${opt.toLowerCase().replace(/\\s+/g, '_')}">${opt}</option>`).join('\\n              ');

        return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <select
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              ${isRequired ? 'required' : ''}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select ${label}</option>
              ${optionsHtml}
            </select>
          </div>`;
      } else if (fieldType === 'textarea') {
        return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <textarea
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              ${isRequired ? 'required' : ''}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>`;
      } else if (fieldType === 'image' || fieldType === 'file' || fieldType === 'video' || fieldType === 'audio') {
        // File upload fields with preview
        const acceptTypes = {
          image: 'image/*',
          video: 'video/*',
          audio: 'audio/*',
          file: '*/*'
        };
        // Use uploadConfig accept if provided, otherwise use default
        const accept = field.uploadConfig?.accept || acceptTypes[fieldType as keyof typeof acceptTypes] || '*/*';

        // Store uploadConfig as data attributes for use during upload
        const uploadConfig = field.uploadConfig || {};
        const dataAttrs = Object.entries(uploadConfig)
          .map(([key, value]) => `data-upload-${key.toLowerCase()}="${value}"`)
          .join(' ');

        return `
          <div key="${fieldName}" className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <FileInput
              name="${fieldName}"
              label="${label}"
              type="${fieldType}"
              accept="${accept}"
              required={${isRequired}}
              defaultValue={formData?.['${fieldName}'] || ''}
              ${dataAttrs}
            />
          </div>`;
      } else {
        // Default: text, email, url, etc.
        return `
          <div key="${fieldName}">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${label} ${isRequired ? '<span className="text-red-500">*</span>' : ''}
            </label>
            <input
              type="${fieldType === 'email' ? 'email' : fieldType === 'url' ? 'url' : 'text'}"
              name="${fieldName}"
              defaultValue={formData?.['${fieldName}'] || ''}
              ${isRequired ? 'required' : ''}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>`;
      }
    }).join('\n              ');
  };

  const variants = {
    card: `
${commonImports}

interface FormCardProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const FormCard: React.FC<FormCardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formData = propData || fetchedData || {};
  const isEdit = !!formData?.id;
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get API endpoint - use serverFunction route if defined, otherwise derive from current route
  // Note: api client automatically prepends /api/v1/
  const getApiBasePath = () => {
    // If serverFunction route is defined in catalog, use it
    ${serverFunctionRoute ? `const serverRoute = '${serverFunctionRoute}';
    if (serverRoute) return serverRoute;` : ''}

    // Otherwise derive from current route (e.g., /artist/tracks/:id/edit -> /artist/tracks)
    const path = location.pathname.replace(/\\/edit$/, '').replace(/\\/[^\\/]+$/, '');
    return path;
  };

    // API endpoint based on entity name
    const apiBasePath = '/${entityName}';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      // Check if form has file inputs - collect ALL file fields
      const fileFields: string[] = [];
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (value instanceof File && value.size > 0) {
          fileFields.push(key);
        }
      });
      const hasFiles = fileFields.length > 0;

      // Convert FormData to regular object
      const data: Record<string, any> = {};

      // Get field types from form inputs for proper type conversion
      const getFieldType = (fieldName: string): string | null => {
        const input = form.querySelector(\`[name="\${fieldName}"]\`) as HTMLInputElement;
        return input?.type || input?.getAttribute('data-type') || null;
      };

      for (const [key, value] of formData.entries()) {
        // Skip file fields - we'll upload them separately
        if (fileFields.includes(key)) continue;

        // Skip empty file inputs (File objects with size 0)
        if (value instanceof File && value.size === 0) continue;

        const fieldType = getFieldType(key);
        const strValue = String(value).trim();

        // Convert checkbox values to boolean
        if (value === 'on') {
          data[key] = true;
        }
        // Handle number fields - convert empty string to null
        else if (fieldType === 'number') {
          if (strValue === '') {
            data[key] = null;
          } else {
            // Parse as integer or float based on step attribute
            const input = form.querySelector(\`[name="\${key}"]\`) as HTMLInputElement;
            const step = input?.step;
            data[key] = (step && step !== '1') ? parseFloat(strValue) : parseInt(strValue, 10);
          }
        }
        // Handle date fields - convert empty string to null
        else if (fieldType === 'date' || fieldType === 'datetime-local') {
          data[key] = strValue === '' ? null : strValue;
        }
        // Handle text fields - keep empty string or trim
        else {
          data[key] = strValue === '' ? null : value;
        }
      }

      // If there are files, upload them first and get URLs
      if (hasFiles) {
        console.log('[Upload] File fields detected:', fileFields);
        for (const fieldName of fileFields) {
          const file = formData.get(fieldName) as File;
          console.log('[Upload] Processing field "' + fieldName + '":', file);
          if (file && file.size > 0) {
            // Get uploadConfig from field's data attributes
            const fieldElement = form.querySelector(\`[name="\${fieldName}"]\`);
            const bucket = fieldElement?.getAttribute('data-upload-bucket') || '${entityName}';
            const folder = fieldElement?.getAttribute('data-upload-folder') || '';
            console.log('[Upload] Uploading "' + fieldName + '" to bucket "' + bucket + '" with folder "' + folder + '"');

            // Upload file to storage
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('bucket', bucket);

            // Build path with folder if provided
            const fileName = \`\${Date.now()}-\${file.name}\`;
            const path = folder ? \`\${folder}/\${fileName}\` : fileName;
            uploadFormData.append('path', path);

            try {
              // Don't set Content-Type manually - browser will add boundary automatically
              const uploadResponse = await api.post<any>('/storage/upload', uploadFormData);

              // Store the returned URL in the data object
              data[fieldName] = uploadResponse.data?.url || uploadResponse.data?.path;
              console.log('[Upload] Successfully uploaded "' + fieldName + '":', data[fieldName]);
            } catch (uploadError) {
              console.error('[Upload] Failed to upload ' + fieldName + ':', uploadError);
              toast.error(\`Failed to upload \${fieldName}\`);
              throw uploadError;
            }
          } else {
            console.log('[Upload] Skipping "' + fieldName + '" - no file or size is 0');
          }
        }
        console.log('[Upload] Final data object:', data);
      }

      // Now submit the data with file URLs
      if (isEdit && id) {
        await api.patch<any>(\`/${entityName}/\${id}\`, data);
        toast.success('Updated successfully!');
      } else {
        const apiBasePath = getApiBasePath();
        await api.post<any>(apiBasePath, data);
        toast.success('Created successfully!');
      }

      navigate(-1); // Go back to previous page
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("max-w-3xl mx-auto p-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">${formTitle}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{isEdit ? 'Update the information below' : 'Fill in the form below'}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateFormFields()}
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormCard;
    `,

    modern: `
${commonImports}

interface FormModernProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const FormModern: React.FC<FormModernProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>(propData || {});
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!id;

  // Get API endpoint - use serverFunction route if defined, otherwise derive from current route
  // Note: api client automatically prepends /api/v1/
  const getApiBasePath = () => {
    // If serverFunction route is defined in catalog, use it
    ${serverFunctionRoute ? `const serverRoute = '${serverFunctionRoute}';
    if (serverRoute) return serverRoute;` : ''}

    // Otherwise derive from current route (e.g., /artist/tracks/:id/edit -> /artist/tracks)
    const path = location.pathname.replace(/\\/edit$/, '').replace(/\\/[^\\/]+$/, '');
    return path;
  };

  // Fetch data for edit mode
  useEffect(() => {
    const fetchData = async () => {
      if (isEdit && id) {
        setIsLoading(true);
        try {
          // Use entity name directly instead of derived path
          const response = await api.get<any>(\`/${entityName}/\${id}\`);
          setFormData(response.data || response);
        } catch (error) {
          console.error('Failed to fetch data:', error);
          toast.error('Failed to load data');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [id, isEdit]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      // Check if form has file inputs - collect ALL file fields
      const fileFields: string[] = [];
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (value instanceof File && value.size > 0) {
          fileFields.push(key);
        }
      });
      const hasFiles = fileFields.length > 0;

      // Convert FormData to regular object
      const data: Record<string, any> = {};

      // Get field types from form inputs for proper type conversion
      const getFieldType = (fieldName: string): string | null => {
        const input = form.querySelector(\`[name="\${fieldName}"]\`) as HTMLInputElement;
        return input?.type || input?.getAttribute('data-type') || null;
      };

      for (const [key, value] of formData.entries()) {
        // Skip file fields - we'll upload them separately
        if (fileFields.includes(key)) continue;

        // Skip empty file inputs (File objects with size 0)
        if (value instanceof File && value.size === 0) continue;

        const fieldType = getFieldType(key);
        const strValue = String(value).trim();

        // Convert checkbox values to boolean
        if (value === 'on') {
          data[key] = true;
        }
        // Handle number fields - convert empty string to null
        else if (fieldType === 'number') {
          if (strValue === '') {
            data[key] = null;
          } else {
            // Parse as integer or float based on step attribute
            const input = form.querySelector(\`[name="\${key}"]\`) as HTMLInputElement;
            const step = input?.step;
            data[key] = (step && step !== '1') ? parseFloat(strValue) : parseInt(strValue, 10);
          }
        }
        // Handle date fields - convert empty string to null
        else if (fieldType === 'date' || fieldType === 'datetime-local') {
          data[key] = strValue === '' ? null : strValue;
        }
        // Handle text fields - keep empty string or trim
        else {
          data[key] = strValue === '' ? null : value;
        }
      }

      // If there are files, upload them first and get URLs
      if (hasFiles) {
        console.log('[Upload] File fields detected:', fileFields);
        for (const fieldName of fileFields) {
          const file = formData.get(fieldName) as File;
          console.log('[Upload] Processing field "' + fieldName + '":', file);
          if (file && file.size > 0) {
            // Get uploadConfig from field's data attributes
            const fieldElement = form.querySelector(\`[name="\${fieldName}"]\`);
            const bucket = fieldElement?.getAttribute('data-upload-bucket') || '${entityName}';
            const folder = fieldElement?.getAttribute('data-upload-folder') || '';
            console.log('[Upload] Uploading "' + fieldName + '" to bucket "' + bucket + '" with folder "' + folder + '"');

            // Upload file to storage
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('bucket', bucket);

            // Build path with folder if provided
            const fileName = \`\${Date.now()}-\${file.name}\`;
            const path = folder ? \`\${folder}/\${fileName}\` : fileName;
            uploadFormData.append('path', path);

            try {
              // Don't set Content-Type manually - browser will add boundary automatically
              const uploadResponse = await api.post<any>('/storage/upload', uploadFormData);

              // Store the returned URL in the data object
              data[fieldName] = uploadResponse.data?.url || uploadResponse.data?.path;
              console.log('[Upload] Successfully uploaded "' + fieldName + '":', data[fieldName]);
            } catch (uploadError) {
              console.error('[Upload] Failed to upload ' + fieldName + ':', uploadError);
              toast.error(\`Failed to upload \${fieldName}\`);
              throw uploadError;
            }
          } else {
            console.log('[Upload] Skipping "' + fieldName + '" - no file or size is 0');
          }
        }
        console.log('[Upload] Final data object:', data);
      }

      // Now submit the data with file URLs
      if (isEdit && id) {
        await api.patch<any>(\`/${entityName}/\${id}\`, data);
        toast.success('Updated successfully!');
      } else {
        const apiBasePath = getApiBasePath();
        await api.post<any>(apiBasePath, data);
        toast.success('Created successfully!');
      }

      navigate(-1); // Go back to previous page
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("max-w-3xl mx-auto p-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">${formTitle}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{isEdit ? 'Update the information below' : 'Fill in the form below'}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateFormFields()}
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormModern;
    `,

    minimal: `
${commonImports}

interface FormMinimalProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const FormMinimal: React.FC<FormMinimalProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formData = propData || fetchedData || {};
  const isEdit = !!formData?.id;
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get API endpoint - use serverFunction route if defined, otherwise derive from current route
  // Note: api client automatically prepends /api/v1/
  const getApiBasePath = () => {
    // If serverFunction route is defined in catalog, use it
    ${serverFunctionRoute ? `const serverRoute = '${serverFunctionRoute}';
    if (serverRoute) return serverRoute;` : ''}

    // Otherwise derive from current route (e.g., /artist/tracks/:id/edit -> /artist/tracks)
    const path = location.pathname.replace(/\\/edit$/, '').replace(/\\/[^\\/]+$/, '');
    return path;
  };

    // API endpoint based on entity name
    const apiBasePath = '/${entityName}';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      // Check if form has file inputs - collect ALL file fields
      const fileFields: string[] = [];
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (value instanceof File && value.size > 0) {
          fileFields.push(key);
        }
      });
      const hasFiles = fileFields.length > 0;

      // Convert FormData to regular object
      const data: Record<string, any> = {};

      // Get field types from form inputs for proper type conversion
      const getFieldType = (fieldName: string): string | null => {
        const input = form.querySelector(\`[name="\${fieldName}"]\`) as HTMLInputElement;
        return input?.type || input?.getAttribute('data-type') || null;
      };

      for (const [key, value] of formData.entries()) {
        // Skip file fields - we'll upload them separately
        if (fileFields.includes(key)) continue;

        // Skip empty file inputs (File objects with size 0)
        if (value instanceof File && value.size === 0) continue;

        const fieldType = getFieldType(key);
        const strValue = String(value).trim();

        // Convert checkbox values to boolean
        if (value === 'on') {
          data[key] = true;
        }
        // Handle number fields - convert empty string to null
        else if (fieldType === 'number') {
          if (strValue === '') {
            data[key] = null;
          } else {
            // Parse as integer or float based on step attribute
            const input = form.querySelector(\`[name="\${key}"]\`) as HTMLInputElement;
            const step = input?.step;
            data[key] = (step && step !== '1') ? parseFloat(strValue) : parseInt(strValue, 10);
          }
        }
        // Handle date fields - convert empty string to null
        else if (fieldType === 'date' || fieldType === 'datetime-local') {
          data[key] = strValue === '' ? null : strValue;
        }
        // Handle text fields - keep empty string or trim
        else {
          data[key] = strValue === '' ? null : value;
        }
      }

      // If there are files, upload them first and get URLs
      if (hasFiles) {
        console.log('[Upload] File fields detected:', fileFields);
        for (const fieldName of fileFields) {
          const file = formData.get(fieldName) as File;
          console.log('[Upload] Processing field "' + fieldName + '":', file);
          if (file && file.size > 0) {
            // Get uploadConfig from field's data attributes
            const fieldElement = form.querySelector(\`[name="\${fieldName}"]\`);
            const bucket = fieldElement?.getAttribute('data-upload-bucket') || '${entityName}';
            const folder = fieldElement?.getAttribute('data-upload-folder') || '';
            console.log('[Upload] Uploading "' + fieldName + '" to bucket "' + bucket + '" with folder "' + folder + '"');

            // Upload file to storage
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('bucket', bucket);

            // Build path with folder if provided
            const fileName = \`\${Date.now()}-\${file.name}\`;
            const path = folder ? \`\${folder}/\${fileName}\` : fileName;
            uploadFormData.append('path', path);

            try {
              // Don't set Content-Type manually - browser will add boundary automatically
              const uploadResponse = await api.post<any>('/storage/upload', uploadFormData);

              // Store the returned URL in the data object
              data[fieldName] = uploadResponse.data?.url || uploadResponse.data?.path;
              console.log('[Upload] Successfully uploaded "' + fieldName + '":', data[fieldName]);
            } catch (uploadError) {
              console.error('[Upload] Failed to upload ' + fieldName + ':', uploadError);
              toast.error(\`Failed to upload \${fieldName}\`);
              throw uploadError;
            }
          } else {
            console.log('[Upload] Skipping "' + fieldName + '" - no file or size is 0');
          }
        }
        console.log('[Upload] Final data object:', data);
      }

      // Now submit the data with file URLs
      if (isEdit && id) {
        await api.patch<any>(\`/${entityName}/\${id}\`, data);
        toast.success('Updated successfully!');
      } else {
        const apiBasePath = getApiBasePath();
        await api.post<any>(apiBasePath, data);
        toast.success('Created successfully!');
      }

      navigate(-1); // Go back to previous page
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("max-w-3xl mx-auto p-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">${formTitle}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{isEdit ? 'Update the information below' : 'Fill in the form below'}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          ${generateFormFields()}
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormMinimal;
    `
  };

  return variants[variant] || variants.modern;
};
