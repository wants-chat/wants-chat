import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSkeletonScreen = (
  resolved: ResolvedComponent,
  variant: 'card' | 'list' | 'page' = 'card'
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
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    card: `
${commonImports}

interface SkeletonScreenProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SkeletonScreen({ ${dataName}: propData, className }: SkeletonScreenProps) {
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

  const skeletonData = ${dataName} || {};

  const skeleton = ${getField('cardSkeleton')};

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden", className)}>
      {/* Image Skeleton */}
      {skeleton.showImage && (
        <div
          className="bg-gray-200 dark:bg-gray-700 animate-pulse relative overflow-hidden"
          style={{ height: skeleton.imageHeight }}
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
        </div>
      )}

      <div className="p-6">
        {/* Avatar and Title */}
        <div className="flex items-center gap-4 mb-4">
          {skeleton.showAvatar && (
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
          )}
          {skeleton.showTitle && (
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
              </div>
            </div>
          )}
        </div>

        {/* Description Skeleton */}
        {skeleton.showDescription && (
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
          </div>
        )}

        {/* Actions Skeleton */}
        {skeleton.showActions && (
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    `,

    list: `
${commonImports}

interface SkeletonScreenProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SkeletonScreen({ ${dataName}: propData, className }: SkeletonScreenProps) {
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

  const skeletonData = ${dataName} || {};

  const skeleton = ${getField('listSkeleton')};

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: skeleton.itemCount }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            {/* Avatar Skeleton */}
            {skeleton.showAvatar && (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
              </div>
            )}

            {/* Text Content Skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
              </div>
              {skeleton.showSecondaryText && (
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                </div>
              )}
            </div>

            {/* Icon Skeleton */}
            {skeleton.showIcon && (
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
    `,

    page: `
${commonImports}

interface SkeletonScreenProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SkeletonScreen({ ${dataName}: propData, className }: SkeletonScreenProps) {
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

  const skeletonData = ${dataName} || {};

  const skeleton = ${getField('pageSkeleton')};

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Header Skeleton */}
      {skeleton.showHeader && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
            <div className="flex gap-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
              </div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex gap-6">
          {/* Sidebar Skeleton */}
          {skeleton.showSidebar && (
            <div className="hidden lg:block w-64 space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                </div>
              ))}
            </div>
          )}

          {/* Main Content Skeleton */}
          {skeleton.showContent && (
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
                {/* Title */}
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                </div>

                {/* Content Lines */}
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden" style={{ width: \`\${100 - idx * 10}%\` }}>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                    </div>
                  ))}
                </div>

                {/* Image */}
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                </div>

                {/* More Content */}
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse relative overflow-hidden" style={{ width: \`\${90 - idx * 15}%\` }}>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Skeleton */}
      {skeleton.showFooter && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
    `
  };

  return variants[variant] || variants.card;
};
