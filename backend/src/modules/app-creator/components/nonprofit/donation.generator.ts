/**
 * Donation Component Generators
 * Components for nonprofit donation management and tracking
 */

export interface DonationOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDonationStats(options: DonationOptions = {}): string {
  const { componentName = 'DonationStats', endpoint = '/donations' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, DollarSign, TrendingUp, Users, Calendar, Target, Heart } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['donation-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/stats');
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

  const progress = stats?.goal ? Math.min((stats.total_this_month / stats.goal) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Total Donations This Month</p>
            <p className="text-4xl font-bold mt-1">
              \${(stats?.total_this_month || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-full">
            <DollarSign className="w-8 h-8" />
          </div>
        </div>
        {stats?.goal && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Goal</span>
              <span>\${stats.goal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: \`\${progress}%\` }}
              />
            </div>
            <p className="text-sm mt-2 opacity-80">{progress.toFixed(1)}% of goal reached</p>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total_donors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Donation</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                \${(stats?.average_donation || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recurring Donors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.recurring_donors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">New Donors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.new_donors_this_month || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Year to Date</h3>
          <p className="text-3xl font-bold text-emerald-600">
            \${(stats?.year_to_date || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats?.ytd_change >= 0 ? '+' : ''}{stats?.ytd_change || 0}% vs last year
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">All Time</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            \${(stats?.all_time || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            From {stats?.total_donations || 0} donations
          </p>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDonationChart(options: DonationOptions = {}): string {
  const { componentName = 'DonationChart', endpoint = '/donations' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const ${componentName}: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['donation-chart', timeRange],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/chart?range=\${timeRange}\`);
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

  const maxValue = Math.max(...(chartData?.data?.map((d: any) => d.value) || [1]));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Donation Trends</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {chartData?.trend >= 0 ? (
              <span className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                +{chartData.trend}% from previous period
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-4 h-4" />
                {chartData?.trend}% from previous period
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['week', 'month', 'quarter', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={\`px-3 py-1 text-sm rounded-md transition-colors \${
                timeRange === range
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }\`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 flex items-end gap-2">
        {chartData?.data?.map((item: any, index: number) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                \${item.value.toLocaleString()}
              </span>
            </div>
            <div
              className="w-full bg-emerald-500 dark:bg-emerald-600 rounded-t-sm hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors cursor-pointer"
              style={{ height: \`\${(item.value / maxValue) * 100}%\`, minHeight: '4px' }}
              title={\`\${item.label}: $\${item.value.toLocaleString()}\`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {chartData?.summary && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              \${chartData.summary.total?.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              \${chartData.summary.average?.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Count</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {chartData.summary.count}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDonationFiltersNonprofit(options: DonationOptions = {}): string {
  const { componentName = 'DonationFiltersNonprofit', endpoint = '/donations' } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, Calendar, DollarSign, X } from 'lucide-react';

interface FiltersState {
  search: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  type: string;
  campaign: string;
  status: string;
}

interface ${componentName}Props {
  onFilterChange: (filters: FiltersState) => void;
  campaigns?: { id: string; name: string }[];
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange, campaigns = [] }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    type: 'all',
    campaign: 'all',
    status: 'all'
  });

  const handleChange = (key: keyof FiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: FiltersState = {
      search: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      type: 'all',
      campaign: 'all',
      status: 'all'
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && value !== 'all' && value !== ''
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by donor name or email..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="one-time">One-Time</option>
            <option value="recurring">Recurring</option>
            <option value="pledge">Pledge</option>
          </select>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={\`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors \${
              showAdvanced || hasActiveFilters
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }\`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date From
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date To
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleChange('minAmount', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="No limit"
                value={filters.maxAmount}
                onChange={(e) => handleChange('maxAmount', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Campaign
            </label>
            <select
              value={filters.campaign}
              onChange={(e) => handleChange('campaign', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDonationSummary(options: DonationOptions = {}): string {
  const { componentName = 'DonationSummary', endpoint = '/donations' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, DollarSign, Calendar, CreditCard, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5 }) => {
  const { data: donations, isLoading } = useQuery({
    queryKey: ['recent-donations', limit],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?limit=\${limit}&sort=created_at:desc\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Donations</h2>
        <Link
          to="/donations"
          className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {donations && donations.length > 0 ? (
          donations.map((donation: any) => (
            <div key={donation.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center gap-4">
                <div className={\`p-2 rounded-full \${
                  donation.type === 'recurring'
                    ? 'bg-purple-100 dark:bg-purple-900/30'
                    : 'bg-emerald-100 dark:bg-emerald-900/30'
                }\`}>
                  {donation.type === 'recurring' ? (
                    <RefreshCw className="w-5 h-5 text-purple-600" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {donation.donor_name || 'Anonymous'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {donation.campaign_name && (
                      <span>{donation.campaign_name}</span>
                    )}
                    {donation.campaign_name && <span>-</span>}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(donation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">\${donation.amount?.toLocaleString()}</p>
                  {donation.type === 'recurring' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {donation.frequency || 'Monthly'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No recent donations
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDonorProfile(options: DonationOptions = {}): string {
  const { componentName = 'DonorProfile', endpoint = '/donors' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, User, Mail, Phone, MapPin, Calendar, DollarSign,
  Gift, Heart, Clock, TrendingUp, Award
} from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: donor, isLoading } = useQuery({
    queryKey: ['donor', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: donations } = useQuery({
    queryKey: ['donor-donations', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/donations\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!donor) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Donor not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-6">
          {donor.avatar_url ? (
            <img
              src={donor.avatar_url}
              alt={donor.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <User className="w-12 h-12 text-emerald-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{donor.name}</h1>
                {donor.donor_level && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm mt-2">
                    <Award className="w-4 h-4" />
                    {donor.donor_level}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Given</p>
                <p className="text-3xl font-bold text-emerald-600">
                  \${(donor.total_donations || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {donor.email && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  {donor.email}
                </div>
              )}
              {donor.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  {donor.phone}
                </div>
              )}
              {donor.address && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 sm:col-span-2">
                  <MapPin className="w-4 h-4" />
                  {donor.address}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Gift className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Donations</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {donor.donation_count || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                \${(donor.average_donation || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {donor.is_recurring ? 'Recurring' : 'One-time'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">First Gift</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {donor.first_donation_date
                  ? new Date(donor.first_donation_date).toLocaleDateString()
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Donation History</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {donations && donations.length > 0 ? (
            donations.map((donation: any) => (
              <div key={donation.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {donation.campaign_name || 'General Fund'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(donation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">\${donation.amount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{donation.payment_method}</p>
                  </div>
                </div>
                {donation.note && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                    "{donation.note}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No donation history
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMemberDonations(options: DonationOptions = {}): string {
  const { componentName = 'MemberDonations', endpoint = '/donations' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Loader2, DollarSign, Calendar, RefreshCw, Download, ChevronRight,
  TrendingUp, Gift, CreditCard, FileText
} from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const { data: myDonations, isLoading } = useQuery({
    queryKey: ['my-donations', year],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/me?year=\${year}\`);
      return response?.data || response;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['my-donation-summary', year],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/me/summary?year=\${year}\`);
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

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i.toString());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Giving</h1>
        <div className="flex gap-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 opacity-80" />
            <span className="text-xs opacity-80">{year}</span>
          </div>
          <p className="text-3xl font-bold">\${(summary?.total || 0).toLocaleString()}</p>
          <p className="text-sm opacity-80 mt-1">Total Giving</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Gift className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contributions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recurring</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                \${(summary?.recurring_total || 0).toLocaleString()}/mo
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">vs Last Year</p>
              <p className={\`text-xl font-bold \${
                (summary?.yoy_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }\`}>
                {summary?.yoy_change >= 0 ? '+' : ''}{summary?.yoy_change || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {myDonations?.donations && myDonations.donations.length > 0 ? (
              myDonations.donations.map((donation: any) => (
                <div key={donation.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-4">
                    <div className={\`p-2 rounded-full \${
                      donation.type === 'recurring'
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'bg-emerald-100 dark:bg-emerald-900/30'
                    }\`}>
                      {donation.type === 'recurring' ? (
                        <RefreshCw className="w-5 h-5 text-purple-600" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {donation.campaign_name || 'General Fund'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(donation.created_at).toLocaleDateString()}
                        <CreditCard className="w-3 h-3 ml-2" />
                        {donation.payment_method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">\${donation.amount?.toLocaleString()}</p>
                      <span className={\`text-xs px-2 py-0.5 rounded-full \${
                        donation.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }\`}>
                        {donation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No donations found for {year}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Giving by Fund</h3>
            <div className="space-y-3">
              {summary?.by_fund?.map((fund: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{fund.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      \${fund.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-emerald-500 rounded-full h-2"
                      style={{ width: \`\${(fund.total / (summary?.total || 1)) * 100}%\` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tax Documents</h3>
            <div className="space-y-2">
              {summary?.tax_documents?.map((doc: any) => (
                <a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                >
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.year}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              )) || (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Tax documents will be available after year end
                </p>
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
