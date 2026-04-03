/**
 * Insurance Stats Component Generator
 */

export interface InsuranceStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateInsuranceStats(options: InsuranceStatsOptions = {}): string {
  const { componentName = 'InsuranceStats', endpoint = '/insurance/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Shield, FileText, DollarSign, Users, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertTriangle, PieChart, BarChart3, Activity } from 'lucide-react';
import { api } from '@/lib/api';

interface InsuranceStatsData {
  // Policies
  total_policies: number;
  active_policies: number;
  pending_policies: number;
  expired_policies: number;
  policies_growth: number;

  // Claims
  total_claims: number;
  pending_claims: number;
  approved_claims: number;
  rejected_claims: number;
  claims_this_month: number;

  // Financial
  total_coverage: number;
  total_premiums_collected: number;
  total_claims_paid: number;
  loss_ratio: number;

  // Customers
  total_customers: number;
  new_customers_this_month: number;
  customer_retention_rate: number;

  // By Type
  policies_by_type: Array<{ type: string; count: number; percentage: number }>;
  claims_by_type: Array<{ type: string; count: number; amount: number }>;

  // Recent Activity
  recent_policies: Array<{ id: string; policy_number: string; type: string; created_at: string }>;
  recent_claims: Array<{ id: string; claim_number: string; status: string; amount: number; created_at: string }>;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['insurance-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
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

  const policyTypeColors: Record<string, string> = {
    health: 'bg-red-500',
    auto: 'bg-blue-500',
    home: 'bg-purple-500',
    life: 'bg-green-500',
    business: 'bg-orange-500',
    travel: 'bg-cyan-500',
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            {stats?.policies_growth !== undefined && (
              <div className={\`flex items-center gap-1 text-sm \${stats.policies_growth >= 0 ? 'text-green-500' : 'text-red-500'}\`}>
                {stats.policies_growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(stats.policies_growth)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_policies?.toLocaleString() || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Policies</p>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              {stats?.active_policies || 0} active
            </span>
            <span className="flex items-center gap-1 text-yellow-600">
              <Clock className="w-3 h-3" />
              {stats?.pending_policies || 0} pending
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">{stats?.claims_this_month || 0} this month</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_claims?.toLocaleString() || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Claims</p>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-yellow-600">
              <Clock className="w-3 h-3" />
              {stats?.pending_claims || 0} pending
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              {stats?.approved_claims || 0} approved
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">\${(stats?.total_premiums_collected || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Premiums Collected</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Claims Paid</span>
              <span>\${(stats?.total_claims_paid || 0).toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-red-500 h-1.5 rounded-full"
                style={{ width: \`\${Math.min((stats?.loss_ratio || 0), 100)}%\` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-green-500">+{stats?.new_customers_this_month || 0}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_customers?.toLocaleString() || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Customers</p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Retention Rate</span>
              <span>{stats?.customer_retention_rate || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: \`\${stats?.customer_retention_rate || 0}%\` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coverage & Loss Ratio */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Policies by Type</h3>
          </div>
          {stats?.policies_by_type && stats.policies_by_type.length > 0 ? (
            <div className="space-y-4">
              {stats.policies_by_type.map((item: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={\`w-3 h-3 rounded-full \${policyTypeColors[item.type] || 'bg-gray-500'}\`} />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{item.type}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                      <span className="text-gray-500 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`h-2 rounded-full \${policyTypeColors[item.type] || 'bg-gray-500'}\`}
                      style={{ width: \`\${item.percentage}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Claims by Type</h3>
          </div>
          {stats?.claims_by_type && stats.claims_by_type.length > 0 ? (
            <div className="space-y-4">
              {stats.claims_by_type.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${policyTypeColors[item.type] ? policyTypeColors[item.type].replace('bg-', 'bg-opacity-20 text-') : 'bg-gray-100 text-gray-500'}\`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{item.type}</p>
                      <p className="text-sm text-gray-500">{item.count} claims</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">\${item.amount?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No data available</div>
          )}
        </div>
      </div>

      {/* Loss Ratio Alert */}
      {stats?.loss_ratio > 70 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-400">High Loss Ratio Alert</p>
              <p className="text-sm text-red-700 dark:text-red-500">
                Your loss ratio is at {stats.loss_ratio}%. Consider reviewing underwriting criteria and claims processes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Policies</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats?.recent_policies && stats.recent_policies.length > 0 ? (
              stats.recent_policies.slice(0, 5).map((policy: any) => (
                <div key={policy.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{policy.policy_number}</p>
                    <p className="text-sm text-gray-500 capitalize">{policy.type} Insurance</p>
                  </div>
                  <span className="text-sm text-gray-400">{new Date(policy.created_at).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No recent policies</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Claims</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats?.recent_claims && stats.recent_claims.length > 0 ? (
              stats.recent_claims.slice(0, 5).map((claim: any) => (
                <div key={claim.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">#{claim.claim_number}</p>
                    <p className="text-sm text-gray-500">\${claim.amount?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                      claim.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      claim.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }\`}>
                      {claim.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(claim.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No recent claims</div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Financial Summary</h3>
        </div>
        <div className="grid sm:grid-cols-4 gap-6">
          <div>
            <p className="text-purple-200 text-sm">Total Coverage</p>
            <p className="text-2xl font-bold">\${(stats?.total_coverage || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-purple-200 text-sm">Premiums Collected</p>
            <p className="text-2xl font-bold">\${(stats?.total_premiums_collected || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-purple-200 text-sm">Claims Paid</p>
            <p className="text-2xl font-bold">\${(stats?.total_claims_paid || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-purple-200 text-sm">Loss Ratio</p>
            <p className="text-2xl font-bold">{stats?.loss_ratio || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
