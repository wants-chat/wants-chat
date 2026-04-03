/**
 * Affiliate Component Generators
 *
 * Generates affiliate marketing components:
 * - AffiliateLeaderboard: Top affiliates ranking
 * - AffiliateStats: Overall affiliate program statistics
 * - LinkGenerator: Affiliate link creation tool
 * - PayoutBalance: Affiliate earnings and payout info
 * - CommissionSummary: Commission breakdown and history
 */

export interface AffiliateLeaderboardOptions {
  componentName?: string;
  endpoint?: string;
  limit?: number;
  showEarnings?: boolean;
  showConversions?: boolean;
}

export function generateAffiliateLeaderboard(options: AffiliateLeaderboardOptions = {}): string {
  const {
    componentName = 'AffiliateLeaderboard',
    endpoint = '/affiliates/leaderboard',
    limit = 10,
    showEarnings = true,
    showConversions = true,
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, Medal, Crown, TrendingUp, DollarSign,
  Users, ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  limit?: number;
  period?: 'week' | 'month' | 'year' | 'all';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  limit = ${limit},
  period = 'month',
}) => {
  const { data: affiliates, isLoading } = useQuery({
    queryKey: ['affiliate-leaderboard', period, limit],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?period=\${period}&limit=\${limit}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
  };

  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (rank === 2) return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
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
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Affiliates</h2>
        </div>
        <select
          defaultValue={period}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {!affiliates || affiliates.length === 0 ? (
        <div className="p-8 text-center">
          <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No affiliates data yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {affiliates.map((affiliate: any, index: number) => {
            const rank = index + 1;
            const changeDirection = affiliate.rank_change > 0 ? 'up' : affiliate.rank_change < 0 ? 'down' : 'same';

            return (
              <div
                key={affiliate.id || index}
                className={\`p-4 flex items-center gap-4 \${getRankBgColor(rank)} border-l-4 \${
                  rank === 1 ? 'border-l-yellow-500' :
                  rank === 2 ? 'border-l-gray-400' :
                  rank === 3 ? 'border-l-amber-600' : 'border-l-transparent'
                }\`}
              >
                {/* Rank */}
                <div className="w-10 flex items-center justify-center">
                  {getRankIcon(rank)}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {affiliate.avatar ? (
                    <img
                      src={affiliate.avatar}
                      alt={affiliate.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {affiliate.name?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {affiliate.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{affiliate.username || affiliate.code}
                    </p>
                  </div>
                </div>

                {/* Rank Change */}
                {affiliate.rank_change !== undefined && affiliate.rank_change !== 0 && (
                  <div className={\`flex items-center gap-1 text-sm \${
                    changeDirection === 'up' ? 'text-green-600' : 'text-red-600'
                  }\`}>
                    {changeDirection === 'up' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    <span>{Math.abs(affiliate.rank_change)}</span>
                  </div>
                )}

                ${showConversions ? `{/* Conversions */}
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conversions</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {(affiliate.conversions || 0).toLocaleString()}
                  </p>
                </div>` : ''}

                ${showEarnings ? `{/* Earnings */}
                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Earnings</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    \${(affiliate.earnings || 0).toLocaleString()}
                  </p>
                </div>` : ''}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface AffiliateStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAffiliateStats(options: AffiliateStatsOptions = {}): string {
  const {
    componentName = 'AffiliateStats',
    endpoint = '/affiliates/stats',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, DollarSign, Link2, TrendingUp,
  ShoppingCart, Percent, Eye, MousePointer, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['affiliate-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        totalAffiliates: 156,
        activeAffiliates: 89,
        totalClicks: 45230,
        totalConversions: 1840,
        totalRevenue: 182500,
        totalCommissions: 27375,
        avgConversionRate: 4.07,
        avgOrderValue: 99.18,
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
      label: 'Total Affiliates',
      value: stats?.totalAffiliates || 0,
      subtext: \`\${stats?.activeAffiliates || 0} active\`,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Total Clicks',
      value: (stats?.totalClicks || 0).toLocaleString(),
      icon: MousePointer,
      color: 'cyan',
    },
    {
      label: 'Conversions',
      value: (stats?.totalConversions || 0).toLocaleString(),
      subtext: \`\${(stats?.avgConversionRate || 0).toFixed(2)}% rate\`,
      icon: ShoppingCart,
      color: 'green',
    },
    {
      label: 'Total Revenue',
      value: '\$' + (stats?.totalRevenue || 0).toLocaleString(),
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      label: 'Commissions Paid',
      value: '\$' + (stats?.totalCommissions || 0).toLocaleString(),
      icon: DollarSign,
      color: 'purple',
    },
    {
      label: 'Avg Order Value',
      value: '\$' + (stats?.avgOrderValue || 0).toFixed(2),
      icon: Percent,
      color: 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: 'text-cyan-600' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600' },
  };

  return (
    <div className={\`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 \${className || ''}\`}>
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

export interface LinkGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  showQRCode?: boolean;
  showUTMParams?: boolean;
}

export function generateLinkGenerator(options: LinkGeneratorOptions = {}): string {
  const {
    componentName = 'LinkGenerator',
    endpoint = '/affiliates/links',
    showQRCode = true,
    showUTMParams = true,
  } = options;

  return `import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Link2, Copy, Check, QrCode, Plus, ExternalLink,
  Settings, ChevronDown, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  affiliateId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  affiliateId,
  className,
}) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  ${showUTMParams ? `const [utmParams, setUtmParams] = useState({
    source: '',
    medium: '',
    campaign: '',
    content: '',
  });` : ''}

  const { data: recentLinks, isLoading: linksLoading } = useQuery({
    queryKey: ['affiliate-links', affiliateId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?affiliate_id=\${affiliateId || ''}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${endpoint}', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      setGeneratedLink(data.link || data.url);
      toast.success('Affiliate link generated!');
    },
    onError: () => {
      toast.error('Failed to generate link');
    },
  });

  const handleGenerate = () => {
    if (!targetUrl) {
      toast.error('Please enter a target URL');
      return;
    }

    generateMutation.mutate({
      target_url: targetUrl,
      campaign_name: campaignName,
      affiliate_id: affiliateId,
      ${showUTMParams ? 'utm_params: utmParams,' : ''}
    });
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <Link2 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generate Affiliate Link</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Target URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Target URL *
          </label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com/product"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Campaign Name (Optional)
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="summer-sale-2024"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        ${showUTMParams ? `{/* Advanced UTM Parameters */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Settings className="w-4 h-4" />
            <span>UTM Parameters</span>
            <ChevronDown className={\`w-4 h-4 transition-transform \${showAdvanced ? 'rotate-180' : ''}\`} />
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">UTM Source</label>
                <input
                  type="text"
                  value={utmParams.source}
                  onChange={(e) => setUtmParams(p => ({ ...p, source: e.target.value }))}
                  placeholder="affiliate"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">UTM Medium</label>
                <input
                  type="text"
                  value={utmParams.medium}
                  onChange={(e) => setUtmParams(p => ({ ...p, medium: e.target.value }))}
                  placeholder="referral"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">UTM Campaign</label>
                <input
                  type="text"
                  value={utmParams.campaign}
                  onChange={(e) => setUtmParams(p => ({ ...p, campaign: e.target.value }))}
                  placeholder="summer-2024"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">UTM Content</label>
                <input
                  type="text"
                  value={utmParams.content}
                  onChange={(e) => setUtmParams(p => ({ ...p, content: e.target.value }))}
                  placeholder="banner-ad"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>` : ''}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !targetUrl}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
        >
          {generateMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          Generate Link
        </button>

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
              Your Affiliate Link:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}

        ${showQRCode ? `{/* QR Code Placeholder */}
        {generatedLink && (
          <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="text-center">
              <QrCode className="w-32 h-32 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                QR Code will be generated here
              </p>
            </div>
          </div>
        )}` : ''}

        {/* Recent Links */}
        {recentLinks && recentLinks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Links</h3>
            <div className="space-y-2">
              {recentLinks.slice(0, 5).map((link: any) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm"
                >
                  <span className="truncate max-w-[200px] text-gray-600 dark:text-gray-400">
                    {link.target_url}
                  </span>
                  <span className="text-gray-500">
                    {link.clicks || 0} clicks
                  </span>
                </div>
              ))}
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

export interface PayoutBalanceOptions {
  componentName?: string;
  endpoint?: string;
  showPendingPayout?: boolean;
  showPayoutHistory?: boolean;
}

export function generatePayoutBalance(options: PayoutBalanceOptions = {}): string {
  const {
    componentName = 'PayoutBalance',
    endpoint = '/affiliates/balance',
    showPendingPayout = true,
    showPayoutHistory = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet, DollarSign, Clock, CheckCircle,
  ArrowUpRight, Calendar, CreditCard, Loader2, AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  affiliateId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  affiliateId,
  className,
}) => {
  const queryClient = useQueryClient();
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const { data: balance, isLoading } = useQuery({
    queryKey: ['affiliate-balance', affiliateId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}\${affiliateId ? \`?affiliate_id=\${affiliateId}\` : ''}\`);
      return response?.data || response || {
        available: 1250.00,
        pending: 450.00,
        lifetime: 15780.00,
        nextPayout: '2024-02-01',
        minimumPayout: 50,
        payoutMethod: 'PayPal',
      };
    },
  });

  ${showPayoutHistory ? `const { data: payoutHistory } = useQuery({
    queryKey: ['payout-history', affiliateId],
    queryFn: async () => {
      const response = await api.get<any>(\`/affiliates/payouts\${affiliateId ? \`?affiliate_id=\${affiliateId}\` : ''}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });` : ''}

  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<any>('/affiliates/payouts/request', { affiliate_id: affiliateId });
      return response?.data || response;
    },
    onSuccess: () => {
      toast.success('Payout requested successfully');
      queryClient.invalidateQueries({ queryKey: ['affiliate-balance'] });
      setShowPayoutModal(false);
    },
    onError: () => {
      toast.error('Failed to request payout');
    },
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const canRequestPayout = balance?.available >= (balance?.minimumPayout || 50);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
          <Wallet className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Earnings & Payouts</h2>
        </div>

        <div className="p-4">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Available Balance */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100">Available Balance</span>
                <DollarSign className="w-5 h-5 text-green-100" />
              </div>
              <p className="text-3xl font-bold">\${(balance?.available || 0).toFixed(2)}</p>
              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={!canRequestPayout}
                className={\`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors \${
                  canRequestPayout
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-white/10 text-green-200 cursor-not-allowed'
                }\`}
              >
                Request Payout
              </button>
            </div>

            ${showPendingPayout ? `{/* Pending */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">Pending</span>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                \${(balance?.pending || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Clears in 30 days
              </p>
            </div>` : ''}

            {/* Lifetime Earnings */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400">Lifetime Earnings</span>
                <ArrowUpRight className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                \${(balance?.lifetime || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total earned
              </p>
            </div>
          </div>

          {/* Payout Info */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Next Payout Date</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {balance?.nextPayout ? formatDate(balance.nextPayout) : 'Not scheduled'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Payout Method</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {balance?.payoutMethod || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {!canRequestPayout && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span>Minimum payout is \${balance?.minimumPayout || 50}. Keep earning!</span>
            </div>
          )}

          ${showPayoutHistory ? `{/* Payout History */}
          {payoutHistory && payoutHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Payouts</h3>
              <div className="space-y-2">
                {payoutHistory.slice(0, 5).map((payout: any) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
                        payout.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : payout.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }\`}>
                        {payout.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          \${(payout.amount || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(payout.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={\`px-2 py-1 text-xs font-medium rounded-full \${
                      payout.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : payout.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }\`}>
                      {payout.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}` : ''}
        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPayoutModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Request Payout
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You are about to request a payout of <strong>\${(balance?.available || 0).toFixed(2)}</strong> to your {balance?.payoutMethod || 'default'} account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => requestPayoutMutation.mutate()}
                disabled={requestPayoutMutation.isPending}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                {requestPayoutMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

export interface CommissionSummaryOptions {
  componentName?: string;
  endpoint?: string;
  showBreakdown?: boolean;
  showTiers?: boolean;
}

export function generateCommissionSummary(options: CommissionSummaryOptions = {}): string {
  const {
    componentName = 'CommissionSummary',
    endpoint = '/affiliates/commissions',
    showBreakdown = true,
    showTiers = true,
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Percent, DollarSign, TrendingUp, Package,
  Users, Calendar, ChevronDown, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  affiliateId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  affiliateId,
  className,
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['commission-summary', affiliateId, period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/summary?affiliate_id=\${affiliateId || ''}&period=\${period}\`);
      return response?.data || response || {
        totalCommissions: 2450.00,
        commissionRate: 15,
        totalSales: 16333.33,
        totalOrders: 48,
        avgOrderValue: 340.28,
        breakdown: [
          { product: 'Pro Plan', sales: 8500, commission: 1275, orders: 25 },
          { product: 'Team Plan', sales: 5200, commission: 780, orders: 13 },
          { product: 'Enterprise', sales: 2633.33, commission: 395, orders: 10 },
        ],
        tiers: [
          { name: 'Bronze', min: 0, max: 1000, rate: 10, current: true },
          { name: 'Silver', min: 1001, max: 5000, rate: 12.5 },
          { name: 'Gold', min: 5001, max: 10000, rate: 15 },
          { name: 'Platinum', min: 10001, max: null, rate: 20 },
        ],
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

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commission Summary</h2>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Commission</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              \${(summary?.totalCommissions || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Commission Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary?.commissionRate || 0}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Sales</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              \${(summary?.totalSales || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Orders</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary?.totalOrders || 0}
            </p>
          </div>
        </div>

        ${showBreakdown ? `{/* Breakdown by Product */}
        {summary?.breakdown && summary.breakdown.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Breakdown by Product</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Product</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Sales</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Commission</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500 dark:text-gray-400">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.breakdown.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-3 px-3 text-sm text-gray-900 dark:text-white">{item.product}</td>
                      <td className="py-3 px-3 text-sm text-right text-gray-600 dark:text-gray-400">
                        \${(item.sales || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-sm text-right font-medium text-green-600">
                        \${(item.commission || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-sm text-right text-gray-600 dark:text-gray-400">
                        {item.orders || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}` : ''}

        ${showTiers ? `{/* Commission Tiers */}
        {summary?.tiers && summary.tiers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Commission Tiers</h3>
            <div className="space-y-2">
              {summary.tiers.map((tier: any, index: number) => (
                <div
                  key={index}
                  className={\`flex items-center justify-between p-3 rounded-lg \${
                    tier.current
                      ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                      : 'bg-gray-50 dark:bg-gray-900/50'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    {tier.current && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded">
                        Current
                      </span>
                    )}
                    <span className={\`font-medium \${tier.current ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'}\`}>
                      {tier.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      \${tier.min.toLocaleString()}{tier.max ? \` - \$\${tier.max.toLocaleString()}\` : '+'}
                    </span>
                  </div>
                  <span className={\`text-lg font-bold \${tier.current ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300'}\`}>
                    {tier.rate}%
                  </span>
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
