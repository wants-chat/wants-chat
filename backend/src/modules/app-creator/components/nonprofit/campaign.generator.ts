/**
 * Campaign Component Generators
 * Components for nonprofit campaign management and fundraising
 */

export interface CampaignOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCampaignListNonprofit(options: CampaignOptions = {}): string {
  const { componentName = 'CampaignListNonprofit', endpoint = '/campaigns' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Loader2, Target, Calendar, Users, DollarSign, Search, Filter,
  ChevronRight, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  showFilters?: boolean;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ showFilters = true, limit }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns', status, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (category !== 'all') params.append('category', category);
      if (limit) params.append('limit', limit.toString());
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredCampaigns = campaigns?.filter((campaign: any) =>
    campaign.name?.toLowerCase().includes(search.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (campaignStatus: string) => {
    switch (campaignStatus) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'upcoming':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'urgent':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs">
            <AlertCircle className="w-3 h-3" />
            Urgent
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="missions">Missions</option>
              <option value="building">Building Fund</option>
              <option value="outreach">Community Outreach</option>
              <option value="youth">Youth Ministry</option>
              <option value="emergency">Emergency Relief</option>
              <option value="general">General Fund</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filteredCampaigns && filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign: any) => {
            const progress = campaign.goal ? (campaign.raised / campaign.goal) * 100 : 0;
            const daysLeft = campaign.end_date
              ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : null;

            return (
              <Link
                key={campaign.id}
                to={\`/campaigns/\${campaign.id}\`}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {campaign.image_url ? (
                    <img
                      src={campaign.image_url}
                      alt={campaign.name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-10 h-10 text-emerald-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {campaign.name}
                        </h3>
                        {campaign.category && (
                          <span className="text-sm text-emerald-600 dark:text-emerald-400">
                            {campaign.category}
                          </span>
                        )}
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>

                    {campaign.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold text-emerald-600">
                          \${(campaign.raised || 0).toLocaleString()} raised
                        </span>
                        {campaign.goal && (
                          <span className="text-gray-500 dark:text-gray-400">
                            of \${campaign.goal.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {campaign.goal && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-emerald-500 rounded-full h-2 transition-all"
                            style={{ width: \`\${Math.min(progress, 100)}%\` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {campaign.donor_count || 0} donors
                      </span>
                      {daysLeft !== null && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {daysLeft > 0 ? \`\${daysLeft} days left\` : 'Ended'}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No campaigns found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCampaignProgressNonprofit(options: CampaignOptions = {}): string {
  const { componentName = 'CampaignProgressNonprofit', endpoint = '/campaigns' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, Target, DollarSign, Users, Calendar, TrendingUp,
  Heart, Share2, Gift, Clock, CheckCircle
} from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: recentDonations } = useQuery({
    queryKey: ['campaign-donations', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/donations?limit=5\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  const { data: milestones } = useQuery({
    queryKey: ['campaign-milestones', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/milestones\`);
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

  if (!campaign) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Campaign not found</div>;
  }

  const progress = campaign.goal ? (campaign.raised / campaign.goal) * 100 : 0;
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {campaign.image_url && (
          <div className="h-48 sm:h-64 overflow-hidden">
            <img
              src={campaign.image_url}
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.name}</h1>
              {campaign.category && (
                <span className="text-emerald-600 dark:text-emerald-400">{campaign.category}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-4xl font-bold text-emerald-600">
                  \${(campaign.raised || 0).toLocaleString()}
                </p>
                {campaign.goal && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    raised of \${campaign.goal.toLocaleString()} goal
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(progress)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">funded</p>
              </div>
            </div>

            <div className="w-full bg-emerald-200 dark:bg-emerald-900/40 rounded-full h-4 mb-4">
              <div
                className="bg-emerald-500 rounded-full h-4 transition-all relative overflow-hidden"
                style={{ width: \`\${Math.min(progress, 100)}%\` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campaign.donor_count || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Donors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  \${(campaign.average_donation || 0).toFixed(0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Gift</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {daysLeft !== null ? daysLeft : '--'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Days Left</p>
              </div>
            </div>
          </div>

          <button className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2">
            <Gift className="w-5 h-5" />
            Donate to This Campaign
          </button>

          {campaign.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">About This Campaign</h2>
              <p className="text-gray-600 dark:text-gray-400">{campaign.description}</p>
            </div>
          )}
        </div>
      </div>

      {milestones && milestones.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Milestones</h2>
          <div className="space-y-4">
            {milestones.map((milestone: any, index: number) => {
              const isReached = campaign.raised >= milestone.amount;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${
                    isReached
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }\`}>
                    {isReached ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Target className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={\`font-medium \${
                      isReached
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }\`}>
                      {milestone.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      \${milestone.amount.toLocaleString()}
                    </p>
                  </div>
                  {isReached && (
                    <span className="text-xs text-emerald-600 font-medium">Reached!</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Donations</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentDonations && recentDonations.length > 0 ? (
            recentDonations.map((donation: any) => (
              <div key={donation.id} className="p-4 flex items-center gap-4">
                {donation.anonymous ? (
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-gray-400" />
                  </div>
                ) : donation.donor_avatar ? (
                  <img
                    src={donation.donor_avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-medium">
                      {donation.donor_name?.charAt(0) || 'A'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {donation.anonymous ? 'Anonymous' : donation.donor_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(donation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold text-emerald-600">
                  \${donation.amount?.toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Be the first to donate!
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

export function generateFundingProgress(options: CampaignOptions = {}): string {
  const { componentName = 'FundingProgress', endpoint = '/campaigns' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Target, TrendingUp, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  campaignId?: string;
  showDetails?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ campaignId, showDetails = true }) => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['active-campaigns', campaignId],
    queryFn: async () => {
      if (campaignId) {
        const response = await api.get<any>(\`${endpoint}/\${campaignId}\`);
        return [response?.data || response];
      }
      const response = await api.get<any>('${endpoint}?status=active&limit=3');
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Active Campaigns
        </h2>
        {!campaignId && (
          <Link
            to="/campaigns"
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign: any) => {
            const progress = campaign.goal ? (campaign.raised / campaign.goal) * 100 : 0;
            const daysLeft = campaign.end_date
              ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : null;

            return (
              <div key={campaign.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      to={\`/campaigns/\${campaign.id}\`}
                      className="font-medium text-gray-900 dark:text-white hover:text-emerald-600"
                    >
                      {campaign.name}
                    </Link>
                    {campaign.category && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.category}</p>
                    )}
                  </div>
                  {daysLeft !== null && (
                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {daysLeft > 0 ? \`\${daysLeft} days\` : 'Ended'}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-emerald-600">
                      \${(campaign.raised || 0).toLocaleString()}
                    </span>
                    {campaign.goal && (
                      <span className="text-gray-500 dark:text-gray-400">
                        \${campaign.goal.toLocaleString()} goal
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={\`rounded-full h-3 transition-all \${
                        progress >= 100 ? 'bg-emerald-500' : 'bg-emerald-400'
                      }\`}
                      style={{ width: \`\${Math.min(progress, 100)}%\` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                    <span>{Math.round(progress)}% funded</span>
                    <span>{campaign.donor_count || 0} donors</span>
                  </div>
                </div>

                {showDetails && campaign.recent_trend !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className={\`w-4 h-4 \${
                      campaign.recent_trend >= 0 ? 'text-green-500' : 'text-red-500'
                    }\`} />
                    <span className={\`\${
                      campaign.recent_trend >= 0 ? 'text-green-600' : 'text-red-600'
                    }\`}>
                      {campaign.recent_trend >= 0 ? '+' : ''}{campaign.recent_trend}% this week
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active campaigns</p>
          </div>
        )}
      </div>

      {!campaignId && campaigns && campaigns.length > 0 && (
        <Link
          to="/donate"
          className="mt-6 w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Give Now
        </Link>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
