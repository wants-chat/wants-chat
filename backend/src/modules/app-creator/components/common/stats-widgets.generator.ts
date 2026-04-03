/**
 * Stats Widgets Generator
 *
 * Generates various analytics and stats widget components including:
 * - AnalyticsOverview
 * - MembershipStats
 * - MrrStats
 * - RevenueChart
 * - EarningsChart
 * - OccupancyChart
 * - SubscriberChart
 * - MemberGrowthChart
 * - UtilizationReport
 * - FulfillmentReport
 */

export interface StatsWidgetOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
  queryKey?: string;
}

/**
 * Generate AnalyticsOverview component with key metrics cards
 */
export function generateAnalyticsOverview(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'AnalyticsOverview',
    endpoint = '/analytics/overview',
    title = 'Analytics Overview',
    queryKey = 'analytics-overview',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { api } from '@/lib/api';

interface AnalyticsOverviewData {
  totalRevenue?: number;
  revenueChange?: number;
  totalUsers?: number;
  usersChange?: number;
  totalOrders?: number;
  ordersChange?: number;
  totalViews?: number;
  viewsChange?: number;
  conversionRate?: number;
  conversionChange?: number;
  averageOrderValue?: number;
  aovChange?: number;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<AnalyticsOverviewData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        return {};
      }
    },
  });

  const formatValue = (value: number | undefined, type: 'currency' | 'number' | 'percentage') => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (type === 'percentage') return value.toFixed(1) + '%';
    return value.toLocaleString();
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: formatValue(analytics?.totalRevenue, 'currency'),
      change: analytics?.revenueChange,
      icon: DollarSign,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Users',
      value: formatValue(analytics?.totalUsers, 'number'),
      change: analytics?.usersChange,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Orders',
      value: formatValue(analytics?.totalOrders, 'number'),
      change: analytics?.ordersChange,
      icon: ShoppingCart,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Page Views',
      value: formatValue(analytics?.totalViews, 'number'),
      change: analytics?.viewsChange,
      icon: Eye,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Conversion Rate',
      value: formatValue(analytics?.conversionRate, 'percentage'),
      change: analytics?.conversionChange,
      icon: BarChart3,
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Avg. Order Value',
      value: formatValue(analytics?.averageOrderValue, 'currency'),
      change: analytics?.aovChange,
      icon: TrendingUp,
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    },
  ];

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-xl \${stat.color}\`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.change !== undefined && (
                <div className={\`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full \${
                  stat.change >= 0
                    ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                    : 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                }\`}>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate MembershipStats component for membership/subscription tracking
 */
export function generateMembershipStats(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'MembershipStats',
    endpoint = '/memberships/stats',
    title = 'Membership Statistics',
    queryKey = 'membership-stats',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Crown,
} from 'lucide-react';
import { api } from '@/lib/api';

interface MembershipData {
  totalMembers?: number;
  activeMembers?: number;
  newMembers?: number;
  churned?: number;
  retention?: number;
  growthRate?: number;
  premiumMembers?: number;
  trialMembers?: number;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<MembershipData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch membership stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Total Members',
      value: stats?.totalMembers?.toLocaleString() || '0',
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Active Members',
      value: stats?.activeMembers?.toLocaleString() || '0',
      icon: UserCheck,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'New This Month',
      value: '+' + (stats?.newMembers?.toLocaleString() || '0'),
      icon: UserPlus,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Churned',
      value: stats?.churned?.toLocaleString() || '0',
      icon: UserMinus,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className={\`inline-flex p-2 rounded-lg mb-3 \${metric.color}\`}>
              <metric.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.retention?.toFixed(1) || '0'}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats?.growthRate?.toFixed(1) || '0'}%
            </span>
            {(stats?.growthRate || 0) >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Premium Members</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats?.premiumMembers?.toLocaleString() || '0'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate MrrStats component for Monthly Recurring Revenue
 */
export function generateMrrStats(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'MrrStats',
    endpoint = '/revenue/mrr',
    title = 'Monthly Recurring Revenue',
    queryKey = 'mrr-stats',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

interface MrrData {
  currentMrr?: number;
  previousMrr?: number;
  mrrChange?: number;
  newMrr?: number;
  expansionMrr?: number;
  churnMrr?: number;
  netNewMrr?: number;
  chartData?: Array<{ month: string; mrr: number; }>;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: mrr, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<MrrData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch MRR stats:', err);
        return {};
      }
    },
  });

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '$0';
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const isPositiveChange = (mrr?.mrrChange || 0) >= 0;

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current MRR</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(mrr?.currentMrr)}
              </span>
              <span className={\`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium \${
                isPositiveChange
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }\`}>
                {isPositiveChange ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(mrr?.mrrChange || 0).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Previous: {formatCurrency(mrr?.previousMrr)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">New MRR</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            +{formatCurrency(mrr?.newMrr)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Expansion</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            +{formatCurrency(mrr?.expansionMrr)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Churn</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            -{formatCurrency(mrr?.churnMrr)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Net New</span>
          </div>
          <div className={\`text-xl font-bold \${
            (mrr?.netNewMrr || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }\`}>
            {(mrr?.netNewMrr || 0) >= 0 ? '+' : ''}{formatCurrency(mrr?.netNewMrr)}
          </div>
        </div>
      </div>

      {mrr?.chartData && mrr.chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">MRR Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrr.chartData}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="month"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickLine={{ stroke: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickLine={{ stroke: 'currentColor' }}
                  tickFormatter={(value) => '$' + (value / 1000) + 'k'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    borderColor: 'var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => ['$' + value.toLocaleString(), 'MRR']}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#mrrGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate RevenueChart component with line/area chart
 */
export function generateRevenueChart(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'RevenueChart',
    endpoint = '/analytics/revenue',
    title = 'Revenue Analytics',
    queryKey = 'revenue-chart',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface RevenueData {
  totalRevenue?: number;
  revenueChange?: number;
  avgDailyRevenue?: number;
  chartData?: Array<{
    date: string;
    revenue: number;
    orders?: number;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const { data: revenue, isLoading } = useQuery({
    queryKey: ['${queryKey}', period],
    queryFn: async () => {
      try {
        const response = await api.get<RevenueData>(\`${endpoint}?period=\${period}\`);
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
        return {};
      }
    },
  });

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '$0';
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const isPositive = (revenue?.revenueChange || 0) >= 0;

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">${title}</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={\`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors \${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(revenue?.totalRevenue)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className={\`p-2 rounded-lg \${isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}\`}>
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Change</span>
          </div>
          <div className={\`text-2xl font-bold \${isPositive ? 'text-green-600' : 'text-red-600'}\`}>
            {isPositive ? '+' : ''}{revenue?.revenueChange?.toFixed(1) || 0}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Daily</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(revenue?.avgDailyRevenue)}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenue?.chartData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => '$' + (value >= 1000 ? (value / 1000) + 'k' : value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  borderColor: 'var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => ['$' + value.toLocaleString(), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate EarningsChart component for earnings/profit visualization
 */
export function generateEarningsChart(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'EarningsChart',
    endpoint = '/analytics/earnings',
    title = 'Earnings Overview',
    queryKey = 'earnings-chart',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, DollarSign, Wallet, CreditCard, PiggyBank } from 'lucide-react';
import { api } from '@/lib/api';

interface EarningsData {
  totalEarnings?: number;
  netProfit?: number;
  expenses?: number;
  pendingPayouts?: number;
  chartData?: Array<{
    period: string;
    earnings: number;
    expenses: number;
    profit: number;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: earnings, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<EarningsData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch earnings:', err);
        return {};
      }
    },
  });

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '$0';
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Earnings',
      value: formatCurrency(earnings?.totalEarnings),
      icon: DollarSign,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Net Profit',
      value: formatCurrency(earnings?.netProfit),
      icon: Wallet,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Expenses',
      value: formatCurrency(earnings?.expenses),
      icon: CreditCard,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Pending Payouts',
      value: formatCurrency(earnings?.pendingPayouts),
      icon: PiggyBank,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={\`inline-flex p-2 rounded-lg mb-3 \${stat.color}\`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Earnings vs Expenses</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={earnings?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="period"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => '$' + (value >= 1000 ? (value / 1000) + 'k' : value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  borderColor: 'var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => '$' + value.toLocaleString()}
              />
              <Legend />
              <Bar dataKey="earnings" name="Earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate OccupancyChart for booking/space occupancy tracking
 */
export function generateOccupancyChart(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'OccupancyChart',
    endpoint = '/analytics/occupancy',
    title = 'Occupancy Rate',
    queryKey = 'occupancy-chart',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Loader2, Home, Calendar, TrendingUp, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface OccupancyData {
  currentOccupancy?: number;
  averageOccupancy?: number;
  totalUnits?: number;
  occupiedUnits?: number;
  availableUnits?: number;
  trend?: Array<{ date: string; occupancy: number }>;
}

interface ${componentName}Props {
  className?: string;
}

const COLORS = ['#10b981', '#e5e7eb'];

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: occupancy, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<OccupancyData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch occupancy data:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Occupied', value: occupancy?.occupiedUnits || 0 },
    { name: 'Available', value: occupancy?.availableUnits || 0 },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Status</h3>
            <span className={\`text-3xl font-bold \${
              (occupancy?.currentOccupancy || 0) > 80 ? 'text-green-600' :
              (occupancy?.currentOccupancy || 0) > 50 ? 'text-yellow-600' : 'text-red-600'
            }\`}>
              {occupancy?.currentOccupancy?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value + ' units', name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Occupied ({occupancy?.occupiedUnits || 0})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Available ({occupancy?.availableUnits || 0})
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 content-start">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Total Units</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {occupancy?.totalUnits || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Occupied</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {occupancy?.occupiedUnits || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Available</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {occupancy?.availableUnits || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Avg Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {occupancy?.averageOccupancy?.toFixed(1) || 0}%
            </div>
          </div>
        </div>
      </div>

      {occupancy?.trend && occupancy.trend.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Occupancy Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancy.trend}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(v) => v + '%'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    borderColor: 'var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [value.toFixed(1) + '%', 'Occupancy']}
                />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#occupancyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate SubscriberChart for subscription/newsletter tracking
 */
export function generateSubscriberChart(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'SubscriberChart',
    endpoint = '/analytics/subscribers',
    title = 'Subscriber Growth',
    queryKey = 'subscriber-chart',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, Users, UserPlus, UserMinus, Mail, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface SubscriberData {
  totalSubscribers?: number;
  newSubscribers?: number;
  unsubscribers?: number;
  netGrowth?: number;
  growthRate?: number;
  chartData?: Array<{
    date: string;
    total: number;
    new: number;
    unsubscribed: number;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<SubscriberData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch subscriber data:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Subscribers',
      value: subscribers?.totalSubscribers?.toLocaleString() || '0',
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'New This Month',
      value: '+' + (subscribers?.newSubscribers?.toLocaleString() || '0'),
      icon: UserPlus,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Unsubscribed',
      value: subscribers?.unsubscribers?.toLocaleString() || '0',
      icon: UserMinus,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Growth Rate',
      value: (subscribers?.growthRate?.toFixed(1) || '0') + '%',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={\`inline-flex p-2 rounded-lg mb-3 \${stat.color}\`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscriber Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={subscribers?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  borderColor: 'var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="new"
                name="New"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="unsubscribed"
                name="Unsubscribed"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate MemberGrowthChart for member growth visualization
 */
export function generateMemberGrowthChart(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'MemberGrowthChart',
    endpoint = '/analytics/member-growth',
    title = 'Member Growth',
    queryKey = 'member-growth-chart',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, Users, UserPlus, TrendingUp, Award } from 'lucide-react';
import { api } from '@/lib/api';

interface MemberGrowthData {
  totalMembers?: number;
  newMembers?: number;
  churnedMembers?: number;
  netGrowth?: number;
  monthlyGrowthRate?: number;
  chartData?: Array<{
    month: string;
    newMembers: number;
    churned: number;
    total: number;
    growthRate: number;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const [view, setView] = useState<'combined' | 'growth'>('combined');

  const { data: growth, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<MemberGrowthData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch member growth:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const isPositiveGrowth = (growth?.netGrowth || 0) >= 0;

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">${title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('combined')}
            className={\`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors \${
              view === 'combined'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }\`}
          >
            Combined
          </button>
          <button
            onClick={() => setView('growth')}
            className={\`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors \${
              view === 'growth'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }\`}
          >
            Growth Rate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Total Members</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {growth?.totalMembers?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium">New Members</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            +{growth?.newMembers?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">Net Growth</span>
          </div>
          <div className={\`text-2xl font-bold \${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}\`}>
            {isPositiveGrowth ? '+' : ''}{growth?.netGrowth?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Monthly Rate</span>
          </div>
          <div className={\`text-2xl font-bold \${
            (growth?.monthlyGrowthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }\`}>
            {growth?.monthlyGrowthRate?.toFixed(1) || 0}%
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {view === 'combined' ? 'Member Activity' : 'Growth Rate Trend'}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={growth?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                yAxisId="left"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              {view === 'growth' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(v) => v + '%'}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  borderColor: 'var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {view === 'combined' ? (
                <>
                  <Bar yAxisId="left" dataKey="newMembers" name="New" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="churned" name="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </>
              ) : (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="growthRate"
                  name="Growth Rate %"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate UtilizationReport for resource utilization tracking
 */
export function generateUtilizationReport(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'UtilizationReport',
    endpoint = '/reports/utilization',
    title = 'Resource Utilization',
    queryKey = 'utilization-report',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { Loader2, Cpu, Clock, Users, Zap, Activity, Server } from 'lucide-react';
import { api } from '@/lib/api';

interface UtilizationData {
  overallUtilization?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  activeUsers?: number;
  peakHours?: string;
  resources?: Array<{
    name: string;
    utilization: number;
    capacity: number;
    used: number;
  }>;
  hourlyData?: Array<{
    hour: string;
    utilization: number;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: report, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<UtilizationData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch utilization report:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const getUtilizationColor = (value: number) => {
    if (value >= 90) return 'text-red-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBg = (value: number) => {
    if (value >= 90) return 'bg-red-100 dark:bg-red-900/30';
    if (value >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-green-100 dark:bg-green-900/30';
  };

  const radialData = [
    { name: 'CPU', value: report?.cpuUsage || 0, fill: '#3b82f6' },
    { name: 'Memory', value: report?.memoryUsage || 0, fill: '#8b5cf6' },
    { name: 'Overall', value: report?.overallUtilization || 0, fill: '#10b981' },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Usage</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="90%"
                data={radialData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
                <Legend
                  iconSize={10}
                  layout="horizontal"
                  verticalAlign="bottom"
                />
                <Tooltip
                  formatter={(value: number) => [value + '%', 'Utilization']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 content-start">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Cpu className="w-4 h-4" />
              <span className="text-sm font-medium">CPU</span>
            </div>
            <div className={\`text-2xl font-bold \${getUtilizationColor(report?.cpuUsage || 0)}\`}>
              {report?.cpuUsage || 0}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Server className="w-4 h-4" />
              <span className="text-sm font-medium">Memory</span>
            </div>
            <div className={\`text-2xl font-bold \${getUtilizationColor(report?.memoryUsage || 0)}\`}>
              {report?.memoryUsage || 0}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {report?.activeUsers || 0}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Peak Hours</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {report?.peakHours || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {report?.resources && report.resources.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Breakdown</h3>
            <div className="space-y-4">
              {report.resources.map((resource, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{resource.name}</span>
                    <span className={\`font-medium \${getUtilizationColor(resource.utilization)}\`}>
                      {resource.utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`h-2 rounded-full transition-all \${
                        resource.utilization >= 90 ? 'bg-red-500' :
                        resource.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }\`}
                      style={{ width: \`\${resource.utilization}%\` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {resource.used} / {resource.capacity} units
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {report?.hourlyData && report.hourlyData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hourly Utilization</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="hour" className="text-xs" tick={{ fill: 'currentColor' }} />
                  <YAxis
                    domain={[0, 100]}
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(v) => v + '%'}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg, #fff)',
                      borderColor: 'var(--tooltip-border, #e5e7eb)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value + '%', 'Utilization']}
                  />
                  <Bar dataKey="utilization" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate FulfillmentReport for order fulfillment tracking
 */
export function generateFulfillmentReport(options: StatsWidgetOptions = {}): string {
  const {
    componentName = 'FulfillmentReport',
    endpoint = '/reports/fulfillment',
    title = 'Fulfillment Report',
    queryKey = 'fulfillment-report',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';

interface FulfillmentData {
  totalOrders?: number;
  fulfilled?: number;
  pending?: number;
  processing?: number;
  shipped?: number;
  delivered?: number;
  cancelled?: number;
  fulfillmentRate?: number;
  avgFulfillmentTime?: string;
  statusBreakdown?: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  dailyData?: Array<{
    date: string;
    fulfilled: number;
    pending: number;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const CHART_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: report, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<FulfillmentData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch fulfillment report:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const statusIcons: Record<string, React.FC<any>> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };

  const stats = [
    { label: 'Total Orders', value: report?.totalOrders || 0, icon: Package, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Fulfilled', value: report?.fulfilled || 0, icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Pending', value: report?.pending || 0, icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Shipped', value: report?.shipped || 0, icon: Truck, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={\`inline-flex p-2 rounded-lg mb-3 \${stat.color}\`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fulfillment Rate</h3>
            <span className={\`text-3xl font-bold \${
              (report?.fulfillmentRate || 0) >= 90 ? 'text-green-600' :
              (report?.fulfillmentRate || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
            }\`}>
              {report?.fulfillmentRate?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div
              className={\`h-3 rounded-full transition-all \${
                (report?.fulfillmentRate || 0) >= 90 ? 'bg-green-500' :
                (report?.fulfillmentRate || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }\`}
              style={{ width: \`\${report?.fulfillmentRate || 0}%\` }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Avg. Time: {report?.avgFulfillmentTime || 'N/A'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report?.statusBreakdown || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, percentage }) => \`\${status}: \${percentage}%\`}
                  labelLine={false}
                >
                  {(report?.statusBreakdown || []).map((entry, index) => (
                    <Cell
                      key={\`cell-\${index}\`}
                      fill={STATUS_COLORS[entry.status.toLowerCase()] || CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value + ' orders', name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {report?.dailyData && report.dailyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Fulfillment</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    borderColor: 'var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="fulfilled" name="Fulfilled" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {report?.statusBreakdown && report.statusBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Pipeline</h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {report.statusBreakdown.map((status, i) => {
              const Icon = statusIcons[status.status.toLowerCase()] || Package;
              return (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Icon className={\`w-5 h-5 \`} style={{ color: STATUS_COLORS[status.status.toLowerCase()] }} />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {status.status}
                      </div>
                      <div className="text-xs text-gray-500">{status.count} orders</div>
                    </div>
                  </div>
                  {i < report.statusBreakdown!.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 hidden sm:block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
