import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProgressIndicatorLinear = (
  resolved: ResolvedComponent,
  variant: 'bar' | 'stepped' | 'labeled' = 'bar'
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
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    bar: `
${commonImports}

interface ProgressIndicatorLinearProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ProgressIndicatorLinear({ ${dataName}: propData, className }: ProgressIndicatorLinearProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const progressData = ${dataName} || {};

  const progress = ${getField('barProgress')};

  const gradientClasses = {
    blue: 'bg-gradient-to-r from-blue-600 to-purple-600',
    green: 'bg-gradient-to-r from-green-600 to-emerald-600',
    red: 'bg-gradient-to-r from-red-600 to-pink-600',
    yellow: 'bg-gradient-to-r from-yellow-600 to-orange-600',
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-600',
  };

  const textGradients = {
    blue: 'from-blue-600 to-purple-600',
    green: 'from-green-600 to-emerald-600',
    red: 'from-red-600 to-pink-600',
    yellow: 'from-yellow-600 to-orange-600',
    purple: 'from-purple-600 to-indigo-600',
  };

  const currentTextGradient = textGradients[progress.color as keyof typeof textGradients] || textGradients.blue;

  return (
    <div className={cn("w-full", className)}>
      {/* Label and Percentage */}
      {(progress.label || progress.showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {progress.label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {progress.label}
            </span>
          )}
          {progress.showPercentage && (
            <span className={cn("text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent", currentTextGradient)}>
              {progress.percentage}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out rounded-full shadow-sm",
            gradientClasses[progress.color as keyof typeof gradientClasses] || gradientClasses.blue
          )}
          style={{ width: \`\${progress.percentage}%\` }}
        />
      </div>
    </div>
  );
}
    `,

    stepped: `
${commonImports}

interface ProgressIndicatorLinearProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ProgressIndicatorLinear({ ${dataName}: propData, className }: ProgressIndicatorLinearProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const progressData = ${dataName} || {};

  const progress = ${getField('steppedProgress')};

  return (
    <div className={cn("w-full", className)}>
      {/* Steps */}
      <div className="flex items-center justify-between">
        {progress.steps.map((step: any, idx: number) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md",
                  step.completed
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent"
                    : step.current
                    ? "bg-white dark:bg-gray-800 border-blue-600 dark:border-purple-600 ring-2 ring-blue-400/50"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                )}
              >
                {step.completed ? (
                  <Check className="w-5 h-5 text-white" />
                ) : step.current ? (
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-purple-400" />
                ) : (
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {step.id}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center whitespace-nowrap",
                  step.current
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold"
                    : step.completed
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-500 dark:text-gray-500"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {idx < progress.steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 mb-6 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    step.completed
                      ? "bg-gradient-to-r from-blue-600 to-purple-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
    `,

    labeled: `
${commonImports}
import { X } from 'lucide-react';

interface ProgressIndicatorLinearProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ProgressIndicatorLinear({ ${dataName}: propData, className }: ProgressIndicatorLinearProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const progressData = ${dataName} || {};

  const progress = ${getField('labeledProgress')};

  const handleCancel = () => {
    console.log('Progress cancelled');
  };

  return (
    <div className={cn("w-full bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 p-4 shadow-md hover:shadow-lg", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {progress.label}
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {progress.currentStep}
          </p>
        </div>
        {progress.isCancellable && (
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-in-out rounded-full shadow-sm"
            style={{ width: \`\${progress.percentage}%\` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          {progress.estimatedTime}
        </span>
        <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {progress.percentage}%
        </span>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.bar;
};
