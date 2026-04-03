/**
 * Analytics Charts Component Generator
 *
 * Generates analytics dashboard with stats and charts.
 */

export interface AnalyticsChartsOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateAnalyticsCharts(options: AnalyticsChartsOptions = {}): string {
  const {
    componentName = 'AnalyticsCharts',
    endpoint = '/analytics',
    title = 'Analytics Overview',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import { api } from '@/lib/api';

interface AnalyticsData {
  totalRevenue?: number;
  totalOrders?: number;
  totalUsers?: number;
  conversionRate?: number;
  revenueChange?: number;
  ordersChange?: number;
}

const ${componentName}: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {};
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: analytics?.totalRevenue ? '\$' + analytics.totalRevenue.toLocaleString() : '\$0',
      change: analytics?.revenueChange || 0,
      icon: BarChart3,
    },
    {
      label: 'Total Orders',
      value: analytics?.totalOrders?.toLocaleString() || '0',
      change: analytics?.ordersChange || 0,
      icon: PieChart,
    },
    {
      label: 'Total Users',
      value: analytics?.totalUsers?.toLocaleString() || '0',
      change: 0,
      icon: TrendingUp,
    },
    {
      label: 'Conversion Rate',
      value: (analytics?.conversionRate || 0).toFixed(1) + '%',
      change: 0,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">${title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {stat.change !== 0 && (
              <div className={\`flex items-center gap-1 mt-3 text-sm \${stat.change > 0 ? 'text-green-600' : 'text-red-600'}\`}>
                {stat.change > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(stat.change)}% from last month</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Over Time</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
              <p className="text-sm">Integrate with your preferred charting library</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sales by Category</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
              <p className="text-sm">Integrate with your preferred charting library</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
