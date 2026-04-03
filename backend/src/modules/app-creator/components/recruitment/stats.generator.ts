/**
 * Recruitment Stats Component Generators
 *
 * Generates comprehensive stats dashboard components for recruitment metrics,
 * KPIs, and analytics visualization.
 */

export interface RecruitmentStatsOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate RecruitmentStats component
 * Comprehensive recruitment statistics dashboard with KPIs and charts
 */
export function generateRecruitmentStats(options: RecruitmentStatsOptions = {}): string {
  const { componentName = 'RecruitmentStats', endpoint = '/recruitment/stats' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Users,
  Briefcase,
  UserCheck,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  Building2,
  MapPin,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  dateRange?: { from: string; to: string };
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, dateRange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['recruitment-stats', selectedPeriod, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', selectedPeriod);
      if (dateRange?.from) params.append('from', dateRange.from);
      if (dateRange?.to) params.append('to', dateRange.to);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response || {};
    },
  });

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  const getChangeIndicator = (change: number | undefined) => {
    if (change === undefined || change === null) return null;
    const isPositive = change >= 0;
    return (
      <div className={\`flex items-center gap-1 text-sm \${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}\`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Applications',
      value: stats?.total_applications || 0,
      change: stats?.applications_change,
      icon: Users,
      color: 'blue',
      description: 'New applications received',
    },
    {
      label: 'Active Jobs',
      value: stats?.active_jobs || 0,
      change: stats?.jobs_change,
      icon: Briefcase,
      color: 'purple',
      description: 'Currently open positions',
    },
    {
      label: 'Placements',
      value: stats?.placements || 0,
      change: stats?.placements_change,
      icon: UserCheck,
      color: 'green',
      description: 'Successful placements',
    },
    {
      label: 'Avg. Time to Hire',
      value: (stats?.avg_time_to_hire || 0) + ' days',
      change: stats?.time_to_hire_change,
      icon: Clock,
      color: 'orange',
      description: 'Average hiring duration',
      invertChange: true,
    },
    {
      label: 'Revenue',
      value: '\$' + (stats?.revenue || 0).toLocaleString(),
      change: stats?.revenue_change,
      icon: DollarSign,
      color: 'emerald',
      description: 'Total placement fees',
    },
    {
      label: 'Fill Rate',
      value: (stats?.fill_rate || 0) + '%',
      change: stats?.fill_rate_change,
      icon: Target,
      color: 'indigo',
      description: 'Jobs successfully filled',
    },
  ];

  const pipelineStats = stats?.pipeline || [
    { stage: 'New', count: 145, percentage: 35 },
    { stage: 'Screening', count: 89, percentage: 21 },
    { stage: 'Interview', count: 67, percentage: 16 },
    { stage: 'Assessment', count: 45, percentage: 11 },
    { stage: 'Offer', count: 32, percentage: 8 },
    { stage: 'Hired', count: 38, percentage: 9 },
  ];

  const sourceStats = stats?.sources || [
    { source: 'LinkedIn', count: 156, percentage: 38, color: 'bg-blue-500' },
    { source: 'Indeed', count: 98, percentage: 24, color: 'bg-purple-500' },
    { source: 'Referrals', count: 67, percentage: 16, color: 'bg-green-500' },
    { source: 'Company Website', count: 52, percentage: 13, color: 'bg-orange-500' },
    { source: 'Other', count: 37, percentage: 9, color: 'bg-gray-500' },
  ];

  const departmentStats = stats?.departments || [
    { name: 'Engineering', jobs: 12, placements: 8, applications: 234 },
    { name: 'Sales', jobs: 8, placements: 5, applications: 156 },
    { name: 'Marketing', jobs: 5, placements: 3, applications: 89 },
    { name: 'Design', jobs: 4, placements: 2, applications: 67 },
    { name: 'Operations', jobs: 3, placements: 2, applications: 45 },
  ];

  const topRecruiters = stats?.top_recruiters || [
    { name: 'Sarah Johnson', placements: 12, revenue: 156000, avatar: null },
    { name: 'Mike Chen', placements: 10, revenue: 132000, avatar: null },
    { name: 'Emily Davis', placements: 8, revenue: 98000, avatar: null },
    { name: 'James Wilson', placements: 7, revenue: 87000, avatar: null },
  ];

  return (
    <div className={\`space-y-6 \${className || ''}\`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recruitment Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your recruitment performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as any)}
                className={\`px-3 py-1.5 text-sm rounded-md transition-colors \${
                  selectedPeriod === period.value
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }\`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={\`p-2 rounded-lg \${showFilters ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}\`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const colorClasses: Record<string, { bg: string; icon: string }> = {
            blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
            purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
            green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
            orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
            emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
            indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
          };
          const colors = colorClasses[kpi.color] || colorClasses.blue;

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${colors.bg}\`}>
                  <Icon className={\`w-5 h-5 \${colors.icon}\`} />
                </div>
                {getChangeIndicator(kpi.invertChange ? -(kpi.change || 0) : kpi.change)}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {kpi.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              Candidate Pipeline
            </h3>
          </div>
          <div className="space-y-4">
            {pipelineStats.map((stage: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stage.stage}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{stage.count} ({stage.percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: \`\${stage.percentage}%\` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total in Pipeline</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {pipelineStats.reduce((sum: number, s: any) => sum + s.count, 0)} candidates
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-400" />
              Application Sources
            </h3>
          </div>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                {sourceStats.reduce((acc: any[], source: any, index: number) => {
                  const offset = acc.length > 0 ? acc[acc.length - 1].endOffset : 0;
                  const circumference = 2 * Math.PI * 70;
                  const strokeLength = (source.percentage / 100) * circumference;
                  acc.push({
                    ...source,
                    offset,
                    strokeLength,
                    endOffset: offset + strokeLength,
                  });
                  return acc;
                }, []).map((source: any, index: number) => (
                  <circle
                    key={index}
                    cx="96"
                    cy="96"
                    r="70"
                    fill="none"
                    strokeWidth="24"
                    className={source.color}
                    style={{
                      stroke: 'currentColor',
                      strokeDasharray: \`\${source.strokeLength} \${2 * Math.PI * 70}\`,
                      strokeDashoffset: -source.offset,
                    }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {sourceStats.reduce((sum: number, s: any) => sum + s.count, 0)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sourceStats.map((source: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className={\`w-3 h-3 rounded-full \${source.color}\`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{source.source}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto">{source.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              By Department
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Department</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Jobs</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Placements</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Applications</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">{dept.name}</td>
                    <td className="py-3 text-sm text-right text-gray-600 dark:text-gray-400">{dept.jobs}</td>
                    <td className="py-3 text-sm text-right text-green-600 dark:text-green-400 font-medium">{dept.placements}</td>
                    <td className="py-3 text-sm text-right text-gray-600 dark:text-gray-400">{dept.applications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-400" />
              Top Recruiters
            </h3>
          </div>
          <div className="space-y-4">
            {topRecruiters.map((recruiter: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400">
                  {index + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                  {recruiter.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{recruiter.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{recruiter.placements} placements</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    \${(recruiter.revenue / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-gray-400" />
            Quick Insights
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Best Performing Source</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              LinkedIn brings in {sourceStats[0]?.percentage || 0}% of all candidates
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-900 dark:text-green-100">Conversion Rate</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {stats?.conversion_rate || 12}% of applications result in placements
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-purple-900 dark:text-purple-100">Fastest Hire</span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Engineering roles filled {stats?.fastest_department || 15}% faster than average
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="font-medium text-orange-900 dark:text-orange-100">Goal Progress</span>
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {stats?.goal_progress || 78}% of quarterly placement target achieved
            </p>
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
 * Generate RecruitmentKPICards component
 * Focused KPI cards for quick metrics overview
 */
export function generateRecruitmentKPICards(options: RecruitmentStatsOptions = {}): string {
  const { componentName = 'RecruitmentKPICards', endpoint = '/recruitment/kpis' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Users,
  Briefcase,
  UserCheck,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Percent
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  compact?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, compact = false }) => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['recruitment-kpis'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {};
    },
  });

  if (isLoading) {
    return (
      <div className={\`grid \${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-4 \${className || ''}\`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Open Positions',
      value: kpis?.open_positions || 0,
      change: kpis?.open_positions_change,
      icon: Briefcase,
      color: 'blue',
      format: 'number',
    },
    {
      label: 'Active Candidates',
      value: kpis?.active_candidates || 0,
      change: kpis?.active_candidates_change,
      icon: Users,
      color: 'purple',
      format: 'number',
    },
    {
      label: 'This Month Placements',
      value: kpis?.monthly_placements || 0,
      change: kpis?.placements_change,
      icon: UserCheck,
      color: 'green',
      format: 'number',
    },
    {
      label: 'Avg. Days to Hire',
      value: kpis?.avg_days_to_hire || 0,
      change: kpis?.days_to_hire_change,
      icon: Clock,
      color: 'orange',
      format: 'days',
      invertChange: true,
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
  };

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') return '\$' + value.toLocaleString();
    if (format === 'percentage') return value + '%';
    if (format === 'days') return value + ' days';
    return value.toLocaleString();
  };

  return (
    <div className={\`grid \${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-4 \${className || ''}\`}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const colors = colorClasses[card.color] || colorClasses.blue;
        const change = card.invertChange ? -(card.change || 0) : (card.change || 0);
        const isPositive = change >= 0;

        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={\`\${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg flex items-center justify-center \${colors.bg}\`}>
                <Icon className={\`\${compact ? 'w-4 h-4' : 'w-5 h-5'} \${colors.icon}\`} />
              </div>
              {card.change !== undefined && (
                <div className={\`flex items-center gap-1 text-sm \${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}\`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(card.change)}%</span>
                </div>
              )}
            </div>
            <div className={\`\${compact ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white mb-1\`}>
              {formatValue(card.value, card.format)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate RecruitmentMetricsChart component
 * Time-series chart for recruitment metrics visualization
 */
export function generateRecruitmentMetricsChart(options: RecruitmentStatsOptions = {}): string {
  const { componentName = 'RecruitmentMetricsChart', endpoint = '/recruitment/metrics' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const [selectedMetric, setSelectedMetric] = useState<'applications' | 'placements' | 'revenue'>('applications');

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['recruitment-metrics', selectedMetric],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?metric=\${selectedMetric}\`);
      return response?.data || response || [];
    },
  });

  const metricOptions = [
    { id: 'applications', label: 'Applications', icon: Users, color: 'blue' },
    { id: 'placements', label: 'Placements', icon: UserCheck, color: 'green' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'emerald' },
  ];

  const sampleData = [
    { month: 'Jan', value: 120 },
    { month: 'Feb', value: 145 },
    { month: 'Mar', value: 132 },
    { month: 'Apr', value: 178 },
    { month: 'May', value: 156 },
    { month: 'Jun', value: 189 },
    { month: 'Jul', value: 201 },
    { month: 'Aug', value: 167 },
    { month: 'Sep', value: 223 },
    { month: 'Oct', value: 198 },
    { month: 'Nov', value: 234 },
    { month: 'Dec', value: 256 },
  ];

  const chartData = metrics?.length > 0 ? metrics : sampleData;
  const maxValue = Math.max(...chartData.map((d: any) => d.value));

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const colorClasses: Record<string, { bar: string; bg: string }> = {
    blue: { bar: 'bg-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    green: { bar: 'bg-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    emerald: { bar: 'bg-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  };

  const selectedOption = metricOptions.find((m) => m.id === selectedMetric);
  const colors = colorClasses[selectedOption?.color || 'blue'];

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          Recruitment Trends
        </h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {metricOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedMetric(option.id as any)}
                className={\`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors \${
                  selectedMetric === option.id
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }\`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-64 flex items-end gap-2">
        {chartData.map((item: any, index: number) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full flex items-end justify-center h-48">
                <div
                  className={\`w-full max-w-[40px] rounded-t-lg transition-all duration-300 hover:opacity-80 \${colors.bar}\`}
                  style={{ height: \`\${height}%\` }}
                  title={\`\${item.month}: \${item.value}\`}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.month}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {chartData.reduce((sum: number, d: any) => sum + d.value, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(chartData.reduce((sum: number, d: any) => sum + d.value, 0) / chartData.length).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
            <TrendingUp className="w-5 h-5" />
            12%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Growth</p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
