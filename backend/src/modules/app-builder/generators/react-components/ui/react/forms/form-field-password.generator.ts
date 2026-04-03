import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFormFieldPassword = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withStrength' | 'withGenerator' = 'basic'
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
import { Eye, EyeOff, Lock, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface FormFieldPasswordBasicProps {
  \${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const FormFieldPasswordBasic: React.FC<FormFieldPasswordBasicProps> = ({ \${dataName}: propData, entity = '\${dataSource || 'data'}', className, onChange }) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\\\`\${apiRoute}\\\`),
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
  const label = \${getField('label')};
  const placeholder = \${getField('placeholder')};
  const helpText = \${getField('helpText')};
  const required = \${getField('required')};

  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (error && newValue.length >= 8) setError('');
    if (onChange) onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    if (required && !value) {
      setError('Password is required');
    } else if (value && value.length < 8) {
      setError('Password must be at least 8 characters');
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={\`w-full px-4 py-2.5 pr-11 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all \${
            error && touched
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
          }\`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {helpText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}

      {error && touched && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormFieldPasswordBasic;
    `,

    withStrength: `
${commonImports}

interface FormFieldPasswordWithStrengthProps {
  \${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (value: string, strength: number) => void;
}

const FormFieldPasswordWithStrength: React.FC<FormFieldPasswordWithStrengthProps> = ({ \${dataName}: propData, entity = '\${dataSource || 'data'}', className, onChange }) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\\\`\${apiRoute}\\\`),
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
  const label = \${getField('label')};
  const placeholder = \${getField('placeholder')};
  const requirementsText = \${getField('requirementsText')};
  const requirements = \${getField('requirements')};

  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const checkRequirement = (requirement: string, password: string): boolean => {
    if (requirement.includes('8 characters')) return password.length >= 8;
    if (requirement.includes('uppercase')) return /[A-Z]/.test(password);
    if (requirement.includes('lowercase')) return /[a-z]/.test(password);
    if (requirement.includes('number')) return /[0-9]/.test(password);
    if (requirement.includes('special')) return /[^a-zA-Z0-9]/.test(password);
    return false;
  };

  const strength = calculateStrength(value);
  const strengthPercentage = (strength / 5) * 100;
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength - 1] || 'Too Short';
  const strengthColor = ['bg-red-600', 'bg-orange-600', 'bg-yellow-600', 'bg-green-600', 'bg-emerald-600'][strength - 1] || 'bg-gray-300';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChange) onChange(newValue, strength);
  };

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {value && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Password strength:</span>
            <span className={\`text-xs font-medium \${strengthColor.replace('bg-', 'text-')}\`}>{strengthText}</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={\`h-full transition-all duration-300 \${strengthColor}\`}
              style={{ width: \`\${strengthPercentage}%\` }}
            />
          </div>

          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{requirementsText}</p>
            {requirements.map((req: string, idx: number) => {
              const isMet = checkRequirement(req, value);
              return (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {isMet ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={\`\${isMet ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}\`}>
                    {req}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormFieldPasswordWithStrength;
    `,

    withGenerator: `
${commonImports}

interface FormFieldPasswordWithGeneratorProps {
  \${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const FormFieldPasswordWithGenerator: React.FC<FormFieldPasswordWithGeneratorProps> = ({ \${dataName}: propData, entity = '\${dataSource || 'data'}', className, onChange }) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\\\`\${apiRoute}\\\`),
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
  const label = \${getField('label')};
  const placeholder = \${getField('placeholder')};

  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [passwordLength, setPasswordLength] = useState(16);

  const generatePassword = () => {
    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (chars === '') chars = 'abcdefghijklmnopqrstuvwxyz';

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setValue(password);
    if (onChange) onChange(password);
  };

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="button"
            onClick={generatePassword}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Generate password"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Generator Options</p>

        <div>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Length: {passwordLength}</span>
            <input
              type="range"
              min="8"
              max="32"
              value={passwordLength}
              onChange={(e) => setPasswordLength(Number(e.target.value))}
              className="w-32 accent-blue-600"
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase (A-Z)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Lowercase (a-z)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Symbols (!@#$%...)</span>
          </label>
        </div>

        <button
          type="button"
          onClick={generatePassword}
          className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Generate Password
        </button>
      </div>
    </div>
  );
};

export default FormFieldPasswordWithGenerator;
    `
  };

  return variants[variant] || variants.basic;
};
