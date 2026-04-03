import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFormValidationMessages = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'tooltip' | 'summary' = 'inline'
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
import { AlertCircle, CheckCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    inline: `
${commonImports}

interface FormValidationInlineProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

interface FieldError {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
}

const FormValidationInline: React.FC<FormValidationInlineProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: ''
  });
  const [errors, setErrors] = useState<Record<string, FieldError | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const validationData = propData || fetchedData || {};

  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const ageLabel = ${getField('ageLabel')};
  const agePlaceholder = ${getField('agePlaceholder')};
  const errorMessages = ${getField('errorMessages')};
  const successMessages = ${getField('successMessages')};
  const warningMessages = ${getField('warningMessages')};
  const infoMessages = ${getField('infoMessages')};
  const submitButton = ${getField('submitButton')};
  const resetButton = ${getField('resetButton')};

  const validateField = (name: string, value: string): FieldError | null => {
    switch (name) {
      case 'name':
        if (!value) return { type: 'error', message: errorMessages.nameRequired };
        if (value.length < 3) return { type: 'error', message: errorMessages.nameMinLength };
        return { type: 'success', message: successMessages.nameValid };

      case 'email':
        if (!value) return { type: 'error', message: errorMessages.emailRequired };
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value)) return { type: 'error', message: errorMessages.emailInvalid };
        if (value.includes('@gmail.com') || value.includes('@yahoo.com')) {
          return { type: 'warning', message: warningMessages.emailCommon };
        }
        return { type: 'success', message: successMessages.emailValid };

      case 'password':
        if (!value) return { type: 'error', message: errorMessages.passwordRequired };
        if (value.length < 8) return { type: 'error', message: errorMessages.passwordMinLength };
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        if (!hasUpper || !hasLower || !hasNumber) {
          return { type: 'error', message: errorMessages.passwordWeak };
        }
        const hasSpecial = /[!@#$%^&*]/.test(value);
        if (!hasSpecial) return { type: 'warning', message: warningMessages.passwordModerate };
        return { type: 'success', message: successMessages.passwordValid };

      case 'phone':
        if (!value) return { type: 'info', message: infoMessages.phoneFormat };
        const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
        if (!phoneRegex.test(value.replace(/[\\s()-]/g, ''))) {
          return { type: 'error', message: errorMessages.phoneInvalid };
        }
        return { type: 'success', message: successMessages.phoneValid };

      case 'age':
        if (!value) return { type: 'error', message: errorMessages.ageRequired };
        const age = parseInt(value);
        if (isNaN(age) || age < 18) return { type: 'error', message: errorMessages.ageMin };
        if (age > 120) return { type: 'error', message: errorMessages.ageMax };
        if (age === 18) return { type: 'warning', message: warningMessages.ageNearLimit };
        return { type: 'success', message: successMessages.ageValid };

      default:
        return null;
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name as keyof typeof formData]) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, FieldError | null> = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key as keyof typeof formData]);
    });
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    const hasErrors = Object.values(newErrors).some(error => error?.type === 'error');
    if (!hasErrors) {
      console.log('Form submitted:', formData);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const error = errors[fieldName];
    if (!error || !touched[fieldName]) {
      return 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500';
    }
    switch (error.type) {
      case 'error':
        return 'border-red-500 focus:ring-red-500 focus:border-red-500';
      case 'success':
        return 'border-green-500 focus:ring-green-500 focus:border-green-500';
      case 'warning':
        return 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500';
      case 'info':
        return 'border-blue-500 focus:ring-blue-500 focus:border-blue-500';
      default:
        return 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500';
    }
  };

  const renderMessage = (fieldName: string) => {
    const error = errors[fieldName];
    if (!error || !touched[fieldName]) return null;

    const icons = {
      error: <AlertCircle className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />
    };

    const colors = {
      error: 'text-red-600 dark:text-red-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400'
    };

    return (
      <div className={\`flex items-center gap-2 mt-1 text-sm \${colors[error.type]}\`}>
        {icons[error.type]}
        <span>{error.message}</span>
      </div>
    );
  };

  return (
    <div className={cn("max-w-2xl mx-auto p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Form with Inline Validation
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {nameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder={namePlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors \${getInputClassName('name')}\`}
          />
          {renderMessage('name')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {emailLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder={emailPlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors \${getInputClassName('email')}\`}
          />
          {renderMessage('email')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {passwordLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder={passwordPlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors \${getInputClassName('password')}\`}
          />
          {renderMessage('password')}
          {!touched.password && (
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <Info className="h-4 w-4" />
              <span>{infoMessages.passwordRequirements}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {phoneLabel}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder={phonePlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors \${getInputClassName('phone')}\`}
          />
          {renderMessage('phone')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {ageLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            onBlur={() => handleBlur('age')}
            placeholder={agePlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-colors \${getInputClassName('age')}\`}
          />
          {renderMessage('age')}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {submitButton}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', email: '', password: '', phone: '', age: '' });
              setErrors({});
              setTouched({});
            }}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
          >
            {resetButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormValidationInline;
    `,

    tooltip: `
${commonImports}

interface FormValidationTooltipProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

interface FieldError {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
}

const FormValidationTooltip: React.FC<FormValidationTooltipProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    website: ''
  });
  const [errors, setErrors] = useState<Record<string, FieldError | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const validationData = propData || fetchedData || {};

  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const websiteLabel = ${getField('websiteLabel')};
  const websitePlaceholder = ${getField('websitePlaceholder')};
  const errorMessages = ${getField('errorMessages')};
  const successMessages = ${getField('successMessages')};
  const submitButton = ${getField('submitButton')};

  const validateField = (name: string, value: string): FieldError | null => {
    switch (name) {
      case 'name':
        if (!value) return { type: 'error', message: errorMessages.nameRequired };
        if (value.length < 3) return { type: 'error', message: errorMessages.nameMinLength };
        return { type: 'success', message: successMessages.nameValid };

      case 'email':
        if (!value) return { type: 'error', message: errorMessages.emailRequired };
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value)) return { type: 'error', message: errorMessages.emailInvalid };
        return { type: 'success', message: successMessages.emailValid };

      case 'password':
        if (!value) return { type: 'error', message: errorMessages.passwordRequired };
        if (value.length < 8) return { type: 'error', message: errorMessages.passwordMinLength };
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        if (!hasUpper || !hasLower || !hasNumber) {
          return { type: 'error', message: errorMessages.passwordWeak };
        }
        return { type: 'success', message: successMessages.passwordValid };

      case 'website':
        if (!value) return null;
        const urlRegex = /^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b/;
        if (!urlRegex.test(value)) return { type: 'error', message: errorMessages.websiteInvalid };
        return { type: 'success', message: successMessages.websiteValid };

      default:
        return null;
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setFocusedField(null);
  };

  const handleFocus = (name: string) => {
    setFocusedField(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, FieldError | null> = {};
    Object.keys(formData).forEach(key => {
      newErrors[key] = validateField(key, formData[key as keyof typeof formData]);
    });
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error?.type === 'error');
    if (!hasErrors) {
      console.log('Form submitted:', formData);
    }
  };

  const renderTooltip = (fieldName: string) => {
    const error = errors[fieldName];
    const shouldShow = focusedField === fieldName && error;

    if (!shouldShow) return null;

    const bgColors = {
      error: 'bg-red-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    const icons = {
      error: <AlertCircle className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />
    };

    return (
      <div className="absolute left-0 -top-12 z-10 animate-fade-in">
        <div className={\`\${bgColors[error.type]} text-white text-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap\`}>
          {icons[error.type]}
          <span>{error.message}</span>
        </div>
        <div className={\`w-3 h-3 \${bgColors[error.type]} transform rotate-45 absolute left-4 -bottom-1.5\`} />
      </div>
    );
  };

  const getInputBorderColor = (fieldName: string) => {
    const error = errors[fieldName];
    if (!error || !touched[fieldName]) return 'border-gray-300 dark:border-gray-600';

    const colors = {
      error: 'border-red-500',
      success: 'border-green-500',
      warning: 'border-yellow-500',
      info: 'border-blue-500'
    };
    return colors[error.type];
  };

  return (
    <div className={cn("max-w-2xl mx-auto p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Form with Tooltip Validation
        </h3>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {nameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            onFocus={() => handleFocus('name')}
            placeholder={namePlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors \${getInputBorderColor('name')}\`}
          />
          {renderTooltip('name')}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {emailLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            onFocus={() => handleFocus('email')}
            placeholder={emailPlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors \${getInputBorderColor('email')}\`}
          />
          {renderTooltip('email')}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {passwordLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            onFocus={() => handleFocus('password')}
            placeholder={passwordPlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors \${getInputBorderColor('password')}\`}
          />
          {renderTooltip('password')}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {websiteLabel}
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            onBlur={() => handleBlur('website')}
            onFocus={() => handleFocus('website')}
            placeholder={websitePlaceholder}
            className={\`w-full px-4 py-2 border-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors \${getInputBorderColor('website')}\`}
          />
          {renderTooltip('website')}
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          {submitButton}
        </button>
      </form>

      <style>{\`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      \`}</style>
    </div>
  );
};

export default FormValidationTooltip;
    `,

    summary: `
${commonImports}

interface FormValidationSummaryProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

interface FieldError {
  field: string;
  label: string;
  message: string;
}

const FormValidationSummary: React.FC<FormValidationSummaryProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: ''
  });
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [isValid, setIsValid] = useState(false);

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

  const validationData = propData || fetchedData || {};

  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const ageLabel = ${getField('ageLabel')};
  const agePlaceholder = ${getField('agePlaceholder')};
  const errorMessages = ${getField('errorMessages')};
  const submitButton = ${getField('submitButton')};
  const summaryTitle = ${getField('summaryTitle')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const validateForm = () => {
    const newErrors: FieldError[] = [];

    if (!formData.name) {
      newErrors.push({ field: 'name', label: nameLabel, message: errorMessages.nameRequired });
    } else if (formData.name.length < 3) {
      newErrors.push({ field: 'name', label: nameLabel, message: errorMessages.nameMinLength });
    }

    if (!formData.email) {
      newErrors.push({ field: 'email', label: emailLabel, message: errorMessages.emailRequired });
    } else {
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.push({ field: 'email', label: emailLabel, message: errorMessages.emailInvalid });
      }
    }

    if (!formData.password) {
      newErrors.push({ field: 'password', label: passwordLabel, message: errorMessages.passwordRequired });
    } else if (formData.password.length < 8) {
      newErrors.push({ field: 'password', label: passwordLabel, message: errorMessages.passwordMinLength });
    } else {
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasLower = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      if (!hasUpper || !hasLower || !hasNumber) {
        newErrors.push({ field: 'password', label: passwordLabel, message: errorMessages.passwordWeak });
      }
    }

    if (formData.phone) {
      const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\\s()-]/g, ''))) {
        newErrors.push({ field: 'phone', label: phoneLabel, message: errorMessages.phoneInvalid });
      }
    }

    if (!formData.age) {
      newErrors.push({ field: 'age', label: ageLabel, message: errorMessages.ageRequired });
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18) {
        newErrors.push({ field: 'age', label: ageLabel, message: errorMessages.ageMin });
      } else if (age > 120) {
        newErrors.push({ field: 'age', label: ageLabel, message: errorMessages.ageMax });
      }
    }

    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
    return newErrors.length === 0;
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
    }
  };

  const scrollToField = (fieldName: string) => {
    const element = document.getElementById(fieldName);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.focus();
  };

  return (
    <div className={cn("max-w-2xl mx-auto p-6", className)}>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Form with Summary Validation
      </h3>

      {/* Validation Summary */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 dark:text-red-100 mb-2">
                {summaryTitle}
              </h4>
              <ul className="space-y-2">
                {errors.map((error, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => scrollToField(error.field)}
                      className="text-sm text-red-700 dark:text-red-300 hover:underline text-left"
                    >
                      • <strong>{error.label}:</strong> {error.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Summary */}
      {isValid && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">
                {successTitle}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {nameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={namePlaceholder}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {emailLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder={emailPlaceholder}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {passwordLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={passwordPlaceholder}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {phoneLabel}
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder={phonePlaceholder}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {ageLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder={agePlaceholder}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          {submitButton}
        </button>
      </form>
    </div>
  );
};

export default FormValidationSummary;
    `
  };

  return variants[variant] || variants.inline;
};
