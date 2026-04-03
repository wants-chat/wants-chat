/**
 * Referral Component Generators
 *
 * Generates referral program components:
 * - CampaignStatsReferral: Referral campaign statistics
 * - RewardTiers: Tiered reward system display
 * - ReferralFilters: Filter referrals by status, date, etc.
 */

export interface CampaignStatsReferralOptions {
  componentName?: string;
  endpoint?: string;
  showChart?: boolean;
}

export function generateCampaignStatsReferral(options: CampaignStatsReferralOptions = {}): string {
  const {
    componentName = 'CampaignStatsReferral',
    endpoint = '/referrals/stats',
    showChart = true,
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, UserPlus, Gift, DollarSign,
  TrendingUp, Percent, Share2, Target, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  campaignId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  campaignId,
  className,
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['referral-campaign-stats', campaignId],
    queryFn: async () => {
      const endpoint = campaignId
        ? \`${endpoint}?campaign_id=\${campaignId}\`
        : '${endpoint}';
      const response = await api.get<any>(endpoint);
      return response?.data || response || {
        totalReferrals: 1248,
        successfulReferrals: 892,
        pendingReferrals: 156,
        conversionRate: 71.5,
        totalRewardsEarned: 8920,
        totalRewardsPaid: 7450,
        avgRewardValue: 10,
        activeReferrers: 234,
        topReferrerCount: 45,
        thisMonthReferrals: 128,
        thisMonthGrowth: 18.5,
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

  const statCards = [
    {
      label: 'Total Referrals',
      value: stats?.totalReferrals?.toLocaleString() || '0',
      subtext: \`\${stats?.successfulReferrals || 0} successful\`,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Conversion Rate',
      value: \`\${stats?.conversionRate || 0}%\`,
      subtext: 'Referral to signup',
      icon: Percent,
      color: 'green',
    },
    {
      label: 'Rewards Earned',
      value: \`\$\${(stats?.totalRewardsEarned || 0).toLocaleString()}\`,
      subtext: \`\$\${(stats?.totalRewardsPaid || 0).toLocaleString()} paid\`,
      icon: Gift,
      color: 'purple',
    },
    {
      label: 'Active Referrers',
      value: stats?.activeReferrers?.toLocaleString() || '0',
      subtext: \`\${stats?.topReferrerCount || 0} top performers\`,
      icon: UserPlus,
      color: 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600' },
  };

  return (
    <div className={\`\${className || ''}\`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtext}</p>
                  )}
                </div>
                <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${colors.bg}\`}>
                  <Icon className={\`w-5 h-5 \${colors.icon}\`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Growth Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-1">This Month's Referrals</p>
            <p className="text-3xl font-bold">{stats?.thisMonthReferrals || 0}</p>
            <div className="flex items-center gap-1 mt-2 text-green-300">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats?.thisMonthGrowth || 0}% from last month</span>
            </div>
          </div>
          <Share2 className="w-16 h-16 text-white/20" />
        </div>
      </div>

      ${showChart ? `{/* Chart Placeholder */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Referral Trend</h3>
        <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chart visualization will render here</p>
            <p className="text-sm">Integrate with your preferred charting library</p>
          </div>
        </div>
      </div>` : ''}
    </div>
  );
};

export default ${componentName};
`;
}

export interface RewardTiersOptions {
  componentName?: string;
  endpoint?: string;
  showProgress?: boolean;
  showBenefits?: boolean;
}

export function generateRewardTiers(options: RewardTiersOptions = {}): string {
  const {
    componentName = 'RewardTiers',
    endpoint = '/referrals/tiers',
    showProgress = true,
    showBenefits = true,
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Gift, Star, Crown, Award, Trophy,
  Check, Lock, ChevronRight, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  userId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  userId,
  className,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['reward-tiers', userId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}\${userId ? \`?user_id=\${userId}\` : ''}\`);
      return response?.data || response || {
        currentTier: 'silver',
        currentPoints: 2500,
        nextTierPoints: 5000,
        tiers: [
          {
            id: 'bronze',
            name: 'Bronze',
            icon: 'star',
            minPoints: 0,
            color: 'orange',
            benefits: ['5% commission on referrals', 'Basic analytics', 'Email support'],
          },
          {
            id: 'silver',
            name: 'Silver',
            icon: 'award',
            minPoints: 1000,
            color: 'gray',
            benefits: ['10% commission on referrals', 'Advanced analytics', 'Priority email support', 'Custom referral link'],
          },
          {
            id: 'gold',
            name: 'Gold',
            icon: 'trophy',
            minPoints: 5000,
            color: 'yellow',
            benefits: ['15% commission on referrals', 'Full analytics suite', 'Phone support', 'Custom landing pages', 'Early access features'],
          },
          {
            id: 'platinum',
            name: 'Platinum',
            icon: 'crown',
            minPoints: 10000,
            color: 'purple',
            benefits: ['20% commission on referrals', 'Dedicated account manager', '24/7 support', 'White-label options', 'API access', 'Co-marketing opportunities'],
          },
        ],
      };
    },
  });

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      star: Star,
      award: Award,
      trophy: Trophy,
      crown: Crown,
      gift: Gift,
    };
    return icons[iconName] || Star;
  };

  const getColorClasses = (color: string, isActive: boolean, isLocked: boolean) => {
    if (isLocked) {
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        icon: 'text-gray-400',
        text: 'text-gray-400',
      };
    }

    const colors: Record<string, any> = {
      orange: {
        bg: isActive ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-white dark:bg-gray-800',
        border: isActive ? 'border-orange-500' : 'border-gray-200 dark:border-gray-700',
        icon: 'text-orange-500',
        text: 'text-orange-600 dark:text-orange-400',
      },
      gray: {
        bg: isActive ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800',
        border: isActive ? 'border-gray-500' : 'border-gray-200 dark:border-gray-700',
        icon: 'text-gray-500',
        text: 'text-gray-600 dark:text-gray-400',
      },
      yellow: {
        bg: isActive ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-gray-800',
        border: isActive ? 'border-yellow-500' : 'border-gray-200 dark:border-gray-700',
        icon: 'text-yellow-500',
        text: 'text-yellow-600 dark:text-yellow-400',
      },
      purple: {
        bg: isActive ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-gray-800',
        border: isActive ? 'border-purple-500' : 'border-gray-200 dark:border-gray-700',
        icon: 'text-purple-500',
        text: 'text-purple-600 dark:text-purple-400',
      },
    };
    return colors[color] || colors.gray;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const currentTierIndex = data?.tiers?.findIndex((t: any) => t.id === data?.currentTier) || 0;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <Gift className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reward Tiers</h2>
      </div>

      <div className="p-4">
        ${showProgress ? `{/* Progress to Next Tier */}
        {data?.currentTier && data?.nextTierPoints && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress to Next Tier
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {data.currentPoints?.toLocaleString()} / {data.nextTierPoints?.toLocaleString()} points
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: \`\${Math.min((data.currentPoints / data.nextTierPoints) * 100, 100)}%\` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {(data.nextTierPoints - data.currentPoints).toLocaleString()} more points to unlock the next tier
            </p>
          </div>
        )}` : ''}

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.tiers?.map((tier: any, index: number) => {
            const Icon = getIcon(tier.icon);
            const isActive = tier.id === data.currentTier;
            const isLocked = index > currentTierIndex;
            const isUnlocked = index <= currentTierIndex;
            const colors = getColorClasses(tier.color, isActive, isLocked);

            return (
              <div
                key={tier.id}
                className={\`relative rounded-xl border-2 transition-all \${colors.bg} \${colors.border} \${
                  isActive ? 'ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-gray-900' : ''
                }\`}
              >
                {/* Current Badge */}
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                      Current
                    </span>
                  </div>
                )}

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center z-10">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${
                      isLocked ? 'bg-gray-200 dark:bg-gray-700' : \`bg-\${tier.color}-100 dark:bg-\${tier.color}-900/30\`
                    }\`}>
                      <Icon className={\`w-5 h-5 \${colors.icon}\`} />
                    </div>
                    <div>
                      <h3 className={\`font-semibold \${isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}\`}>
                        {tier.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tier.minPoints.toLocaleString()}+ points
                      </p>
                    </div>
                  </div>

                  ${showBenefits ? `{/* Benefits */}
                  <ul className="space-y-2">
                    {tier.benefits?.map((benefit: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className={\`w-4 h-4 mt-0.5 flex-shrink-0 \${
                          isLocked ? 'text-gray-300 dark:text-gray-600' : 'text-green-500'
                        }\`} />
                        <span className={isLocked ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface ReferralFiltersOptions {
  componentName?: string;
  showStatus?: boolean;
  showDateRange?: boolean;
  showSource?: boolean;
}

export function generateReferralFilters(options: ReferralFiltersOptions = {}): string {
  const {
    componentName = 'ReferralFilters',
    showStatus = true,
    showDateRange = true,
    showSource = true,
  } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, Calendar, X, Users, Link2 } from 'lucide-react';

interface ${componentName}Props {
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onFilterChange,
  className,
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    startDate: '',
    endDate: '',
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'rewarded', label: 'Rewarded' },
    { value: 'expired', label: 'Expired' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'email', label: 'Email Invite' },
    { value: 'link', label: 'Referral Link' },
    { value: 'social', label: 'Social Share' },
    { value: 'qr', label: 'QR Code' },
    { value: 'direct', label: 'Direct' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      status: '',
      source: '',
      startDate: '',
      endDate: '',
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 \${className || ''}\`}>
      {/* Search & Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-colors \${
            isExpanded || hasActiveFilters
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
          }\`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${showStatus ? `{/* Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Users className="w-4 h-4" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>` : ''}

            ${showSource ? `{/* Source */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Link2 className="w-4 h-4" />
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {sourceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>` : ''}

            ${showDateRange ? `{/* Date Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Calendar className="w-4 h-4" />
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Calendar className="w-4 h-4" />
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>` : ''}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
