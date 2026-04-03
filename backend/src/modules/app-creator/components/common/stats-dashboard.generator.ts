/**
 * Stats Dashboard Generator
 *
 * Generates dashboard stats cards with various display options
 */

import { pascalCase } from 'change-case';

export interface StatConfig {
  key: string;
  label: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'emerald' | 'indigo';
  type?: 'number' | 'currency' | 'percentage';
  endpoint?: string;
}

interface StatsOptions {
  componentName: string;
  title?: string;
  stats: StatConfig[];
  endpoint?: string;
  queryKey?: string;
}

const COLOR_CLASSES: Record<string, { bg: string; icon: string; text: string }> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-600 dark:text-red-400',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: 'text-orange-600 dark:text-orange-400',
    text: 'text-orange-600 dark:text-orange-400',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    icon: 'text-indigo-600 dark:text-indigo-400',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

/**
 * Generate a stats dashboard component
 */
export function generateStatsDashboard(options: StatsOptions): string {
  const { componentName, title, stats, endpoint = '/dashboard/stats', queryKey = 'dashboard-stats' } = options;

  const icons = [...new Set(stats.map(s => s.icon))];

  const statsConfigJson = stats.map(s => ({
    key: s.key,
    label: s.label,
    icon: s.icon,
    color: s.color,
    type: s.type || 'number',
  }));

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ${icons.join(', ')}, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const statsConfig = ${JSON.stringify(statsConfigJson, null, 2)};

const colorClasses: Record<string, { bg: string; icon: string }> = ${JSON.stringify(COLOR_CLASSES, null, 2)};

const iconMap: Record<string, React.FC<any>> = {
  ${icons.map(icon => `${icon}: ${icon}`).join(',\n  ')},
};

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: any, type: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    if (type === 'percentage') return value + '%';
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      ${title ? `<h2 className="text-2xl font-bold text-gray-900 dark:text-white">${title}</h2>` : ''}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat) => {
          const Icon = iconMap[stat.icon] || Loader2;
          const colors = colorClasses[stat.color] || colorClasses.blue;
          const value = stats?.[stat.key];
          const change = stats?.[stat.key + 'Change'];

          return (
            <div
              key={stat.key}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-lg', colors.bg)}>
                  <Icon className={cn('w-6 h-6', colors.icon)} />
                </div>
                {change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(change)}%
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {formatValue(value, stat.type)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate stats for specific domain
 */
export function generateDomainStats(
  domain: string,
  stats: StatConfig[]
): string {
  return generateStatsDashboard({
    componentName: pascalCase(domain) + 'Stats',
    stats,
    endpoint: `/${domain}/stats`,
    queryKey: `${domain}-stats`,
  });
}
