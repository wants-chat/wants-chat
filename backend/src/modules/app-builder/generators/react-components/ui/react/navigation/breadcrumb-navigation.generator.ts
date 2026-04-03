import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBreadcrumbNavigation = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'withIcons' | 'collapsible' = 'standard'
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
    return `/${dataSource || 'breadcrumb'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'breadcrumb' : 'breadcrumb';

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Home, ChevronRight, MoreHorizontal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    standard: `
${commonImports}

interface BreadcrumbNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function BreadcrumbNavigation({ ${dataName}: propData, className }: BreadcrumbNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
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

  const breadcrumbData = ${dataName} || {};

  const pathItems = ${getField('pathItems')};
  const separator = ${getField('separator')};
  const showHomeIcon = ${getField('showHomeIcon')};

  const handleBreadcrumbClick = (item: any) => {
    console.log('Breadcrumb clicked:', item);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className={cn('mb-8 bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 px-4 py-3 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-700/50', className)}>
        <nav className="flex items-center space-x-2 text-sm">
          {pathItems.map((item: any, index: number) => {
            const isLast = index === pathItems.length - 1;
            const isFirst = index === 0;

            return (
              <div key={index} className="flex items-center">
                {isFirst && showHomeIcon ? (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleBreadcrumbClick(item);
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                  </a>
                ) : (
                  <>
                    {!isLast ? (
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleBreadcrumbClick(item);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-white font-medium">
                        {item.label}
                      </span>
                    )}
                  </>
                )}

                {!isLast && (
                  <span className="mx-2 text-gray-400 dark:text-gray-600">
                    {separator}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Breadcrumb Navigation - Standard</h1>
        <p className="text-gray-600 dark:text-gray-400">Simple breadcrumb navigation with separator</p>

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Page: MacBook Pro</h2>
          <p className="text-gray-600 dark:text-gray-400">This is where your page content would go.</p>
        </div>
      </div>
    </div>
  );
}
    `,

    withIcons: `
${commonImports}

interface BreadcrumbNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function BreadcrumbNavigation({ ${dataName}: propData, className }: BreadcrumbNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
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

  const breadcrumbData = ${dataName} || {};

  const pathItems = ${getField('pathItems')};
  const showHomeIcon = ${getField('showHomeIcon')};

  const handleBreadcrumbClick = (item: any) => {
    console.log('Breadcrumb clicked:', item);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className={cn('mb-8', className)}>
        <nav className="flex items-center space-x-1 text-sm">
          {pathItems.map((item: any, index: number) => {
            const isLast = index === pathItems.length - 1;
            const isFirst = index === 0;

            return (
              <div key={index} className="flex items-center">
                {isFirst && showHomeIcon ? (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleBreadcrumbClick(item);
                    }}
                    className="px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <Home className="w-4 h-4" />
                  </a>
                ) : (
                  <>
                    {!isLast ? (
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleBreadcrumbClick(item);
                        }}
                        className="px-3 py-1.5 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-md">
                        {item.label}
                      </span>
                    )}
                  </>
                )}

                {!isLast && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Breadcrumb Navigation - With Icons</h1>
        <p className="text-gray-600 dark:text-gray-400">Breadcrumb navigation with chevron icons and hover states</p>

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Page: MacBook Pro</h2>
          <p className="text-gray-600 dark:text-gray-400">This is where your page content would go.</p>
        </div>
      </div>
    </div>
  );
}
    `,

    collapsible: `
${commonImports}

interface BreadcrumbNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function BreadcrumbNavigation({ ${dataName}: propData, className }: BreadcrumbNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const breadcrumbData = ${dataName} || {};

  const pathItems = ${getField('pathItems')};
  const maxItems = ${getField('maxItems')};
  const showHomeIcon = ${getField('showHomeIcon')};
  const [expanded, setExpanded] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleBreadcrumbClick = (item: any) => {
    console.log('Breadcrumb clicked:', item);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
    console.log('Breadcrumb expanded:', !expanded);
  };

  // Determine which items to show
  const getVisibleItems = () => {
    if (expanded || pathItems.length <= maxItems) {
      return pathItems;
    }

    // Show first item, ellipsis, and last 2 items
    const firstItem = pathItems[0];
    const lastItems = pathItems.slice(-2);

    return [firstItem, { label: '...', href: '#', isEllipsis: true }, ...lastItems];
  };

  const visibleItems = getVisibleItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className={cn('mb-8', className)}>
        <nav className="flex items-center space-x-1 text-sm">
          {visibleItems.map((item: any, index: number) => {
            const isLast = index === visibleItems.length - 1;
            const isFirst = index === 0;
            const isEllipsis = item.isEllipsis;

            return (
              <div key={index} className="flex items-center">
                {isEllipsis ? (
                  <button
                    onClick={handleExpandClick}
                    className="px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    {isFirst && showHomeIcon ? (
                      <a
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleBreadcrumbClick(item);
                        }}
                        className="px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                      >
                        <Home className="w-4 h-4" />
                      </a>
                    ) : (
                      <>
                        {!isLast ? (
                          <a
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleBreadcrumbClick(item);
                            }}
                            className="px-3 py-1.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all max-w-[200px] truncate"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-md max-w-[200px] truncate">
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}

                {!isLast && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Breadcrumb Navigation - Collapsible</h1>
        <p className="text-gray-600 dark:text-gray-400">Breadcrumb navigation with collapsible long paths (max {maxItems} items)</p>

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Current Page: MacBook Pro</h2>
          <p className="text-gray-600 dark:text-gray-400">Click the ellipsis (...) button to expand the full breadcrumb path.</p>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.standard;
};
