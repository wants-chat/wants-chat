import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateErrorMessage = (
  resolved: ResolvedComponent,
  variant: 'banner' | 'modal' | 'inline' = 'banner'
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

  const commonImports = `
import { useState } from 'react';
import { XCircle, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';`;

  const variants = {
    banner: `
${commonImports}

interface ErrorMessageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ErrorMessage({ ${dataName}, className }: ErrorMessageProps) {
  const errorData = ${dataName} || {};

  const [isVisible, setIsVisible] = useState(true);

  const error = ${getField('bannerError')};

  const handleRetry = () => {
    console.log('Retry clicked');
    // Implement retry logic
  };

  const handleSupport = () => {
    console.log('Support clicked');
    if (error.supportLink) {
      window.location.href = error.supportLink;
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        {error.showIcon && (
          <div className="flex-shrink-0">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
            {error.title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400 mb-3">
            {error.message}
          </p>
          <div className="flex flex-wrap gap-2">
            {error.actionText && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {error.actionText}
              </button>
            )}
            {error.supportLink && (
              <button
                onClick={handleSupport}
                className="inline-flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
              >
                Contact Support
              </button>
            )}
          </div>
        </div>
        {error.isDismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
    `,

    modal: `
${commonImports}

interface ErrorMessageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ErrorMessage({ ${dataName}, className }: ErrorMessageProps) {
  const errorData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(true);

  const error = ${getField('modalError')};

  const handleRetry = () => {
    console.log('Retry clicked');
    setIsOpen(false);
  };

  const handleSupport = () => {
    console.log('Contact support clicked');
    // Implement support contact logic
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
        {/* Error Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-500" />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error.title}
          </h2>
          <p className="text-gray-900 dark:text-white font-medium mb-2">
            {error.message}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.description}
          </p>

          {/* Suggested Actions */}
          {error.suggestedActions && error.suggestedActions.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-left">
                Suggested Actions:
              </h3>
              <ul className="space-y-2 text-left">
                {error.suggestedActions.map((action: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 flex items-center justify-center text-xs font-medium mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRetry}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            {error.retryText}
          </Button>
          <Button
            onClick={handleSupport}
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-300"
          >
            {error.supportText}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    inline: `
${commonImports}

interface ErrorMessageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ErrorMessage({ ${dataName}, className }: ErrorMessageProps) {
  const errorData = ${dataName} || {};

  const [isVisible, setIsVisible] = useState(true);

  const error = ${getField('inlineError')};

  const handleRetry = () => {
    console.log('Retry clicked');
    // Implement retry logic
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-r-lg",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
            {error.title}
          </h3>
          <p className="text-sm text-red-800 dark:text-red-400 font-medium mb-1">
            {error.message}
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 mb-3">
            {error.description}
          </p>
          {error.showRetry && (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {error.retryText}
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.banner;
};
