import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateUsageMetricsDisplay = (
  resolved: ResolvedComponent,
  variant: 'bars' | 'gauges' | 'cards' = 'bars'
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
  const entity = dataSource?.split('.').pop() || 'usage_metrics';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'usage_metrics'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Database, TrendingUp, Zap, Users, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';`;

  const variants = {
    bars: `
${commonImports}

interface UsageMetricsDisplayProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function UsageMetricsDisplay({ ${dataName}: propData, className }: UsageMetricsDisplayProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const metrics = ${getField('metrics')};
  const usageTitle = ${getField('usageTitle')};
  const upgradeButton = ${getField('upgradeButton')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    const icons: any = { Database, TrendingUp, Zap, Users };
    return icons[iconName] || Database;
  };

  const getColorClasses = (color: string, percentage: number) => {
    if (percentage >= 90) {
      return {
        bg: 'bg-gradient-to-r from-red-500 to-pink-600',
        text: 'text-red-600 dark:text-red-400',
        icon: 'bg-gradient-to-r from-red-500 to-pink-600',
        iconBg: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30'
      };
    }
    if (percentage >= 75) {
      return {
        bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        text: 'text-amber-600 dark:text-amber-400',
        icon: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        iconBg: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30'
      };
    }

    const colors: any = {
      blue: {
        bg: 'bg-gradient-to-r from-blue-600 to-purple-600',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'bg-gradient-to-r from-blue-600 to-purple-600',
        iconBg: 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30'
      },
      green: {
        bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
        text: 'text-green-600 dark:text-green-400',
        icon: 'bg-gradient-to-r from-green-500 to-emerald-500',
        iconBg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30'
      },
      purple: {
        bg: 'bg-gradient-to-r from-purple-500 to-pink-600',
        text: 'text-purple-600 dark:text-purple-400',
        icon: 'bg-gradient-to-r from-purple-500 to-pink-600',
        iconBg: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30'
      },
      amber: {
        bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        text: 'text-amber-600 dark:text-amber-400',
        icon: 'bg-gradient-to-r from-yellow-400 to-orange-500',
        iconBg: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30'
      }
    };
    return colors[color] || colors.blue;
  };

  const handleUpgrade = () => {
    console.log('Upgrade clicked');
    alert('Opening upgrade options...');
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6', className)}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{usageTitle}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Monitor your resource usage</p>
          </div>
          <button onClick={handleUpgrade} className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            {upgradeButton}
          </button>
        </div>

        <div className="space-y-6">
          {metrics.map((metric: any) => {
            const Icon = getIcon(metric.icon);
            const percentage = (metric.current / metric.limit) * 100;
            const colors = getColorClasses(metric.color, percentage);
            const isOverage = percentage >= 90;

            return (
              <Card key={metric.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg', colors.iconBg)}>
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', colors.icon)}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{metric.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{metric.resetDate}</p>
                      </div>
                    </div>
                    {isOverage && (
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold flex items-center gap-1 shadow-lg">
                        <AlertTriangle className="w-4 h-4" />
                        Warning
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Usage</span>
                      <span className={cn('font-bold', colors.text)}>
                        {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
                        <div
                          className={cn('h-4 rounded-full transition-all shadow-lg', colors.bg)}
                          style={{ width: \`\${Math.min(percentage, 100)}%\` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 font-bold">{percentage.toFixed(1)}% used</span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {(metric.limit - metric.current).toLocaleString()} {metric.unit} remaining
                      </span>
                    </div>
                  </div>

                  {isOverage && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-md">
                      <p className="text-sm text-red-900 dark:text-red-300 font-medium">
                        You're approaching your {metric.name.toLowerCase()} limit. Consider upgrading your plan.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
    `,

    gauges: `
${commonImports}

interface UsageMetricsDisplayProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function UsageMetricsDisplay({ ${dataName}: propData, className }: UsageMetricsDisplayProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const metrics = ${getField('metrics')};
  const usageTitle = ${getField('usageTitle')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    const icons: any = { Database, TrendingUp, Zap, Users };
    return icons[iconName] || Database;
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{usageTitle}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric: any) => {
            const Icon = getIcon(metric.icon);
            const percentage = (metric.current / metric.limit) * 100;
            const getGaugeColor = () => {
              if (percentage >= 90) return 'from-red-500 to-pink-600';
              if (percentage >= 75) return 'from-yellow-400 to-orange-500';
              return 'from-blue-600 to-purple-600';
            };

            return (
              <Card key={metric.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <defs>
                          <linearGradient id={\`gradient-\${metric.id}\`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" className={cn('bg-gradient-to-r', getGaugeColor())} />
                            <stop offset="100%" className={cn('bg-gradient-to-r', getGaugeColor())} />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient-\${metric.id})"
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={\`\${2 * Math.PI * 56}\`}
                          strokeDashoffset={\`\${2 * Math.PI * 56 * (1 - percentage / 100)}\`}
                          className={cn(
                            percentage >= 90 ? 'text-red-600' :
                            percentage >= 75 ? 'text-amber-600' :
                            'text-blue-600'
                          )}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gradient-to-r shadow-lg', getGaugeColor())}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{metric.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3 font-medium">
                      {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{metric.resetDate}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
    `,

    cards: `
${commonImports}

interface UsageMetricsDisplayProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function UsageMetricsDisplay({ ${dataName}: propData, className }: UsageMetricsDisplayProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const metrics = ${getField('metrics')};
  const usageTitle = ${getField('usageTitle')};
  const upgradeButton = ${getField('upgradeButton')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    const icons: any = { Database, TrendingUp, Zap, Users };
    return icons[iconName] || Database;
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{usageTitle}</h1>
          </div>
          <button className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg">
            {upgradeButton}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric: any) => {
            const Icon = getIcon(metric.icon);
            const percentage = (metric.current / metric.limit) * 100;
            const remaining = metric.limit - metric.current;
            const getIconColor = () => {
              if (percentage >= 90) return 'from-red-500 to-pink-600';
              if (percentage >= 75) return 'from-yellow-400 to-orange-500';
              return 'from-blue-600 to-purple-600';
            };

            return (
              <Card key={metric.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base font-bold">{metric.name}</span>
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r shadow-lg', getIconColor())}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {metric.current.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          / {metric.limit.toLocaleString()} {metric.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                        <div
                          className={cn(
                            'h-3 rounded-full transition-all shadow-lg bg-gradient-to-r',
                            percentage >= 90 && 'from-red-500 to-pink-600',
                            percentage >= 75 && percentage < 90 && 'from-yellow-400 to-orange-500',
                            percentage < 75 && 'from-blue-600 to-purple-600'
                          )}
                          style={{ width: \`\${Math.min(percentage, 100)}%\` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 font-bold">{percentage.toFixed(0)}% used</span>
                      <span className="text-gray-900 dark:text-white font-bold">
                        {remaining.toLocaleString()} left
                      </span>
                    </div>

                    {percentage >= 90 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold shadow-lg">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Limit approaching</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.bars;
};
