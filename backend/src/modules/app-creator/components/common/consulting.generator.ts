/**
 * Consulting Component Generators
 *
 * Generates consulting-specific components for stats, invoices, and revenue reports.
 */

export interface ConsultingStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export interface InvoiceStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export interface RevenueReportOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate a ConsultingStats component showing consulting metrics
 */
export function generateConsultingStats(options: ConsultingStatsOptions = {}): string {
  const { componentName = 'ConsultingStats', endpoint = '/consulting/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Award,
  FileText,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  variant?: 'compact' | 'detailed';
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, variant = 'detailed' }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['consulting-stats'],
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

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[...Array(variant === 'compact' ? 4 : 8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const primaryStats = [
    {
      label: 'Monthly Revenue',
      value: stats?.monthly_revenue || 0,
      change: stats?.revenue_change,
      icon: DollarSign,
      color: 'green',
      format: 'currency',
    },
    {
      label: 'Active Clients',
      value: stats?.active_clients || 0,
      change: stats?.clients_change,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Active Projects',
      value: stats?.active_projects || 0,
      icon: Briefcase,
      color: 'purple',
    },
    {
      label: 'Billable Hours',
      value: stats?.billable_hours || 0,
      change: stats?.hours_change,
      icon: Clock,
      color: 'orange',
      suffix: 'hrs',
    },
  ];

  const secondaryStats = [
    {
      label: 'Avg. Project Value',
      value: stats?.avg_project_value || 0,
      icon: Target,
      color: 'cyan',
      format: 'currency',
    },
    {
      label: 'Utilization Rate',
      value: stats?.utilization_rate || 0,
      icon: BarChart3,
      color: 'indigo',
      suffix: '%',
    },
    {
      label: 'Client Retention',
      value: stats?.client_retention || 0,
      icon: Award,
      color: 'emerald',
      suffix: '%',
    },
    {
      label: 'Proposals Sent',
      value: stats?.proposals_sent || 0,
      icon: FileText,
      color: 'yellow',
    },
  ];

  const allStats = variant === 'compact' ? primaryStats : [...primaryStats, ...secondaryStats];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: 'text-cyan-600 dark:text-cyan-400' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-600 dark:text-yellow-400' },
  };

  const formatValue = (value: number, format?: string, suffix?: string) => {
    if (format === 'currency') return '\$' + value.toLocaleString();
    return value.toLocaleString() + (suffix || '');
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className={cn('grid grid-cols-1 md:grid-cols-2', variant === 'detailed' ? 'lg:grid-cols-4' : 'lg:grid-cols-4', 'gap-4')}>
        {allStats.map((stat, index) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-lg', colors.bg)}>
                  <Icon className={cn('w-6 h-6', colors.icon)} />
                </div>
                {stat.change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {stat.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatValue(stat.value, stat.format, stat.suffix)}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Additional Metrics for detailed view */}
      {variant === 'detailed' && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Pipeline Value */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pipeline Value</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Proposals</span>
                <span className="font-medium text-gray-900 dark:text-white">\${(stats?.pipeline_proposals || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Negotiations</span>
                <span className="font-medium text-gray-900 dark:text-white">\${(stats?.pipeline_negotiations || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Verbal Commits</span>
                <span className="font-medium text-gray-900 dark:text-white">\${(stats?.pipeline_commits || 0).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">Total Pipeline</span>
                <span className="font-bold text-blue-600">\${(stats?.total_pipeline || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Top Performing Projects */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Projects</h3>
            <div className="space-y-3">
              {stats?.top_projects?.slice(0, 4).map((project: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 truncate flex-1 mr-2">{project.name}</span>
                  <span className="font-medium text-green-600">\${(project.revenue || 0).toLocaleString()}</span>
                </div>
              )) || (
                <p className="text-gray-500">No projects data</p>
              )}
            </div>
          </div>

          {/* Revenue by Service */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Service</h3>
            <div className="space-y-3">
              {stats?.revenue_by_service?.slice(0, 4).map((service: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{service.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{service.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: \`\${service.percentage}%\` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">No service data</p>
              )}
            </div>
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
 * Generate an InvoiceStatsConsulting component
 */
export function generateInvoiceStatsConsulting(options: InvoiceStatsOptions = {}): string {
  const { componentName = 'InvoiceStatsConsulting', endpoint = '/invoices/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Send,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch invoice stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Outstanding',
      value: stats?.total_outstanding || 0,
      icon: DollarSign,
      color: 'blue',
      format: 'currency',
    },
    {
      label: 'Overdue Amount',
      value: stats?.overdue_amount || 0,
      icon: AlertTriangle,
      color: 'red',
      format: 'currency',
    },
    {
      label: 'Paid This Month',
      value: stats?.paid_this_month || 0,
      icon: CheckCircle,
      color: 'green',
      format: 'currency',
    },
    {
      label: 'Avg. Payment Time',
      value: stats?.avg_payment_days || 0,
      icon: Clock,
      color: 'purple',
      suffix: ' days',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400', text: 'text-blue-600' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400', text: 'text-red-600' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400', text: 'text-purple-600' },
  };

  const formatValue = (value: number, format?: string, suffix?: string) => {
    if (format === 'currency') return '\$' + value.toLocaleString();
    return value.toLocaleString() + (suffix || '');
  };

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Current billing status</p>
          </div>
          <Link
            to="/invoices/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Send className="w-4 h-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-200 dark:divide-gray-700">
        {statCards.map((stat, index) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;

          return (
            <div key={index} className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('p-2 rounded-lg', colors.bg)}>
                  <Icon className={cn('w-5 h-5', colors.icon)} />
                </div>
              </div>
              <div className={cn('text-2xl font-bold mb-1', stat.color === 'red' ? 'text-red-600' : 'text-gray-900 dark:text-white')}>
                {formatValue(stat.value, stat.format, stat.suffix)}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Invoice Summary */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.draft_count || 0}</div>
            <div className="text-sm text-gray-500">Drafts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats?.sent_count || 0}</div>
            <div className="text-sm text-gray-500">Sent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending_count || 0}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{stats?.overdue_count || 0}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      {stats?.recent_invoices?.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/30">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Invoices</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats.recent_invoices.slice(0, 5).map((invoice: any) => (
              <Link
                key={invoice.id}
                to={\`/invoices/\${invoice.id}\`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{invoice.number || \`#\${invoice.id}\`}</p>
                    <p className="text-sm text-gray-500">{invoice.client_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">\${(invoice.amount || 0).toLocaleString()}</p>
                  <p className={\`text-sm \${
                    invoice.status === 'paid' ? 'text-green-600' :
                    invoice.status === 'overdue' ? 'text-red-600' :
                    'text-yellow-600'
                  }\`}>
                    {invoice.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <Link to="/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all invoices
              <ChevronRight className="w-4 h-4" />
            </Link>
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
 * Generate a RevenueReportConsulting component
 */
export function generateRevenueReportConsulting(options: RevenueReportOptions = {}): string {
  const { componentName = 'RevenueReportConsulting', endpoint = '/reports/revenue' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Users,
  Briefcase,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
}

type Period = 'week' | 'month' | 'quarter' | 'year';
type ViewMode = 'overview' | 'by-client' | 'by-service' | 'by-consultant';

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: report, isLoading } = useQuery({
    queryKey: ['revenue-report', period, selectedYear, viewMode],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?period=\${period}&year=\${selectedYear}&view=\${viewMode}\`);
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch revenue report:', err);
        return {};
      }
    },
  });

  const periods: { value: Period; label: string }[] = [
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' },
  ];

  const viewModes: { value: ViewMode; label: string; icon: React.ElementType }[] = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'by-client', label: 'By Client', icon: Users },
    { value: 'by-service', label: 'By Service', icon: PieChart },
    { value: 'by-consultant', label: 'By Consultant', icon: Briefcase },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => '\$' + value.toLocaleString();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Report</h1>
            <p className="text-gray-500 mt-1">Track your consulting revenue and trends</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Period Selector */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    period === p.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-4 mt-6 border-b border-gray-200 dark:border-gray-700 -mx-6 px-6">
          {viewModes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setViewMode(mode.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                viewMode === mode.value
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            {report?.revenue_change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-sm font-medium',
                report.revenue_change >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {report.revenue_change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(report.revenue_change)}%
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(report?.total_revenue || 0)}
          </div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 w-fit mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(report?.avg_monthly_revenue || 0)}
          </div>
          <div className="text-sm text-gray-500">Avg. Monthly Revenue</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 w-fit mb-4">
            <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {report?.total_projects || 0}
          </div>
          <div className="text-sm text-gray-500">Total Projects</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 w-fit mb-4">
            <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {report?.total_clients || 0}
          </div>
          <div className="text-sm text-gray-500">Active Clients</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h2>

          {viewMode === 'overview' && (
            <div className="space-y-4">
              {report?.monthly_data?.map((month: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-500">{month.label}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                          style={{ width: \`\${(month.revenue / (report?.max_monthly || 1)) * 100}%\` }}
                        />
                      </div>
                      <span className="w-24 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          )}

          {viewMode === 'by-client' && (
            <div className="space-y-3">
              {report?.by_client?.map((client: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.projects} projects</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(client.revenue)}</p>
                    <p className="text-sm text-gray-500">{client.percentage}% of total</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">No client data available</p>
              )}
            </div>
          )}

          {viewMode === 'by-service' && (
            <div className="space-y-4">
              {report?.by_service?.map((service: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                    <span className="text-sm text-gray-500">{service.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: \`\${service.percentage}%\` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{formatCurrency(service.revenue)}</p>
                </div>
              )) || (
                <p className="text-gray-500">No service data available</p>
              )}
            </div>
          )}

          {viewMode === 'by-consultant' && (
            <div className="space-y-3">
              {report?.by_consultant?.map((consultant: any, index: number) => (
                <div key={index} className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {consultant.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{consultant.name}</p>
                    <p className="text-sm text-gray-500">{consultant.hours}h billed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatCurrency(consultant.revenue)}</p>
                    <p className="text-sm text-gray-500">{consultant.utilization}% utilization</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">No consultant data available</p>
              )}
            </div>
          )}
        </div>

        {/* Side Stats */}
        <div className="space-y-6">
          {/* Top Clients */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Clients</h3>
            <div className="space-y-3">
              {report?.top_clients?.slice(0, 5).map((client: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={\`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium \${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }\`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate">{client.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(client.revenue)}</span>
                </div>
              )) || (
                <p className="text-gray-500">No client data</p>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Payments</h3>
            <div className="space-y-3">
              {report?.recent_payments?.slice(0, 5).map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{payment.client_name}</p>
                    <p className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                  </div>
                  <span className="font-medium text-green-600">+{formatCurrency(payment.amount)}</span>
                </div>
              )) || (
                <p className="text-gray-500">No recent payments</p>
              )}
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
