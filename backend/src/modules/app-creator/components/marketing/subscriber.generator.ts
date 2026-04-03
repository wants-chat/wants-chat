/**
 * Subscriber Component Generators
 *
 * Generates subscription/SaaS metrics components:
 * - SubscriberChart: Subscriber growth visualization
 * - SubscriberProfile: Individual subscriber details
 * - ChurnMetrics: Churn rate and analysis
 * - MrrStats: Monthly Recurring Revenue statistics
 * - PlanDistribution: Subscription plan breakdown
 */

export interface SubscriberChartOptions {
  componentName?: string;
  endpoint?: string;
  showGrowthRate?: boolean;
  showProjection?: boolean;
}

export function generateSubscriberChart(options: SubscriberChartOptions = {}): string {
  const {
    componentName = 'SubscriberChart',
    endpoint = '/subscribers/chart',
    showGrowthRate = true,
    showProjection = false,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, TrendingUp, TrendingDown, Calendar,
  ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  period?: '7d' | '30d' | '90d' | '12m';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  period: initialPeriod = '30d',
}) => {
  const [period, setPeriod] = useState(initialPeriod);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriber-chart', period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?period=\${period}\`);
      return response?.data || response || {
        totalSubscribers: 12450,
        newSubscribers: 845,
        churnedSubscribers: 123,
        netGrowth: 722,
        growthRate: 6.2,
        data: [
          { date: '2024-01-01', total: 11728, new: 180, churned: 45 },
          { date: '2024-01-08', total: 11863, new: 165, churned: 30 },
          { date: '2024-01-15', total: 12018, total: 185, churned: 30 },
          { date: '2024-01-22', total: 12250, new: 270, churned: 38 },
          { date: '2024-01-29', total: 12450, new: 245, churned: 45 },
        ],
      };
    },
  });

  const periods = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '12m', label: '12M' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isPositiveGrowth = (data?.growthRate || 0) >= 0;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscriber Growth</h2>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={\`px-3 py-1 text-sm rounded-md transition-colors \${
                period === p.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }\`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Subscribers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(data?.totalSubscribers || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">New</p>
            <p className="text-2xl font-bold text-green-600">
              +{(data?.newSubscribers || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Churned</p>
            <p className="text-2xl font-bold text-red-600">
              -{(data?.churnedSubscribers || 0).toLocaleString()}
            </p>
          </div>
          <div className={\`rounded-xl p-4 \${
            isPositiveGrowth
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-orange-50 dark:bg-orange-900/20'
          }\`}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Growth</p>
            <div className="flex items-center gap-2">
              <p className={\`text-2xl font-bold \${
                isPositiveGrowth ? 'text-blue-600' : 'text-orange-600'
              }\`}>
                {isPositiveGrowth ? '+' : ''}{(data?.netGrowth || 0).toLocaleString()}
              </p>
              ${showGrowthRate ? `<span className={\`flex items-center text-sm \${
                isPositiveGrowth ? 'text-green-600' : 'text-red-600'
              }\`}>
                {isPositiveGrowth ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {Math.abs(data?.growthRate || 0).toFixed(1)}%
              </span>` : ''}
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Subscriber growth chart will render here</p>
            <p className="text-sm">Integrate with Recharts, Chart.js, or similar</p>
          </div>
        </div>

        ${showProjection ? `{/* Growth Projection */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Growth Projection</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            At current growth rate, you'll reach <strong>15,000 subscribers</strong> in approximately <strong>3 months</strong>.
          </p>
        </div>` : ''}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface SubscriberProfileOptions {
  componentName?: string;
  endpoint?: string;
  showActivity?: boolean;
  showSubscription?: boolean;
}

export function generateSubscriberProfile(options: SubscriberProfileOptions = {}): string {
  const {
    componentName = 'SubscriberProfile',
    endpoint = '/subscribers',
    showActivity = true,
    showSubscription = true,
  } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  User, Mail, Calendar, CreditCard, Clock,
  Activity, Tag, MapPin, Globe, Phone,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  subscriberId?: string;
  subscriber?: any;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  subscriberId: propId,
  subscriber: propSubscriber,
  className,
}) => {
  const { id: paramId } = useParams();
  const subscriberId = propId || paramId;

  const { data: fetchedSubscriber, isLoading } = useQuery({
    queryKey: ['subscriber', subscriberId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${subscriberId}\`);
      return response?.data || response;
    },
    enabled: !propSubscriber && !!subscriberId,
  });

  const subscriber = propSubscriber || fetchedSubscriber;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="text-center py-12 text-gray-500">
        Subscriber not found
      </div>
    );
  }

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      trialing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      past_due: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      canceled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      paused: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || colors.active;
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          {subscriber.avatar ? (
            <img
              src={subscriber.avatar}
              alt={subscriber.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {subscriber.name?.charAt(0) || subscriber.email?.charAt(0) || 'S'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {subscriber.name || 'Unknown'}
              </h1>
              <span className={\`px-2.5 py-0.5 text-xs font-medium rounded-full \${getStatusColor(subscriber.status)}\`}>
                {subscriber.status?.charAt(0).toUpperCase() + subscriber.status?.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{subscriber.email}</span>
              </div>
              {subscriber.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{subscriber.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${showSubscription ? `{/* Subscription Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">Plan</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {subscriber.plan_name || 'Free'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">MRR</span>
              <span className="font-medium text-gray-900 dark:text-white">
                \${(subscriber.mrr || 0).toFixed(2)}/mo
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">Subscribed Since</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(subscriber.subscribed_at)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">Next Billing</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(subscriber.next_billing_date)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">Lifetime Value</span>
              <span className="font-medium text-green-600">
                \${(subscriber.ltv || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>` : ''}

        ${showActivity ? `{/* Activity */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">Last Login</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {subscriber.last_login ? formatDate(subscriber.last_login) : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sessions (30d)</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {subscriber.sessions_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">Feature Usage</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {subscriber.feature_usage_percent || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <span className="text-sm text-gray-500 dark:text-gray-400">Email Verified</span>
              <span>
                {subscriber.email_verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </span>
            </div>
          </div>
        </div>` : ''}
      </div>

      {/* Tags/Segments */}
      {subscriber.tags && subscriber.tags.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tags & Segments
          </h3>
          <div className="flex flex-wrap gap-2">
            {subscriber.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface ChurnMetricsOptions {
  componentName?: string;
  endpoint?: string;
  showReasons?: boolean;
  showCohorts?: boolean;
}

export function generateChurnMetrics(options: ChurnMetricsOptions = {}): string {
  const {
    componentName = 'ChurnMetrics',
    endpoint = '/subscribers/churn',
    showReasons = true,
    showCohorts = false,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserMinus, TrendingDown, AlertTriangle,
  DollarSign, Users, Calendar, BarChart3, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  period?: '30d' | '90d' | '12m';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  period: initialPeriod = '30d',
}) => {
  const [period, setPeriod] = useState(initialPeriod);

  const { data, isLoading } = useQuery({
    queryKey: ['churn-metrics', period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?period=\${period}\`);
      return response?.data || response || {
        churnRate: 4.2,
        churnRateChange: -0.5,
        churnedCustomers: 52,
        churnedMrr: 4680,
        avgCustomerLifespan: 18.5,
        atRiskCustomers: 34,
        netRevenueRetention: 108,
        ${showReasons ? `reasons: [
          { reason: 'Too expensive', count: 18, percent: 34.6 },
          { reason: 'Found alternative', count: 12, percent: 23.1 },
          { reason: 'No longer needed', count: 10, percent: 19.2 },
          { reason: 'Missing features', count: 8, percent: 15.4 },
          { reason: 'Poor support', count: 4, percent: 7.7 },
        ],` : ''}
      };
    },
  });

  const periods = [
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '12m', label: '12 Months' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isChurnImproving = (data?.churnRateChange || 0) < 0;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <UserMinus className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Churn Analysis</h2>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Churn Rate */}
          <div className={\`rounded-xl p-4 \${
            isChurnImproving
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          }\`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Churn Rate</span>
              <TrendingDown className={\`w-4 h-4 \${
                isChurnImproving ? 'text-green-500' : 'text-red-500'
              }\`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {(data?.churnRate || 0).toFixed(1)}%
            </p>
            <p className={\`text-xs mt-1 \${
              isChurnImproving ? 'text-green-600' : 'text-red-600'
            }\`}>
              {isChurnImproving ? '' : '+'}{(data?.churnRateChange || 0).toFixed(1)}% vs prev
            </p>
          </div>

          {/* Churned Customers */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Churned</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {data?.churnedCustomers || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">customers</p>
          </div>

          {/* Lost MRR */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Lost MRR</span>
              <DollarSign className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              \${(data?.churnedMrr || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">this period</p>
          </div>

          {/* At Risk */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">At Risk</span>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {data?.atRiskCustomers || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">customers</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Customer Lifespan</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {(data?.avgCustomerLifespan || 0).toFixed(1)} months
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Net Revenue Retention</span>
            </div>
            <span className={\`font-semibold \${
              (data?.netRevenueRetention || 0) >= 100 ? 'text-green-600' : 'text-red-600'
            }\`}>
              {data?.netRevenueRetention || 0}%
            </span>
          </div>
        </div>

        ${showReasons ? `{/* Churn Reasons */}
        {data?.reasons && data.reasons.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Top Churn Reasons
            </h3>
            <div className="space-y-3">
              {data.reasons.map((item: any, index: number) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.reason}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.count} ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: \`\${item.percent}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}` : ''}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface MrrStatsOptions {
  componentName?: string;
  endpoint?: string;
  showBreakdown?: boolean;
  showChart?: boolean;
}

export function generateMrrStats(options: MrrStatsOptions = {}): string {
  const {
    componentName = 'MrrStats',
    endpoint = '/subscribers/mrr',
    showBreakdown = true,
    showChart = true,
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Users,
  Repeat, UserPlus, UserMinus, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['mrr-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        currentMrr: 125000,
        mrrGrowth: 8.5,
        arr: 1500000,
        avgRevenuePerUser: 42.50,
        totalCustomers: 2941,
        ${showBreakdown ? `breakdown: {
          newMrr: 12500,
          expansionMrr: 8200,
          contractionMrr: -2100,
          churnedMrr: -4800,
          netNewMrr: 13800,
        },` : ''}
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isPositiveGrowth = (data?.mrrGrowth || 0) >= 0;

  return (
    <div className={\`\${className || ''}\`}>
      {/* Main MRR Card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-100 text-sm mb-1">Monthly Recurring Revenue</p>
            <p className="text-4xl font-bold">\${(data?.currentMrr || 0).toLocaleString()}</p>
          </div>
          <div className={\`flex items-center gap-1 px-3 py-1.5 rounded-full \${
            isPositiveGrowth ? 'bg-green-400/30' : 'bg-red-400/30'
          }\`}>
            {isPositiveGrowth ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span className="font-medium">{Math.abs(data?.mrrGrowth || 0).toFixed(1)}%</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-green-100 text-xs mb-1">ARR</p>
            <p className="text-lg font-semibold">\${((data?.arr || 0) / 1000000).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-green-100 text-xs mb-1">ARPU</p>
            <p className="text-lg font-semibold">\${(data?.avgRevenuePerUser || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-green-100 text-xs mb-1">Customers</p>
            <p className="text-lg font-semibold">{(data?.totalCustomers || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      ${showBreakdown ? `{/* MRR Breakdown */}
      {data?.breakdown && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">MRR Movement</h3>
          <div className="space-y-4">
            {/* New MRR */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New MRR</span>
              </div>
              <span className="font-semibold text-green-600">
                +\${(data.breakdown.newMrr || 0).toLocaleString()}
              </span>
            </div>

            {/* Expansion MRR */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expansion MRR</span>
              </div>
              <span className="font-semibold text-blue-600">
                +\${(data.breakdown.expansionMrr || 0).toLocaleString()}
              </span>
            </div>

            {/* Contraction MRR */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraction MRR</span>
              </div>
              <span className="font-semibold text-yellow-600">
                \${(data.breakdown.contractionMrr || 0).toLocaleString()}
              </span>
            </div>

            {/* Churned MRR */}
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <UserMinus className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Churned MRR</span>
              </div>
              <span className="font-semibold text-red-600">
                \${(data.breakdown.churnedMrr || 0).toLocaleString()}
              </span>
            </div>

            {/* Net New MRR */}
            <div className={\`flex items-center justify-between p-4 rounded-lg border-2 \${
              (data.breakdown.netNewMrr || 0) >= 0
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
            }\`}>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Net New MRR</span>
              <span className={\`text-lg font-bold \${
                (data.breakdown.netNewMrr || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }\`}>
                {(data.breakdown.netNewMrr || 0) >= 0 ? '+' : ''}\${(data.breakdown.netNewMrr || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}` : ''}

      ${showChart ? `{/* Chart Placeholder */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">MRR Trend</h3>
        <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>MRR chart will render here</p>
          </div>
        </div>
      </div>` : ''}
    </div>
  );
};

export default ${componentName};
`;
}

export interface PlanDistributionOptions {
  componentName?: string;
  endpoint?: string;
  showChart?: boolean;
  showTable?: boolean;
}

export function generatePlanDistribution(options: PlanDistributionOptions = {}): string {
  const {
    componentName = 'PlanDistribution',
    endpoint = '/subscribers/plans',
    showChart = true,
    showTable = true,
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart, Users, DollarSign, TrendingUp, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['plan-distribution'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        plans: [
          { name: 'Free', customers: 1250, mrr: 0, percent: 42.5, color: 'gray' },
          { name: 'Starter', customers: 890, mrr: 8900, percent: 30.3, color: 'blue' },
          { name: 'Pro', customers: 620, mrr: 30990, percent: 21.1, color: 'purple' },
          { name: 'Enterprise', customers: 181, mrr: 85070, percent: 6.2, color: 'green' },
        ],
        totalCustomers: 2941,
        totalMrr: 124960,
        conversionRate: 57.5,
      };
    },
  });

  const colorClasses: Record<string, { bg: string; bar: string; text: string }> = {
    gray: { bg: 'bg-gray-100 dark:bg-gray-700', bar: 'bg-gray-500', text: 'text-gray-600' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', bar: 'bg-blue-500', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', bar: 'bg-purple-500', text: 'text-purple-600' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', bar: 'bg-green-500', text: 'text-green-600' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', bar: 'bg-orange-500', text: 'text-orange-600' },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <PieChart className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Distribution</h2>
      </div>

      <div className="p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {(data?.totalCustomers || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Customers</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              \${(data?.totalMrr || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total MRR</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {data?.conversionRate || 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Paid Conversion</p>
          </div>
        </div>

        ${showChart ? `{/* Visual Distribution */}
        <div className="mb-6">
          <div className="flex h-4 rounded-full overflow-hidden">
            {data?.plans?.map((plan: any, index: number) => {
              const colors = colorClasses[plan.color] || colorClasses.gray;
              return (
                <div
                  key={index}
                  className={\`\${colors.bar} transition-all\`}
                  style={{ width: \`\${plan.percent}%\` }}
                  title={\`\${plan.name}: \${plan.percent}%\`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {data?.plans?.map((plan: any, index: number) => {
              const colors = colorClasses[plan.color] || colorClasses.gray;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className={\`w-3 h-3 rounded-full \${colors.bar}\`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.name} ({plan.percent}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>` : ''}

        ${showTable ? `{/* Plan Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Plan</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Customers</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">MRR</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">% Share</th>
              </tr>
            </thead>
            <tbody>
              {data?.plans?.map((plan: any, index: number) => {
                const colors = colorClasses[plan.color] || colorClasses.gray;
                return (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={\`w-2.5 h-2.5 rounded-full \${colors.bar}\`} />
                        <span className="font-medium text-gray-900 dark:text-white">{plan.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                      {(plan.customers || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      \${(plan.mrr || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${colors.bg} \${colors.text}\`}>
                        {plan.percent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>` : ''}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
