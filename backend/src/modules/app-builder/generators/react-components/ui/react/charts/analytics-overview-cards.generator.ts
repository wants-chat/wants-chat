import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAnalyticsOverviewCards = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' | 'grid' = 'compact'
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
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards/i)) {
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
    return `/${dataSource || 'analytics'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'analytics';

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Activity, Clock, Eye, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    compact: `
${commonImports}

interface Metric {
  label: string;
  currentValue: string;
  previousValue: string;
  changePercentage: number;
  trend: 'up' | 'down';
  icon: string;
  timePeriod: string;
  drillDownLink: string;
}

interface AnalyticsOverviewCardsProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const AnalyticsOverviewCards: React.FC<AnalyticsOverviewCardsProps> = ({
  ${dataName}: propData,
  className,
  onViewSalesData,
  onRefreshAnalytics,
  onLoadAnalytics
}) => {
  // Fetch data from API if no props data provided
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const analyticsData = ${dataName} || {};

  const metrics: Metric[] = ${getField('metrics')};
  const sectionTitle = ${getField('sectionTitle')};
  const viewDetailsLabel = ${getField('viewDetailsLabel')};

  const iconMap: any = {
    DollarSign,
    Users,
    TrendingUp,
    Activity,
    Clock,
    Eye
  };

  return (
    <div className={cn("w-full space-y-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 rounded-3xl", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{sectionTitle}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric: any, index: number) => {
          const Icon = iconMap[metric.icon] || TrendingUp;
          const isPositive = metric.trend === 'up';
          const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <Card key={index} className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.label}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {metric.currentValue}
                </div>
                <div className="flex items-center mt-2 text-xs">
                  <TrendIcon
                    className={cn(
                      "h-4 w-4 mr-1",
                      isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}
                  />
                  <span className={cn(
                    "font-medium",
                    isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {Math.abs(metric.changePercentage)}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    {metric.timePeriod}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsOverviewCards;
    `,

    detailed: `
${commonImports}

interface Metric {
  label: string;
  currentValue: string;
  previousValue: string;
  changePercentage: number;
  trend: 'up' | 'down';
  icon: string;
  timePeriod: string;
  drillDownLink: string;
}

interface AnalyticsOverviewCardsProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const AnalyticsOverviewCards: React.FC<AnalyticsOverviewCardsProps> = ({
  ${dataName}: propData,
  className,
  onViewSalesData,
  onRefreshAnalytics,
  onLoadAnalytics
}) => {
  // Fetch data from API if no props data provided
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const analyticsData = ${dataName} || {};

  const metrics: Metric[] = ${getField('metrics')};
  const sectionTitle = ${getField('sectionTitle')};
  const sectionSubtitle = ${getField('sectionSubtitle')};
  const viewDetailsLabel = ${getField('viewDetailsLabel')};
  const increaseLabel = ${getField('increaseLabel')};
  const decreaseLabel = ${getField('decreaseLabel')};

  const iconMap: any = {
    DollarSign,
    Users,
    TrendingUp,
    Activity,
    Clock,
    Eye
  };

  return (
    <div className={cn("w-full space-y-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 rounded-3xl", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">{sectionTitle}</h2>
        <p className="text-gray-600 dark:text-gray-400">{sectionSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric: any, index: number) => {
          const Icon = iconMap[metric.icon] || TrendingUp;
          const isPositive = metric.trend === 'up';
          const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <Card key={index} className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {metric.label}
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{metric.timePeriod}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {metric.currentValue}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={cn(
                        "flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        isPositive
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      )}>
                        <TrendIcon className="h-3 w-3 mr-1" />
                        {Math.abs(metric.changePercentage)}% {isPositive ? increaseLabel : decreaseLabel}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Previous: {metric.previousValue}
                    </div>
                  </div>

                  <button className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline text-left">
                    {viewDetailsLabel} →
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsOverviewCards;
    `,

    grid: `
${commonImports}

interface Metric {
  label: string;
  currentValue: string;
  previousValue: string;
  changePercentage: number;
  trend: 'up' | 'down';
  icon: string;
  timePeriod: string;
  drillDownLink: string;
}

interface AnalyticsOverviewCardsProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const AnalyticsOverviewCards: React.FC<AnalyticsOverviewCardsProps> = ({
  ${dataName}: propData,
  className,
  onViewSalesData,
  onRefreshAnalytics,
  onLoadAnalytics
}) => {
  // Fetch data from API if no props data provided
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const analyticsData = ${dataName} || {};

  const metrics: Metric[] = ${getField('metrics')};
  const sectionTitle = ${getField('sectionTitle')};

  const iconMap: any = {
    DollarSign,
    Users,
    TrendingUp,
    Activity,
    Clock,
    Eye
  };

  return (
    <div className={cn("w-full space-y-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 rounded-3xl", className)}>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{sectionTitle}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric: any, index: number) => {
          const Icon = iconMap[metric.icon] || TrendingUp;
          const isPositive = metric.trend === 'up';
          const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

          return (
            <Card
              key={index}
              className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-l-4"
              style={{
                borderLeftColor: isPositive ? '#10b981' : '#ef4444'
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className={cn(
                    "flex items-center text-xs font-medium",
                    isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    <TrendIcon className="h-3 w-3 mr-0.5" />
                    {Math.abs(metric.changePercentage)}%
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {metric.currentValue}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {metric.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsOverviewCards;
    `
  };

  return variants[variant] || variants.compact;
};
