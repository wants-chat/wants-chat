/**
 * Law Firm Stats Component Generators
 *
 * Generates dashboard statistics components for law firm applications.
 */

export interface LawfirmOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLawfirmStats(options: LawfirmOptions = {}): string {
  const { componentName = 'LawfirmStats', endpoint = '/lawfirm/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Scale, Users, DollarSign, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, FileText, Briefcase, Calendar, Gavel } from 'lucide-react';
import { api } from '@/lib/api';

interface LawfirmStatistics {
  // Case statistics
  total_cases: number;
  active_cases: number;
  pending_cases: number;
  closed_cases: number;
  cases_this_month: number;
  cases_trend: number;

  // Client statistics
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  clients_trend: number;

  // Financial statistics
  total_revenue: number;
  revenue_this_month: number;
  revenue_trend: number;
  outstanding_invoices: number;
  overdue_invoices: number;
  total_trust_balance: number;
  billable_hours_this_month: number;
  average_hourly_rate: number;

  // Attorney statistics
  total_attorneys: number;
  attorneys_billable_hours: number;
  top_performing_attorney?: {
    id: string;
    name: string;
    cases_won: number;
    revenue_generated: number;
  };

  // Task & deadline statistics
  upcoming_deadlines: number;
  overdue_tasks: number;
  hearings_this_week: number;
  filings_due_this_week: number;

  // Performance metrics
  win_rate: number;
  average_case_duration: number;
  client_satisfaction_rate?: number;

  // Practice area breakdown
  practice_area_breakdown?: {
    area: string;
    case_count: number;
    revenue: number;
  }[];
}

interface LawfirmStatsProps {
  showFinancials?: boolean;
  showPerformance?: boolean;
  compact?: boolean;
}

const ${componentName}: React.FC<LawfirmStatsProps> = ({
  showFinancials = true,
  showPerformance = true,
  compact = false
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['lawfirm-stats'],
    queryFn: async () => {
      const response = await api.get<LawfirmStatistics>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toLocaleString();
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_cases}</p>
              <p className="text-xs text-gray-500">Active Cases</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_clients}</p>
              <p className="text-xs text-gray-500">Active Clients</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming_deadlines}</p>
              <p className="text-xs text-gray-500">Deadlines</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.revenue_this_month)}</p>
              <p className="text-xs text-gray-500">This Month</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/cases" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
            {stats.cases_trend !== undefined && (
              <div className={\`flex items-center gap-1 text-sm \${getTrendColor(stats.cases_trend)}\`}>
                {getTrendIcon(stats.cases_trend)}
                {Math.abs(stats.cases_trend)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active_cases}</p>
          <p className="text-sm text-gray-500 mt-1">Active Cases</p>
          <p className="text-xs text-gray-400 mt-2">{stats.total_cases} total</p>
        </Link>

        <Link to="/clients" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            {stats.clients_trend !== undefined && (
              <div className={\`flex items-center gap-1 text-sm \${getTrendColor(stats.clients_trend)}\`}>
                {getTrendIcon(stats.clients_trend)}
                {Math.abs(stats.clients_trend)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active_clients}</p>
          <p className="text-sm text-gray-500 mt-1">Active Clients</p>
          <p className="text-xs text-gray-400 mt-2">+{stats.new_clients_this_month} this month</p>
        </Link>

        <Link to="/attorneys" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_attorneys}</p>
          <p className="text-sm text-gray-500 mt-1">Attorneys</p>
          <p className="text-xs text-gray-400 mt-2">{stats.attorneys_billable_hours.toFixed(1)}h billed</p>
        </Link>

        {showFinancials && (
          <Link to="/billing" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              {stats.revenue_trend !== undefined && (
                <div className={\`flex items-center gap-1 text-sm \${getTrendColor(stats.revenue_trend)}\`}>
                  {getTrendIcon(stats.revenue_trend)}
                  {Math.abs(stats.revenue_trend)}%
                </div>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.revenue_this_month)}</p>
            <p className="text-sm text-gray-500 mt-1">Revenue This Month</p>
            <p className="text-xs text-gray-400 mt-2">{formatCurrency(stats.total_revenue)} total</p>
          </Link>
        )}
      </div>

      {/* Alert Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/deadlines?status=upcoming"
          className={\`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border \${
            stats.upcoming_deadlines > 5 ? 'border-orange-300 dark:border-orange-800' : 'border-gray-200 dark:border-gray-700'
          } hover:shadow-md transition-shadow\`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className={\`text-xl font-bold \${stats.upcoming_deadlines > 5 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}\`}>
                {stats.upcoming_deadlines}
              </p>
              <p className="text-xs text-gray-500">Upcoming Deadlines</p>
            </div>
          </div>
        </Link>

        <Link
          to="/tasks?status=overdue"
          className={\`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border \${
            stats.overdue_tasks > 0 ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
          } hover:shadow-md transition-shadow\`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className={\`text-xl font-bold \${stats.overdue_tasks > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                {stats.overdue_tasks}
              </p>
              <p className="text-xs text-gray-500">Overdue Tasks</p>
            </div>
          </div>
        </Link>

        <Link to="/calendar?view=week" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Gavel className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.hearings_this_week}</p>
              <p className="text-xs text-gray-500">Hearings This Week</p>
            </div>
          </div>
        </Link>

        <Link to="/filings" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.filings_due_this_week}</p>
              <p className="text-xs text-gray-500">Filings Due</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Financial & Performance Row */}
      {(showFinancials || showPerformance) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {showFinancials && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Overview</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-500">Outstanding Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.outstanding_invoices)}</p>
                </div>
                <div className={\`p-4 rounded-lg \${stats.overdue_invoices > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900/50'}\`}>
                  <p className="text-sm text-gray-500">Overdue Invoices</p>
                  <p className={\`text-2xl font-bold \${stats.overdue_invoices > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                    {formatCurrency(stats.overdue_invoices)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Trust Balance</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_trust_balance)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-500">Billable Hours (Month)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.billable_hours_this_month.toFixed(1)}h</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Average Hourly Rate</span>
                  <span className="font-bold text-gray-900 dark:text-white">\${stats.average_hourly_rate}/hr</span>
                </div>
              </div>
            </div>
          )}

          {showPerformance && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Win Rate</p>
                  <p className="text-3xl font-bold text-green-600">{stats.win_rate.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Avg. Case Duration</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.average_case_duration}</p>
                  <p className="text-xs text-gray-400">days</p>
                </div>
                {stats.client_satisfaction_rate !== undefined && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center sm:col-span-2">
                    <p className="text-sm text-gray-500">Client Satisfaction</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.client_satisfaction_rate.toFixed(1)}%</p>
                  </div>
                )}
              </div>

              {stats.top_performing_attorney && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">Top Performing Attorney</p>
                  <Link
                    to={\`/attorneys/\${stats.top_performing_attorney.id}\`}
                    className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{stats.top_performing_attorney.name}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-600">{stats.top_performing_attorney.cases_won} wins</p>
                      <p className="text-xs text-gray-500">{formatCurrency(stats.top_performing_attorney.revenue_generated)}</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Practice Area Breakdown */}
      {stats.practice_area_breakdown && stats.practice_area_breakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Scale className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Practice Area Breakdown</h3>
          </div>

          <div className="space-y-4">
            {stats.practice_area_breakdown.map((area, index) => {
              const maxCases = Math.max(...stats.practice_area_breakdown!.map(a => a.case_count));
              const percentage = (area.case_count / maxCases) * 100;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{area.area}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-900 dark:text-white">{area.case_count} cases</span>
                      <span className="text-xs text-gray-500 ml-2">{formatCurrency(area.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: percentage + '%' }}
                    />
                  </div>
                </div>
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
