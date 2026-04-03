import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFormFieldText = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withIcon' | 'withCounter' = 'basic'
) => {
  const dataSource = resolved.dataSource;

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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface FormFieldTextBasicProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

const FormFieldTextBasic: React.FC<FormFieldTextBasicProps> = ({
  ${dataName},
  className,
  onChange,
  onBlur,
  onFocus
}) => {
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

  const fieldData = propData || fetchedData || {};

  const label = ${getField('label')};
  const placeholder = ${getField('placeholder')};
  const initialValue = ${getField('value')};
  const helpText = ${getField('helpText')};
  const required = ${getField('required')};
  const disabled = ${getField('disabled')};
  const readOnly = ${getField('readOnly')};

  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (error && newValue.trim()) {
      setError('');
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);

    if (required && !value.trim()) {
      setError('This field is required');
    }

    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={label}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? "error-message" : helpText ? "help-text" : undefined}
        className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all \${
          error && touched
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
        } \${disabled ? 'opacity-50 cursor-not-allowed' : ''} \${readOnly ? 'bg-gray-50 dark:bg-gray-900' : ''}\`}
      />

      {helpText && !error && (
        <p id="help-text" className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {error && touched && (
        <p id="error-message" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormFieldTextBasic;
    `,

    withIcon: `
${commonImports}

interface FormFieldTextWithIconProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const FormFieldTextWithIcon: React.FC<FormFieldTextWithIconProps> = ({
  ${dataName},
  className,
  onChange
}) => {
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

  const fieldData = propData || fetchedData || {};

  const label = ${getField('label')};
  const placeholder = ${getField('placeholder')};
  const initialValue = ${getField('value')};
  const helpText = ${getField('helpText')};
  const prefixIcon = ${getField('prefixIcon')};
  const suffixIcon = ${getField('suffixIcon')};
  const required = ${getField('required')};

  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (error && newValue.trim()) {
      setError('');
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setIsFocused(false);

    if (required && !value.trim()) {
      setError('This field is required');
    }
  };

  const isValid = value.trim().length > 0 && !error;

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* Prefix Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <User className={\`h-5 w-5 transition-colors \${
            isFocused
              ? 'text-blue-600 dark:text-blue-400'
              : error && touched
              ? 'text-red-500'
              : 'text-gray-400'
          }\`} />
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          className={\`w-full pl-11 pr-11 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all \${
            error && touched
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
          }\`}
        />

        {/* Suffix Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : error && touched ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : null}
        </div>
      </div>

      {helpText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {error && touched && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormFieldTextWithIcon;
    `,

    withCounter: `
${commonImports}

interface FormFieldTextWithCounterProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const FormFieldTextWithCounter: React.FC<FormFieldTextWithCounterProps> = ({
  ${dataName},
  className,
  onChange
}) => {
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

  const fieldData = propData || fetchedData || {};

  const label = ${getField('label')};
  const placeholder = ${getField('placeholder')};
  const initialValue = ${getField('value')};
  const helpText = ${getField('helpText')};
  const maxLength = ${getField('maxLength')};
  const required = ${getField('required')};

  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const characterCount = value.length;
  const remainingChars = maxLength - characterCount;
  const isNearLimit = remainingChars <= 20;
  const isAtLimit = remainingChars === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue.length <= maxLength) {
      setValue(newValue);

      if (error && newValue.trim()) {
        setError('');
      }

      if (onChange) {
        onChange(newValue);
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);

    if (required && !value.trim()) {
      setError('This field is required');
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <span className={\`text-xs font-medium transition-colors \${
          isAtLimit
            ? 'text-red-600 dark:text-red-400'
            : isNearLimit
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-gray-500 dark:text-gray-400'
        }\`}>
          {characterCount} / {maxLength}
        </span>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all \${
            error && touched
              ? 'border-red-500 focus:ring-red-500'
              : isAtLimit
              ? 'border-yellow-500 focus:ring-yellow-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
          }\`}
        />

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div
            className={\`h-full transition-all duration-300 \${
              isAtLimit
                ? 'bg-red-600'
                : isNearLimit
                ? 'bg-yellow-600'
                : 'bg-blue-600'
            }\`}
            style={{ width: \`\${(characterCount / maxLength) * 100}%\` }}
          />
        </div>
      </div>

      {helpText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {error && touched && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {isNearLimit && !isAtLimit && (
        <p className="mt-1.5 text-sm text-yellow-600 dark:text-yellow-400">
          {remainingChars} characters remaining
        </p>
      )}

      {isAtLimit && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          Character limit reached
        </p>
      )}
    </div>
  );
};

export default FormFieldTextWithCounter;
    `
  };

  return variants[variant] || variants.basic;
};
