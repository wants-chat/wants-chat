/**
 * Campaign Component Generators
 *
 * Generates campaign-related components for marketing applications:
 * - CampaignFilters: Filter campaigns by status, type, date
 * - CampaignFiltersMarketing: Advanced marketing-specific filters
 * - CampaignHeader: Campaign detail header with metrics
 * - CampaignListActive: List of active campaigns
 * - CampaignPerformance: Campaign performance metrics and charts
 * - CampaignStats: Overview statistics for campaigns
 * - CampaignStory: Campaign timeline/story view
 */

export interface CampaignFiltersOptions {
  componentName?: string;
  endpoint?: string;
  showStatus?: boolean;
  showType?: boolean;
  showDateRange?: boolean;
  showBudget?: boolean;
}

export function generateCampaignFilters(options: CampaignFiltersOptions = {}): string {
  const {
    componentName = 'CampaignFilters',
    showStatus = true,
    showType = true,
    showDateRange = true,
    showBudget = false,
  } = options;

  return `import React, { useState } from 'react';
import { Search, Filter, Calendar, X, ChevronDown } from 'lucide-react';

interface ${componentName}Props {
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange, className }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    startDate: '',
    endDate: '',
    ${showBudget ? "budgetMin: '',\n    budgetMax: ''," : ''}
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'email', label: 'Email' },
    { value: 'social', label: 'Social Media' },
    { value: 'ppc', label: 'PPC/Ads' },
    { value: 'content', label: 'Content' },
    { value: 'seo', label: 'SEO' },
    { value: 'influencer', label: 'Influencer' },
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
      type: '',
      startDate: '',
      endDate: '',
      ${showBudget ? "budgetMin: '',\n      budgetMax: ''," : ''}
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 \${className || ''}\`}>
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors \${
            isExpanded || hasActiveFilters
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
          }\`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${showStatus ? `{/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

            ${showType ? `{/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campaign Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>` : ''}

            ${showDateRange ? `{/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>` : ''}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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

export interface CampaignFiltersMarketingOptions {
  componentName?: string;
  showChannels?: boolean;
  showGoals?: boolean;
  showClient?: boolean;
}

export function generateCampaignFiltersMarketing(options: CampaignFiltersMarketingOptions = {}): string {
  const {
    componentName = 'CampaignFiltersMarketing',
    showChannels = true,
    showGoals = true,
    showClient = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Calendar, X, Target, Globe, Building2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange, className }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    channel: '',
    goal: '',
    clientId: '',
    startDate: '',
    endDate: '',
    budgetMin: '',
    budgetMax: '',
  });
  const [isExpanded, setIsExpanded] = useState(false);

  ${showClient ? `const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await api.get<any>('/clients');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });` : ''}

  const channels = [
    { value: '', label: 'All Channels' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'email', label: 'Email' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
  ];

  const goals = [
    { value: '', label: 'All Goals' },
    { value: 'awareness', label: 'Brand Awareness' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'leads', label: 'Lead Generation' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'traffic', label: 'Website Traffic' },
    { value: 'sales', label: 'Sales' },
    { value: 'retention', label: 'Customer Retention' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
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
      type: '',
      channel: '',
      goal: '',
      clientId: '',
      startDate: '',
      endDate: '',
      budgetMin: '',
      budgetMax: '',
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns by name, client, or keyword..."
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
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Sparkles className="w-4 h-4" />
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
            </div>

            ${showChannels ? `{/* Channel */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Globe className="w-4 h-4" />
                Channel
              </label>
              <select
                value={filters.channel}
                onChange={(e) => handleFilterChange('channel', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {channels.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>` : ''}

            ${showGoals ? `{/* Goal */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Target className="w-4 h-4" />
                Goal
              </label>
              <select
                value={filters.goal}
                onChange={(e) => handleFilterChange('goal', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {goals.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>` : ''}

            ${showClient ? `{/* Client */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Building2 className="w-4 h-4" />
                Client
              </label>
              <select
                value={filters.clientId}
                onChange={(e) => handleFilterChange('clientId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Clients</option>
                {clients?.map((client: any) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>` : ''}
          </div>

          {/* Date Range & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Calendar className="w-4 h-4" />
                Start Date
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
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Min Budget
              </label>
              <input
                type="number"
                placeholder="$0"
                value={filters.budgetMin}
                onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                Max Budget
              </label>
              <input
                type="number"
                placeholder="No limit"
                value={filters.budgetMax}
                onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
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

export interface CampaignHeaderOptions {
  componentName?: string;
  endpoint?: string;
  showBudget?: boolean;
  showTimeline?: boolean;
  showActions?: boolean;
}

export function generateCampaignHeader(options: CampaignHeaderOptions = {}): string {
  const {
    componentName = 'CampaignHeader',
    endpoint = '/campaigns',
    showBudget = true,
    showTimeline = true,
    showActions = true,
  } = options;

  return `import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Calendar, DollarSign, Target, Users,
  Play, Pause, MoreHorizontal, Edit, Trash2, Copy,
  TrendingUp, Clock, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  campaignId?: string;
  campaign?: any;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  campaignId: propCampaignId,
  campaign: propCampaign,
  className,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const campaignId = propCampaignId || paramId;
  const [showMenu, setShowMenu] = React.useState(false);

  const { data: fetchedCampaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${campaignId}\`);
      return response?.data || response;
    },
    enabled: !propCampaign && !!campaignId,
  });

  const campaign = propCampaign || fetchedCampaign;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12 text-gray-500">
        Campaign not found
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[status] || colors.draft;
  };

  const formatDate = (date: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const budgetProgress = campaign.budget ? ((campaign.spent || 0) / campaign.budget) * 100 : 0;

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Campaigns</span>
        </button>

        ${showActions ? `<div className="flex items-center gap-2">
          {campaign.status === 'active' ? (
            <button
              onClick={() => onStatusChange?.('paused')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          ) : campaign.status !== 'completed' && (
            <button
              onClick={() => onStatusChange?.('active')}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <Play className="w-4 h-4" />
              Activate
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button
                  onClick={() => { onEdit?.(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit Campaign
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Duplicate
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => { onDelete?.(); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>` : ''}
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Title & Meta */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getStatusColor(campaign.status)}\`}>
                {campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)}
              </span>
              {campaign.type && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {campaign.type}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                {campaign.description}
              </p>
            )}

            ${showTimeline ? `{/* Timeline */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
              </div>
              {campaign.client_name && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{campaign.client_name}</span>
                </div>
              )}
            </div>` : ''}
          </div>

          ${showBudget ? `{/* Right: Budget Card */}
          <div className="lg:w-72 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                \${(campaign.spent || 0).toLocaleString()}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {' '}/ \${(campaign.budget || 0).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className={\`h-2 rounded-full transition-all \${
                  budgetProgress > 90 ? 'bg-red-500' :
                  budgetProgress > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }\`}
                style={{ width: \`\${Math.min(budgetProgress, 100)}%\` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {budgetProgress.toFixed(1)}% of budget used
            </p>
          </div>` : ''}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface CampaignListActiveOptions {
  componentName?: string;
  endpoint?: string;
  limit?: number;
  showProgress?: boolean;
}

export function generateCampaignListActive(options: CampaignListActiveOptions = {}): string {
  const {
    componentName = 'CampaignListActive',
    endpoint = '/campaigns',
    limit = 5,
    showProgress = true,
  } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Megaphone, TrendingUp, Clock, DollarSign,
  ArrowRight, Loader2, Plus
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  limit?: number;
  onCampaignClick?: (campaign: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  limit = ${limit},
  onCampaignClick,
}) => {
  const navigate = useNavigate();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?status=active');
      const data = Array.isArray(response) ? response : (response?.data || []);
      return data.slice(0, limit);
    },
  });

  const handleClick = (campaign: any) => {
    if (onCampaignClick) {
      onCampaignClick(campaign);
    } else {
      navigate(\`/campaigns/\${campaign.id}\`);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Campaigns</h2>
        </div>
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="p-8 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No active campaigns</p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700"
          >
            Create your first campaign
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {campaigns.map((campaign: any) => {
            const budgetProgress = campaign.budget ? ((campaign.spent || 0) / campaign.budget) * 100 : 0;
            const daysRemaining = getDaysRemaining(campaign.end_date);
            const goalProgress = campaign.goal_target ? ((campaign.goal_current || 0) / campaign.goal_target) * 100 : 0;

            return (
              <div
                key={campaign.id}
                onClick={() => handleClick(campaign)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {campaign.type || 'Marketing Campaign'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {daysRemaining !== null && (
                      <div className={\`flex items-center gap-1 \${
                        daysRemaining <= 3 ? 'text-red-500' :
                        daysRemaining <= 7 ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'
                      }\`}>
                        <Clock className="w-4 h-4" />
                        <span>{daysRemaining}d left</span>
                      </div>
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                ${showProgress ? `{/* Progress Bars */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {/* Budget Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Budget</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        \${(campaign.spent || 0).toLocaleString()} / \${(campaign.budget || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={\`h-1.5 rounded-full \${
                          budgetProgress > 90 ? 'bg-red-500' :
                          budgetProgress > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                        }\`}
                        style={{ width: \`\${Math.min(budgetProgress, 100)}%\` }}
                      />
                    </div>
                  </div>

                  {/* Goal Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Goal</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {goalProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={\`h-1.5 rounded-full \${getProgressColor(goalProgress)}\`}
                        style={{ width: \`\${Math.min(goalProgress, 100)}%\` }}
                      />
                    </div>
                  </div>
                </div>` : ''}
              </div>
            );
          })}
        </div>
      )}

      {campaigns && campaigns.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/campaigns')}
            className="w-full py-2 text-sm text-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View all campaigns
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface CampaignPerformanceOptions {
  componentName?: string;
  endpoint?: string;
  showCharts?: boolean;
  metrics?: string[];
}

export function generateCampaignPerformance(options: CampaignPerformanceOptions = {}): string {
  const {
    componentName = 'CampaignPerformance',
    endpoint = '/campaigns',
    showCharts = true,
    metrics = ['impressions', 'clicks', 'conversions', 'ctr', 'cpc', 'roas'],
  } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, Eye, MousePointer,
  Target, DollarSign, Percent, BarChart3,
  Calendar, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  campaignId?: string;
  className?: string;
  period?: '7d' | '30d' | '90d' | 'all';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  campaignId: propCampaignId,
  className,
  period: initialPeriod = '30d',
}) => {
  const { id: paramId } = useParams();
  const campaignId = propCampaignId || paramId;
  const [period, setPeriod] = useState(initialPeriod);

  const { data: performance, isLoading } = useQuery({
    queryKey: ['campaign-performance', campaignId, period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${campaignId}/performance?period=\${period}\`);
      return response?.data || response || {
        impressions: { value: 125000, change: 12.5 },
        clicks: { value: 4800, change: 8.3 },
        conversions: { value: 320, change: 15.2 },
        ctr: { value: 3.84, change: -2.1 },
        cpc: { value: 1.25, change: -5.4 },
        roas: { value: 4.2, change: 22.8 },
        spend: { value: 6000, change: 10.0 },
        revenue: { value: 25200, change: 18.5 },
      };
    },
    enabled: !!campaignId,
  });

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const metricConfig: Record<string, { label: string; icon: any; format: (v: number) => string; color: string }> = {
    impressions: { label: 'Impressions', icon: Eye, format: (v) => v.toLocaleString(), color: 'blue' },
    clicks: { label: 'Clicks', icon: MousePointer, format: (v) => v.toLocaleString(), color: 'green' },
    conversions: { label: 'Conversions', icon: Target, format: (v) => v.toLocaleString(), color: 'purple' },
    ctr: { label: 'CTR', icon: Percent, format: (v) => v.toFixed(2) + '%', color: 'cyan' },
    cpc: { label: 'CPC', icon: DollarSign, format: (v) => '\$' + v.toFixed(2), color: 'orange' },
    roas: { label: 'ROAS', icon: TrendingUp, format: (v) => v.toFixed(1) + 'x', color: 'emerald' },
    spend: { label: 'Spend', icon: DollarSign, format: (v) => '\$' + v.toLocaleString(), color: 'red' },
    revenue: { label: 'Revenue', icon: DollarSign, format: (v) => '\$' + v.toLocaleString(), color: 'green' },
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h2>
        </div>
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value as any)}
              className={\`px-3 py-1.5 text-sm rounded-lg transition-colors \${
                period === p.value
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }\`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(performance || {}).map(([key, data]: [string, any]) => {
            const config = metricConfig[key];
            if (!config) return null;

            const isPositive = data.change >= 0;
            const Icon = config.icon;

            return (
              <div
                key={key}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{config.label}</span>
                  <Icon className={\`w-4 h-4 text-\${config.color}-500\`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {config.format(data.value)}
                </div>
                <div className={\`flex items-center gap-1 text-sm \${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }\`}>
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{Math.abs(data.change).toFixed(1)}%</span>
                  <span className="text-gray-500 dark:text-gray-400">vs prev</span>
                </div>
              </div>
            );
          })}
        </div>

        ${showCharts ? `{/* Chart Placeholder */}
        <div className="mt-6 h-64 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Performance chart will render here</p>
            <p className="text-sm">Integrate with your preferred charting library</p>
          </div>
        </div>` : ''}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface CampaignStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCampaignStats(options: CampaignStatsOptions = {}): string {
  const {
    componentName = 'CampaignStats',
    endpoint = '/campaigns/stats',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Megaphone, TrendingUp, DollarSign, Target,
  Users, Play, Pause, CheckCircle, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        totalCampaigns: 24,
        activeCampaigns: 8,
        totalBudget: 125000,
        totalSpent: 78500,
        avgROAS: 3.8,
        totalConversions: 2840,
        completedThisMonth: 5,
        clientsServed: 12,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Campaigns',
      value: stats?.totalCampaigns || 0,
      icon: Megaphone,
      color: 'blue',
      subtext: \`\${stats?.activeCampaigns || 0} active\`,
    },
    {
      label: 'Total Budget',
      value: '\$' + (stats?.totalBudget || 0).toLocaleString(),
      icon: DollarSign,
      color: 'green',
      subtext: \`\${((stats?.totalSpent / stats?.totalBudget) * 100 || 0).toFixed(0)}% utilized\`,
    },
    {
      label: 'Avg. ROAS',
      value: (stats?.avgROAS || 0).toFixed(1) + 'x',
      icon: TrendingUp,
      color: 'purple',
      subtext: 'Return on ad spend',
    },
    {
      label: 'Conversions',
      value: (stats?.totalConversions || 0).toLocaleString(),
      icon: Target,
      color: 'orange',
      subtext: 'This month',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600' },
  };

  return (
    <div className={\`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 \${className || ''}\`}>
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
  );
};

export default ${componentName};
`;
}

export interface CampaignStoryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCampaignStory(options: CampaignStoryOptions = {}): string {
  const {
    componentName = 'CampaignStory',
    endpoint = '/campaigns',
  } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Play, Pause, CheckCircle, AlertCircle,
  Target, DollarSign, Users, MessageSquare, Image,
  FileText, Zap, Clock, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  campaignId?: string;
  events?: any[];
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  campaignId: propCampaignId,
  events: propEvents,
  className,
}) => {
  const { id: paramId } = useParams();
  const campaignId = propCampaignId || paramId;

  const { data: fetchedEvents, isLoading } = useQuery({
    queryKey: ['campaign-timeline', campaignId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${campaignId}/timeline\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propEvents && !!campaignId,
  });

  const events = propEvents || fetchedEvents || [
    { id: 1, type: 'created', title: 'Campaign Created', description: 'Campaign was set up', date: '2024-01-15T10:00:00Z', user: 'John Doe' },
    { id: 2, type: 'asset', title: 'Assets Uploaded', description: '5 creative assets added', date: '2024-01-16T14:30:00Z', user: 'Jane Smith' },
    { id: 3, type: 'approved', title: 'Campaign Approved', description: 'Client approved the campaign', date: '2024-01-17T09:15:00Z', user: 'Client' },
    { id: 4, type: 'launched', title: 'Campaign Launched', description: 'Campaign went live', date: '2024-01-18T08:00:00Z', user: 'System' },
    { id: 5, type: 'milestone', title: 'First 1000 Impressions', description: 'Milestone reached', date: '2024-01-18T12:45:00Z', user: 'System' },
    { id: 6, type: 'optimization', title: 'Bid Adjusted', description: 'Increased bid by 15%', date: '2024-01-19T16:20:00Z', user: 'John Doe' },
  ];

  const getEventIcon = (type: string) => {
    const icons: Record<string, any> = {
      created: FileText,
      asset: Image,
      approved: CheckCircle,
      launched: Play,
      paused: Pause,
      completed: CheckCircle,
      milestone: Target,
      optimization: Zap,
      budget: DollarSign,
      comment: MessageSquare,
      alert: AlertCircle,
    };
    return icons[type] || Calendar;
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      created: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      asset: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      approved: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      launched: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      paused: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      milestone: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      optimization: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
      budget: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      alert: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Timeline</h2>
      </div>

      <div className="p-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No timeline events yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-6">
              {events.map((event: any, index: number) => {
                const Icon = getEventIcon(event.type);
                const colorClass = getEventColor(event.type);

                return (
                  <div key={event.id || index} className="relative flex gap-4">
                    {/* Icon */}
                    <div className={\`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 \${colorClass}\`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(event.date)}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                      )}
                      {event.user && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="w-3 h-3" />
                          <span>by {event.user}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
