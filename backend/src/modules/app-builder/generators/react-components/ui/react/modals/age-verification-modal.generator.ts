import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAgeVerificationModal = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'dateInput' | 'checkbox' = 'simple'
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
  const entity = dataSource?.split('.').pop() || 'data';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    simple: `
${commonImports}
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface SimpleAgeVerificationProps {
  ${dataName}?: any;
  className?: string;
  rememberChoice?: boolean;
  redirectUrl?: string;
  onConfirm?: () => void;
  onDecline?: () => void;
}

const SimpleAgeVerification: React.FC<SimpleAgeVerificationProps> = ({
  ${dataName}: propData,
  className,
  rememberChoice: propRememberChoice,
  redirectUrl: propRedirectUrl,
  onConfirm,
  onDecline
}) => {
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
  const [isVisible, setIsVisible] = useState(true);

  const verificationData = ${dataName} || {};

  const rememberChoice = propRememberChoice ?? ${getField('rememberChoice')};
  const redirectUrl = propRedirectUrl ?? ${getField('redirectUrl')};
  const title = ${getField('simpleTitle')};
  const message = ${getField('simpleMessage')};
  const confirmText = ${getField('simpleConfirmText')};
  const declineText = ${getField('simpleDeclineText')};
  const legalDisclaimer = ${getField('legalDisclaimer')};

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (verified === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (isLoading && !propData) {
    return (
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80", className)}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    if (rememberChoice) {
      localStorage.setItem('age-verified', 'true');
    }
    setIsVisible(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline();
    } else {
      window.location.href = redirectUrl;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80", className)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
          <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
          {message}
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {confirmText}
          </button>

          <button
            onClick={handleDecline}
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {declineText}
          </button>
        </div>

        {legalDisclaimer && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{legalDisclaimer}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SimpleAgeVerification;
    `,

    dateInput: `
${commonImports}
import { Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

interface DateInputAgeVerificationProps {
  ${dataName}?: any;
  className?: string;
  rememberChoice?: boolean;
  redirectUrl?: string;
  minAge?: number;
  onVerified?: () => void;
  onFailed?: () => void;
}

const DateInputAgeVerification: React.FC<DateInputAgeVerificationProps> = ({
  ${dataName}: propData,
  className,
  rememberChoice: propRememberChoice,
  redirectUrl: propRedirectUrl,
  minAge: propMinAge,
  onVerified,
  onFailed
}) => {
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
  const [isVisible, setIsVisible] = useState(true);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');

  const verificationData = ${dataName} || {};

  const rememberChoice = propRememberChoice ?? ${getField('rememberChoice')};
  const redirectUrl = propRedirectUrl ?? ${getField('redirectUrl')};
  const minAge = propMinAge ?? ${getField('dateInputMinAge')};
  const title = ${getField('dateInputTitle')};
  const message = ${getField('dateInputMessage')};
  const placeholder = ${getField('dateInputPlaceholder')};
  const submitText = ${getField('dateInputSubmitText')};
  const legalDisclaimer = ${getField('legalDisclaimer')};

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (verified === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (isLoading && !propData) {
    return (
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80", className)}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const birthDate = new Date(dateOfBirth);

    if (isNaN(birthDate.getTime())) {
      setError('Please enter a valid date');
      return;
    }

    const age = calculateAge(birthDate);

    if (age >= minAge) {
      if (rememberChoice) {
        localStorage.setItem('age-verified', 'true');
      }
      setIsVisible(false);
      if (onVerified) {
        onVerified();
      }
    } else {
      setError(\`You must be at least \${minAge} years old to access this site\`);
      if (onFailed) {
        onFailed();
      } else {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80", className)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className={\`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white \${
                  error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }\`}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {submitText}
          </button>
        </form>

        {legalDisclaimer && (
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            {legalDisclaimer}
          </p>
        )}
      </div>
    </div>
  );
};

export default DateInputAgeVerification;
    `,

    checkbox: `
${commonImports}
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface CheckboxAgeVerificationProps {
  ${dataName}?: any;
  className?: string;
  rememberChoice?: boolean;
  redirectUrl?: string;
  onVerified?: () => void;
}

const CheckboxAgeVerification: React.FC<CheckboxAgeVerificationProps> = ({
  ${dataName}: propData,
  className,
  rememberChoice: propRememberChoice,
  redirectUrl: propRedirectUrl,
  onVerified
}) => {
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
  const [isVisible, setIsVisible] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [showError, setShowError] = useState(false);

  const verificationData = ${dataName} || {};

  const rememberChoice = propRememberChoice ?? ${getField('rememberChoice')};
  const redirectUrl = propRedirectUrl ?? ${getField('redirectUrl')};
  const title = ${getField('checkboxTitle')};
  const message = ${getField('checkboxMessage')};
  const checkboxLabel = ${getField('checkboxLabel')};
  const submitText = ${getField('checkboxSubmitText')};
  const legalDisclaimer = ${getField('legalDisclaimer')};

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (verified === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (isLoading && !propData) {
    return (
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80", className)}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);

    if (!isChecked) {
      setShowError(true);
      return;
    }

    if (rememberChoice) {
      localStorage.setItem('age-verified', 'true');
    }
    setIsVisible(false);
    if (onVerified) {
      onVerified();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80", className)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={\`p-4 border-2 rounded-lg transition-colors \${
            showError ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'
          }\`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  setIsChecked(e.target.checked);
                  setShowError(false);
                }}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {checkboxLabel}
              </span>
            </label>
            {showError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Please confirm your age to continue
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitText}
          </button>
        </form>

        {legalDisclaimer && (
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            {legalDisclaimer}
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckboxAgeVerification;
    `
  };

  return variants[variant] || variants.simple;
};
