import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFormFieldEmail = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withValidation' | 'multiple' = 'basic'
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
import { Mail, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface FormFieldEmailBasicProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const FormFieldEmailBasic: React.FC<FormFieldEmailBasicProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onChange }) => {
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
  const helpText = ${getField('helpText')};
  const required = ${getField('required')};

  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (error && validateEmail(newValue)) setError('');
    if (onChange) onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    if (required && !value.trim()) {
      setError('Email is required');
    } else if (value && !validateEmail(value)) {
      setError('Please enter a valid email address');
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all \${
          error && touched
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
        }\`}
      />

      {helpText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}

      {error && touched && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormFieldEmailBasic;
    `,

    withValidation: `
${commonImports}

interface FormFieldEmailWithValidationProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (value: string, isValid: boolean) => void;
}

const FormFieldEmailWithValidation: React.FC<FormFieldEmailWithValidationProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onChange }) => {
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
  const required = ${getField('required')};

  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsVerified(false);

    if (error && validateEmail(newValue)) setError('');

    const isValid = validateEmail(newValue);
    if (onChange) onChange(newValue, isValid);
  };

  const handleBlur = async () => {
    setTouched(true);

    if (required && !value.trim()) {
      setError('Email is required');
      return;
    }

    if (value && !validateEmail(value)) {
      setError('Invalid email format');
      return;
    }

    if (value && validateEmail(value)) {
      setIsValidating(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsValidating(false);
      setIsVerified(true);
    }
  };

  const isValid = value && validateEmail(value) && !error;

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Mail className={\`h-5 w-5 \${error && touched ? 'text-red-500' : 'text-gray-400'}\`} />
        </div>

        <input
          type="email"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={\`w-full pl-11 pr-11 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all \${
            error && touched
              ? 'border-red-500 focus:ring-red-500'
              : isVerified
              ? 'border-green-500 focus:ring-green-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          }\`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValidating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
          ) : isVerified ? (
            <div className="flex items-center gap-1">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Verified</span>
            </div>
          ) : error && touched ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : null}
        </div>
      </div>

      {error && touched && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {isVerified && (
        <p className="mt-1.5 text-sm text-green-600 dark:text-green-400">
          Email verified successfully
        </p>
      )}
    </div>
  );
};

export default FormFieldEmailWithValidation;
    `,

    multiple: `
${commonImports}

interface FormFieldEmailMultipleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (emails: string[]) => void;
}

const FormFieldEmailMultiple: React.FC<FormFieldEmailMultipleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onChange }) => {
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

  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addEmail();
    } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      removeEmail(emails.length - 1);
    }
  };

  const addEmail = () => {
    const trimmed = inputValue.trim().replace(/,$/g, '');

    if (!trimmed) return;

    if (!validateEmail(trimmed)) {
      setError('Invalid email format');
      return;
    }

    if (emails.includes(trimmed)) {
      setError('Email already added');
      return;
    }

    const newEmails = [...emails, trimmed];
    setEmails(newEmails);
    setInputValue('');
    setError('');

    if (onChange) onChange(newEmails);
  };

  const removeEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
    if (onChange) onChange(newEmails);
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addEmail();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <div className={\`min-h-[42px] px-2 py-1.5 border rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 transition-all \${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      }\`}>
        <div className="flex flex-wrap gap-2">
          {emails.map((email, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-sm"
            >
              <Mail className="h-3 w-3" />
              <span>{email}</span>
              <button
                type="button"
                onClick={() => removeEmail(index)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={emails.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[200px] px-2 py-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        Press Enter, comma, or space to add multiple emails
      </p>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {emails.length > 0 && (
        <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
          {emails.length} email{emails.length !== 1 ? 's' : ''} added
        </p>
      )}
    </div>
  );
};

export default FormFieldEmailMultiple;
    `
  };

  return variants[variant] || variants.basic;
};
