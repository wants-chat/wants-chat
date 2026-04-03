import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAnalyticsCard = (resolved: ResolvedComponent): string => {
  const dataSource = resolved.dataSource;

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

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface AnalyticsCardProps {
  title?: string;
  value?: string | number;
  description?: string;
  icon?: React.ReactNode;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  loading?: boolean;
  data?: any;
  usageMetrics?: any;
  metrics?: any;
  onLoadMetrics?: () => void;
  onLoadAnalytics?: () => void;
  className?: string;
  entity?: string;
  [key: string]: any;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title = 'Analytics',
  value: propValue,
  description,
  icon,
  change: propChange,
  changeType = 'neutral',
  color = 'blue',
  loading: propLoading = false,
  data: propData,
  entity = '${dataSource || 'analytics'}',
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading: queryLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data?.[0] || response);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        return null;
      }
    },
    enabled: !propData && !propValue,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const sourceData = propData || fetchedData || {};
  const value = propValue ?? sourceData?.value ?? sourceData?.count ?? sourceData?.total ?? '0';
  const change = propChange ?? sourceData?.change ?? sourceData?.changePercent;
  const loading = propLoading || (queryLoading && !propData && !propValue);
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const iconBgColor = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isIncrease = changeType === 'increase' || (change && change > 0);
  const isDecrease = changeType === 'decrease' || (change && change < 0);

  return (
    <Card className={cn('w-full rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">{value}</h3>

            {change !== undefined && (
              <div className="flex items-center gap-1">
                {isIncrease && (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      +{Math.abs(change)}%
                    </span>
                  </>
                )}
                {isDecrease && (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">
                      {change}%
                    </span>
                  </>
                )}
                {!isIncrease && !isDecrease && (
                  <span className="text-sm font-medium text-gray-600">
                    {change}%
                  </span>
                )}
              </div>
            )}

            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>

          {icon && (
            <div className={\`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg text-white\`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
  `.trim();
};