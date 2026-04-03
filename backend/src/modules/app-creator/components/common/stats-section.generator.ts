/**
 * Stats Section Generator
 *
 * Generates stats section components including:
 * - StatsSection (generic stats display)
 * - BillingSummary
 * - CommissionSummary
 */

export interface StatsSectionOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
  queryKey?: string;
}

/**
 * Generate StatsSection component with customizable stats cards
 */
export function generateStatsSection(options: StatsSectionOptions = {}): string {
  const {
    componentName = 'StatsSection',
    endpoint = '/stats',
    title = 'Statistics',
    queryKey = 'stats-section',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';

interface StatItem {
  key: string;
  label: string;
  value: number | string;
  change?: number;
  type?: 'number' | 'currency' | 'percentage';
  icon?: string;
  color?: string;
}

interface StatsData {
  stats?: StatItem[];
  chartData?: Array<{ label: string; value: number }>;
  chartType?: 'bar' | 'line';
}

interface ${componentName}Props {
  className?: string;
  showChart?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, showChart = true }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<StatsData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const formatValue = (value: number | string | undefined, type?: string) => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'string') return value;
    if (type === 'currency') return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (type === 'percentage') return value.toFixed(1) + '%';
    return value.toLocaleString();
  };

  const getColorClasses = (color?: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
      green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
      orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
      red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
      yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
      indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
      emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    };
    return colors[color || 'blue'] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || [];
  const chartData = data?.chartData || [];
  const chartType = data?.chartType || 'bar';

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => {
            const colorClasses = getColorClasses(stat.color);
            const hasChange = stat.change !== undefined && stat.change !== null;
            const isPositive = (stat.change || 0) >= 0;

            return (
              <div
                key={stat.key || i}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={\`p-2.5 rounded-lg \${colorClasses.bg}\`}>
                    <Activity className={\`w-5 h-5 \${colorClasses.text}\`} />
                  </div>
                  {hasChange && (
                    <div className={\`flex items-center gap-1 text-sm font-medium \${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }\`}>
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(stat.change || 0).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatValue(stat.value, stat.type)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showChart && chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" className="text-xs" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg, #fff)',
                      borderColor: 'var(--tooltip-border, #e5e7eb)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="label" className="text-xs" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg, #fff)',
                      borderColor: 'var(--tooltip-border, #e5e7eb)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
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
 * Generate BillingSummary component for billing/invoice overview
 */
export function generateBillingSummary(options: StatsSectionOptions = {}): string {
  const {
    componentName = 'BillingSummary',
    endpoint = '/billing/summary',
    title = 'Billing Summary',
    queryKey = 'billing-summary',
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Loader2,
  DollarSign,
  CreditCard,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Download,
} from 'lucide-react';
import { api } from '@/lib/api';

interface BillingData {
  totalBilled?: number;
  totalPaid?: number;
  totalOutstanding?: number;
  totalOverdue?: number;
  invoiceCount?: number;
  paidInvoices?: number;
  pendingInvoices?: number;
  overdueInvoices?: number;
  paymentMethodBreakdown?: Array<{ method: string; amount: number; count: number }>;
  monthlyBilling?: Array<{ month: string; billed: number; collected: number }>;
  recentInvoices?: Array<{
    id: string;
    number: string;
    amount: number;
    status: string;
    dueDate: string;
    customer?: string;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: billing, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<BillingData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch billing summary:', err);
        return {};
      }
    },
  });

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '$0.00';
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
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

  const summaryCards = [
    {
      label: 'Total Billed',
      value: formatCurrency(billing?.totalBilled),
      icon: Receipt,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Total Collected',
      value: formatCurrency(billing?.totalPaid),
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(billing?.totalOutstanding),
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Overdue',
      value: formatCurrency(billing?.totalOverdue),
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={\`inline-flex p-2.5 rounded-lg mb-3 \${card.color}\`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{billing?.paidInvoices || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Paid</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600">{billing?.pendingInvoices || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{billing?.overdueInvoices || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </div>
        </div>

        {billing?.paymentMethodBreakdown && billing.paymentMethodBreakdown.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={billing.paymentMethodBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="method"
                  >
                    {billing.paymentMethodBreakdown.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {billing?.monthlyBilling && billing.monthlyBilling.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Billing vs Collection</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={billing.monthlyBilling}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(v) => '$' + (v >= 1000 ? (v / 1000) + 'k' : v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    borderColor: 'var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="billed" name="Billed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {billing?.recentInvoices && billing.recentInvoices.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {billing.recentInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(invoice.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{invoice.number}</span>
                    <span className={\`text-xs px-2 py-0.5 rounded-full capitalize \${getStatusColor(invoice.status)}\`}>
                      {invoice.status}
                    </span>
                  </div>
                  {invoice.customer && (
                    <div className="text-sm text-gray-500">{invoice.customer}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</div>
                  <div className="text-xs text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              </div>
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

/**
 * Generate CommissionSummary component for affiliate/sales commission tracking
 */
export function generateCommissionSummary(options: StatsSectionOptions = {}): string {
  const {
    componentName = 'CommissionSummary',
    endpoint = '/commissions/summary',
    title = 'Commission Summary',
    queryKey = 'commission-summary',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Percent,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
} from 'lucide-react';
import { api } from '@/lib/api';

interface CommissionData {
  totalCommissions?: number;
  pendingCommissions?: number;
  paidCommissions?: number;
  commissionChange?: number;
  totalSales?: number;
  commissionRate?: number;
  totalAffiliates?: number;
  topPerformers?: Array<{
    id: string;
    name: string;
    sales: number;
    commission: number;
    avatar?: string;
  }>;
  tierBreakdown?: Array<{
    tier: string;
    affiliates: number;
    commission: number;
    rate: number;
  }>;
  monthlyData?: Array<{
    month: string;
    sales: number;
    commissions: number;
  }>;
}

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: commission, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<CommissionData>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch commission summary:', err);
        return {};
      }
    },
  });

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '$0.00';
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

  const isPositiveChange = (commission?.commissionChange || 0) >= 0;

  const summaryCards = [
    {
      label: 'Total Commissions',
      value: formatCurrency(commission?.totalCommissions),
      change: commission?.commissionChange,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Pending Payout',
      value: formatCurrency(commission?.pendingCommissions),
      icon: Wallet,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Already Paid',
      value: formatCurrency(commission?.paidCommissions),
      icon: CreditCard,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Commission Rate',
      value: (commission?.commissionRate || 0).toFixed(1) + '%',
      icon: Percent,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className={className}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">${title}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className={\`p-2.5 rounded-lg \${card.color}\`}>
                <card.icon className="w-5 h-5" />
              </div>
              {card.change !== undefined && (
                <div className={\`flex items-center gap-1 text-sm font-medium \${
                  card.change >= 0 ? 'text-green-600' : 'text-red-600'
                }\`}>
                  {card.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(card.change).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">Total Sales</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(commission?.totalSales)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-gray-600 dark:text-gray-400">Active Affiliates</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {commission?.totalAffiliates || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Percent className="w-5 h-5 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">Avg. Commission Rate</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {commission?.commissionRate?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
        </div>

        {commission?.topPerformers && commission.topPerformers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performers</h3>
            </div>
            <div className="space-y-3">
              {commission.topPerformers.slice(0, 5).map((performer, i) => (
                <div key={performer.id} className="flex items-center gap-3">
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold \${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-200 text-gray-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }\`}>
                    {i + 1}
                  </div>
                  {performer.avatar ? (
                    <img
                      src={performer.avatar}
                      alt={performer.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">
                      {performer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{performer.name}</div>
                    <div className="text-sm text-gray-500">{formatCurrency(performer.sales)} in sales</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{formatCurrency(performer.commission)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {commission?.tierBreakdown && commission.tierBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission Tiers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium">Tier</th>
                  <th className="pb-3 font-medium">Affiliates</th>
                  <th className="pb-3 font-medium">Rate</th>
                  <th className="pb-3 font-medium text-right">Total Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {commission.tierBreakdown.map((tier, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{tier.tier}</span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{tier.affiliates}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                        {tier.rate}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(tier.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {commission?.monthlyData && commission.monthlyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales & Commissions Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={commission.monthlyData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'currentColor' }} />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(v) => '$' + (v >= 1000 ? (v / 1000) + 'k' : v)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    borderColor: 'var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="commissions"
                  name="Commissions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#commissionGradient)"
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
