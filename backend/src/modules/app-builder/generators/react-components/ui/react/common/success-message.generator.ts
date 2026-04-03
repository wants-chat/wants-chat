import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSuccessMessage = (
  resolved: ResolvedComponent,
  variant: 'banner' | 'modal' | 'toast' = 'banner'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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

  // Parse data source for clean prop naming
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
import { useState, useEffect } from 'react';
import { CheckCircle, X, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    banner: `
${commonImports}

interface SuccessMessageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SuccessMessage({ ${dataName}: propData, className }: SuccessMessageProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const successData = ${dataName} || {};

  const [isVisible, setIsVisible] = useState(true);

  const success = ${getField('bannerSuccess')};

  const handleAction = () => {
    console.log('Action clicked');
    if (success.actionUrl) {
      window.location.href = success.actionUrl;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        {success.showIcon && (
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
            {success.title}
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            {success.message}
          </p>
          {success.actionText && (
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 mt-3 transition-colors"
            >
              {success.actionText}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
    `,

    modal: `
${commonImports}

interface SuccessMessageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SuccessMessage({ ${dataName}: propData, className }: SuccessMessageProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const successData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(true);

  const success = ${getField('modalSuccess')};

  const handlePrimaryAction = () => {
    console.log('Primary action clicked');
    setIsOpen(false);
  };

  const handleSecondaryAction = () => {
    console.log('Secondary action clicked');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200",
        className
      )}>
        {/* Success Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {success.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {success.message}
          </p>

          {/* Next Steps */}
          {success.nextSteps && success.nextSteps.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-left">
                Next Steps:
              </h3>
              <ul className="space-y-2 text-left">
                {success.nextSteps.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 flex items-center justify-center text-xs font-medium mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handlePrimaryAction}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
          >
            {success.primaryActionText}
          </Button>
          <Button
            onClick={handleSecondaryAction}
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-300"
          >
            {success.secondaryActionText}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    toast: `
${commonImports}

interface SuccessMessageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SuccessMessage({ ${dataName}: propData, className }: SuccessMessageProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const successData = ${dataName} || {};

  const [isVisible, setIsVisible] = useState(true);

  const success = ${getField('toastSuccess')};

  useEffect(() => {
    if (success.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, success.duration);
      return () => clearTimeout(timer);
    }
  }, [success.duration]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={cn(
      "fixed z-50 animate-in slide-in-from-top-2 duration-300",
      positionStyles[success.position as keyof typeof positionStyles] || positionStyles['top-right']
    )}>
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-green-200 dark:border-green-800 min-w-[350px] max-w-md",
        className
      )}>
        <div className="flex gap-3 p-4">
          {success.showIcon && (
            <div className="flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {success.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {success.message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.banner;
};
