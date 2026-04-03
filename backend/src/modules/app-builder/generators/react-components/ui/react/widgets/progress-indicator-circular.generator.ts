import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProgressIndicatorCircular = (
  resolved: ResolvedComponent,
  variant: 'circle' | 'ring' | 'semicircle' = 'circle'
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

  const commonImports = `import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Sparkles, Loader2 } from 'lucide-react';`;

  const variants = {
    circle: `
${commonImports}

interface ProgressIndicatorCircularProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ProgressIndicatorCircular({ ${dataName}: propData, className }: ProgressIndicatorCircularProps) {
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

  const progress = ${getField('circleProgress')};

  const radius = (progress.size - progress.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress.percentage / 100) * circumference;

  const gradients = {
    blue: { id: 'blueGradient', from: '#2563eb', to: '#9333ea' },
    green: { id: 'greenGradient', from: '#10b981', to: '#059669' },
    red: { id: 'redGradient', from: '#ef4444', to: '#ec4899' },
    yellow: { id: 'yellowGradient', from: '#f59e0b', to: '#f97316' },
    purple: { id: 'purpleGradient', from: '#9333ea', to: '#6366f1' },
  };

  const currentGradient = gradients[progress.color as keyof typeof gradients] || gradients.blue;

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <div className="relative" style={{ width: progress.size, height: progress.size }}>
        <svg
          className="transform -rotate-90"
          width={progress.size}
          height={progress.size}
        >
          <defs>
            <linearGradient id={currentGradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentGradient.from} />
              <stop offset="100%" stopColor={currentGradient.to} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={progress.size / 2}
            cy={progress.size / 2}
            r={radius}
            className="stroke-gray-200 dark:stroke-gray-700 fill-none"
            strokeWidth={progress.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={progress.size / 2}
            cy={progress.size / 2}
            r={radius}
            className="fill-none transition-all duration-300"
            stroke={\`url(#\${currentGradient.id})\`}
            strokeWidth={progress.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        {progress.showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">
              {progress.centerText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
    `,

    ring: `
${commonImports}

interface ProgressIndicatorCircularProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ProgressIndicatorCircular({ ${dataName}: propData, className }: ProgressIndicatorCircularProps) {
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

  const progress = ${getField('ringProgress')};

  const radius = (progress.size - progress.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress.percentage / 100) * circumference;

  const gradients = {
    blue: { id: 'blueGradient', from: '#2563eb', to: '#9333ea' },
    green: { id: 'greenGradient', from: '#10b981', to: '#059669' },
    red: { id: 'redGradient', from: '#ef4444', to: '#ec4899' },
    yellow: { id: 'yellowGradient', from: '#f59e0b', to: '#f97316' },
    purple: { id: 'purpleGradient', from: '#9333ea', to: '#6366f1' },
  };

  const textGradients = {
    blue: 'from-blue-600 to-purple-600',
    green: 'from-green-600 to-emerald-600',
    red: 'from-red-600 to-pink-600',
    yellow: 'from-yellow-600 to-orange-600',
    purple: 'from-purple-600 to-indigo-600',
  };

  const currentGradient = gradients[progress.color as keyof typeof gradients] || gradients.green;
  const currentTextGradient = textGradients[progress.color as keyof typeof textGradients] || textGradients.green;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: progress.size, height: progress.size }}>
        <svg
          className="transform -rotate-90"
          width={progress.size}
          height={progress.size}
        >
          <defs>
            <linearGradient id={currentGradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentGradient.from} />
              <stop offset="100%" stopColor={currentGradient.to} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={progress.size / 2}
            cy={progress.size / 2}
            r={radius}
            className="stroke-gray-200 dark:stroke-gray-700 fill-none"
            strokeWidth={progress.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={progress.size / 2}
            cy={progress.size / 2}
            r={radius}
            className="fill-none transition-all duration-300"
            stroke={\`url(#\${currentGradient.id})\`}
            strokeWidth={progress.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center percentage */}
        {progress.showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent", currentTextGradient)}>
              {progress.percentage}%
            </span>
          </div>
        )}
      </div>
      {/* Label and description */}
      <div className="text-center">
        {progress.label && (
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {progress.label}
          </h3>
        )}
        {progress.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {progress.description}
          </p>
        )}
      </div>
    </div>
  );
}
    `,

    semicircle: `
${commonImports}

interface ProgressIndicatorCircularProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ProgressIndicatorCircular({ ${dataName}: propData, className }: ProgressIndicatorCircularProps) {
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

  const progress = ${getField('semicircleProgress')};

  const radius = (progress.size - progress.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (progress.percentage / 100) * circumference;

  const gradients = {
    blue: { id: 'blueGradient', from: '#2563eb', to: '#9333ea' },
    green: { id: 'greenGradient', from: '#10b981', to: '#059669' },
    red: { id: 'redGradient', from: '#ef4444', to: '#ec4899' },
    yellow: { id: 'yellowGradient', from: '#f59e0b', to: '#f97316' },
    purple: { id: 'purpleGradient', from: '#9333ea', to: '#6366f1' },
  };

  const bgGradientClasses = {
    blue: 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800',
    green: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800',
    red: 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-200 dark:border-red-800',
    yellow: 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-200 dark:border-yellow-800',
    purple: 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-800',
  };

  const currentGradient = gradients[progress.color as keyof typeof gradients] || gradients.purple;
  const currentBgGradient = bgGradientClasses[progress.color as keyof typeof bgGradientClasses] || bgGradientClasses.purple;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative" style={{ width: progress.size, height: progress.size / 2 + 30 }}>
        <svg
          className="transform -rotate-90"
          width={progress.size}
          height={progress.size}
          viewBox={\`0 0 \${progress.size} \${progress.size / 2 + 20}\`}
        >
          <defs>
            <linearGradient id={currentGradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentGradient.from} />
              <stop offset="100%" stopColor={currentGradient.to} />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d={\`M \${progress.strokeWidth / 2} \${progress.size / 2} A \${radius} \${radius} 0 0 1 \${progress.size - progress.strokeWidth / 2} \${progress.size / 2}\`}
            className="stroke-gray-200 dark:stroke-gray-700 fill-none"
            strokeWidth={progress.strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={\`M \${progress.strokeWidth / 2} \${progress.size / 2} A \${radius} \${radius} 0 0 1 \${progress.size - progress.strokeWidth / 2} \${progress.size / 2}\`}
            className="fill-none transition-all duration-300"
            stroke={\`url(#\${currentGradient.id})\`}
            strokeWidth={progress.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center content */}
        <div className="absolute bottom-0 left-0 right-0 text-center">
          {progress.showPercentage && (
            <div className={cn("inline-flex items-center justify-center px-4 py-2 rounded-full shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105", currentBgGradient)}>
              <Sparkles className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {progress.centerText}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Label */}
      {progress.label && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center">
          {progress.label}
        </h3>
      )}
    </div>
  );
}
    `
  };

  return variants[variant] || variants.circle;
};
