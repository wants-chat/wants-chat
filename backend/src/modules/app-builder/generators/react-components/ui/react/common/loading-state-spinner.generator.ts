import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateLoadingStateSpinner = (
  resolved: ResolvedComponent,
  variant: 'spinner' | 'pulse' | 'skeleton' = 'spinner'
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
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    spinner: `
${commonImports}

interface LoadingStateSpinnerProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function LoadingStateSpinner({ ${dataName}: propData, className }: LoadingStateSpinnerProps) {
  const { data: fetchedData, isLoading: isFetching, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const loadingData = ${dataName} || {};

  const loading = ${getField('spinnerData')};

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-500',
    gray: 'text-gray-600 dark:text-gray-500',
    white: 'text-white',
    green: 'text-green-600 dark:text-green-500',
    red: 'text-red-600 dark:text-red-500',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-8", className)}>
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[loading.size as keyof typeof sizeClasses] || sizeClasses.medium,
          colorClasses[loading.color as keyof typeof colorClasses] || colorClasses.blue
        )}
      />
      {loading.showText && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {loading.text}
        </p>
      )}
    </div>
  );
}
    `,

    pulse: `
${commonImports}
import { useEffect, useState } from 'react';

interface LoadingStateSpinnerProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function LoadingStateSpinner({ ${dataName}: propData, className }: LoadingStateSpinnerProps) {
  const { data: fetchedData, isLoading: isFetching, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const loadingData = ${dataName} || {};

  const loading = ${getField('pulseData')};
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (loading.dots) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading.dots]);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
      {loading.showText && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {loading.text}{loading.dots ? dots : ''}
        </p>
      )}
    </div>
  );
}
    `,

    skeleton: `
${commonImports}

interface LoadingStateSpinnerProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function LoadingStateSpinner({ ${dataName}: propData, className }: LoadingStateSpinnerProps) {
  const { data: fetchedData, isLoading: isFetching, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const loadingData = ${dataName} || {};

  return (
    <div className={cn("w-full space-y-4 p-4", className)}>
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
      </div>

      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

      {/* Footer Skeleton */}
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.spinner;
};
