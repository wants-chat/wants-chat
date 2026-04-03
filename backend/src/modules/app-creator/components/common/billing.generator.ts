/**
 * Billing Generator
 *
 * Generates BillingOverview components with:
 * - Current plan display
 * - Usage statistics
 * - Invoice history
 * - Payment method management
 * - Upgrade/downgrade options
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export interface BillingOverviewOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
  plans?: BillingPlan[];
  showUsage?: boolean;
  showInvoices?: boolean;
  showPaymentMethod?: boolean;
  showUpgrade?: boolean;
  currency?: string;
}

/**
 * Generate a BillingOverview component
 */
export function generateBillingOverview(options: BillingOverviewOptions = {}): string {
  const {
    plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'monthly',
        features: ['5 projects', '1GB storage', 'Email support'],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29,
        interval: 'monthly',
        features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'],
        popular: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        interval: 'monthly',
        features: ['Everything in Pro', 'Unlimited storage', 'Dedicated support', 'Custom integrations', 'SSO'],
      },
    ],
    showUsage = true,
    showInvoices = true,
    showPaymentMethod = true,
    showUpgrade = true,
    currency = 'USD',
  } = options;

  const componentName = options.componentName || 'BillingOverview';
  const endpoint = options.endpoint || '/billing';
  const queryKey = options.queryKey || 'billing';

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  DollarSign,
  Download,
  Calendar,
  Check,
  ChevronRight,
  AlertCircle,
  Loader2,
  Star,
  Zap,
  HardDrive,
  Users,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface BillingData {
  currentPlan: {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    nextBillingDate?: string;
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    trialEndsAt?: string;
  };
  usage?: {
    projects: { used: number; limit: number };
    storage: { used: number; limit: number; unit: string };
    apiCalls?: { used: number; limit: number };
    teamMembers?: { used: number; limit: number };
  };
  paymentMethod?: {
    type: 'card' | 'bank' | 'paypal';
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    email?: string;
  };
  invoices?: Array<{
    id: string;
    number: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    downloadUrl?: string;
  }>;
}

interface ${componentName}Props {
  className?: string;
  data?: BillingData;
  onUpgrade?: (planId: string) => void;
  onDowngrade?: (planId: string) => void;
  onUpdatePayment?: () => void;
  onCancelSubscription?: () => void;
}

const plans = ${JSON.stringify(plans, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  data: propData,
  onUpgrade,
  onDowngrade,
  onUpdatePayment,
  onCancelSubscription,
}) => {
  const queryClient = useQueryClient();
  const [showPlans, setShowPlans] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch billing data:', err);
        return null;
      }
    },
    enabled: !propData,
  });

  const billingData = propData || fetchedData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: '${currency}',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatBytes = (bytes: number, unit: string = 'GB') => {
    if (unit === 'GB') return \`\${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB\`;
    if (unit === 'MB') return \`\${(bytes / 1024 / 1024).toFixed(2)} MB\`;
    return \`\${bytes} bytes\`;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0 || limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
      paid: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Paid',
      },
      pending: {
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending',
      },
      failed: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Failed',
      },
      refunded: {
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        icon: <RefreshCw className="w-4 h-4" />,
        label: 'Refunded',
      },
    };
    return configs[status] || configs.pending;
  };

  const getCardBrandIcon = (brand?: string) => {
    // In real implementation, you'd use actual card brand icons
    return <CreditCard className="w-8 h-8 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-8 text-center', className)}>
        <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Unable to load billing information</p>
      </div>
    );
  }

  const currentPlanData = plans.find(p => p.id === billingData.currentPlan?.id);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your subscription and billing information
          </p>
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {billingData.currentPlan?.name || 'Free'} Plan
                </h3>
                {billingData.currentPlan?.status === 'trialing' && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                    Trial
                  </span>
                )}
                {billingData.currentPlan?.status === 'past_due' && (
                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                    Past Due
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(billingData.currentPlan?.price || 0)}
                <span className="text-sm font-normal text-gray-500">
                  /{billingData.currentPlan?.interval || 'month'}
                </span>
              </p>
              {billingData.currentPlan?.nextBillingDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Next billing date: {formatDate(billingData.currentPlan.nextBillingDate)}
                </p>
              )}
              {billingData.currentPlan?.trialEndsAt && billingData.currentPlan?.status === 'trialing' && (
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  Trial ends: {formatDate(billingData.currentPlan.trialEndsAt)}
                </p>
              )}
            </div>
          </div>

          ${showUpgrade ? `<div className="flex items-center gap-3">
            <button
              onClick={() => setShowPlans(!showPlans)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Zap className="w-4 h-4" />
              {billingData.currentPlan?.id === 'enterprise' ? 'View Plans' : 'Upgrade'}
            </button>
            {onCancelSubscription && billingData.currentPlan?.id !== 'free' && (
              <button
                onClick={onCancelSubscription}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                Cancel
              </button>
            )}
          </div>` : ''}
        </div>

        {/* Plan Features */}
        {currentPlanData && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Plan includes:</p>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {currentPlanData.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      ${showUsage ? `{/* Usage Stats */}
      {billingData.usage && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Projects */}
            {billingData.usage.projects && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Projects</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {billingData.usage.projects.used}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {billingData.usage.projects.limit === -1 ? 'Unlimited' : billingData.usage.projects.limit}
                  </span>
                </div>
                {billingData.usage.projects.limit !== -1 && (
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getUsageColor(getUsagePercentage(billingData.usage.projects.used, billingData.usage.projects.limit)))}
                      style={{ width: \`\${getUsagePercentage(billingData.usage.projects.used, billingData.usage.projects.limit)}%\` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Storage */}
            {billingData.usage.storage && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(billingData.usage.storage.used / 1024 / 1024 / 1024).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    GB / {billingData.usage.storage.limit === -1 ? 'Unlimited' : \`\${billingData.usage.storage.limit / 1024 / 1024 / 1024} GB\`}
                  </span>
                </div>
                {billingData.usage.storage.limit !== -1 && (
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getUsageColor(getUsagePercentage(billingData.usage.storage.used, billingData.usage.storage.limit)))}
                      style={{ width: \`\${getUsagePercentage(billingData.usage.storage.used, billingData.usage.storage.limit)}%\` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* API Calls */}
            {billingData.usage.apiCalls && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Calls</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {billingData.usage.apiCalls.used.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {billingData.usage.apiCalls.limit === -1 ? 'Unlimited' : billingData.usage.apiCalls.limit.toLocaleString()}
                  </span>
                </div>
                {billingData.usage.apiCalls.limit !== -1 && (
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getUsageColor(getUsagePercentage(billingData.usage.apiCalls.used, billingData.usage.apiCalls.limit)))}
                      style={{ width: \`\${getUsagePercentage(billingData.usage.apiCalls.used, billingData.usage.apiCalls.limit)}%\` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Team Members */}
            {billingData.usage.teamMembers && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {billingData.usage.teamMembers.used}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {billingData.usage.teamMembers.limit === -1 ? 'Unlimited' : billingData.usage.teamMembers.limit}
                  </span>
                </div>
                {billingData.usage.teamMembers.limit !== -1 && (
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getUsageColor(getUsagePercentage(billingData.usage.teamMembers.used, billingData.usage.teamMembers.limit)))}
                      style={{ width: \`\${getUsagePercentage(billingData.usage.teamMembers.used, billingData.usage.teamMembers.limit)}%\` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}` : ''}

      ${showPaymentMethod ? `{/* Payment Method */}
      {billingData.paymentMethod && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h3>
            {onUpdatePayment && (
              <button
                onClick={onUpdatePayment}
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Edit2 className="w-4 h-4" />
                Update
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {getCardBrandIcon(billingData.paymentMethod.brand)}
            <div>
              {billingData.paymentMethod.type === 'card' && (
                <>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {billingData.paymentMethod.brand} ending in {billingData.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expires {billingData.paymentMethod.expiryMonth}/{billingData.paymentMethod.expiryYear}
                  </p>
                </>
              )}
              {billingData.paymentMethod.type === 'paypal' && (
                <p className="font-medium text-gray-900 dark:text-white">
                  PayPal - {billingData.paymentMethod.email}
                </p>
              )}
            </div>
          </div>
        </div>
      )}` : ''}

      ${showInvoices ? `{/* Invoice History */}
      {billingData.invoices && billingData.invoices.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {billingData.invoices.map((invoice) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {invoice.number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                          statusConfig.bgColor,
                          statusConfig.color
                        )}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {invoice.downloadUrl && (
                          <a
                            href={invoice.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}` : ''}

      {/* Plans Modal/Section */}
      ${showUpgrade ? `{showPlans && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Plans</h3>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  billingInterval === 'monthly'
                    ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  billingInterval === 'yearly'
                    ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                Yearly
                <span className="ml-1 text-xs text-green-600 dark:text-green-400">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrentPlan = plan.id === billingData.currentPlan?.id;
              const price = billingInterval === 'yearly' ? plan.price * 12 * 0.8 : plan.price;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-xl border p-6',
                    plan.popular
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700',
                    isCurrentPlan && 'ring-2 ring-blue-500'
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                        <Star className="w-3 h-3" />
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-gray-500">/{billingInterval === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      if (isCurrentPlan) return;
                      const isUpgrade = plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === billingData.currentPlan?.id);
                      if (isUpgrade && onUpgrade) onUpgrade(plan.id);
                      else if (!isUpgrade && onDowngrade) onDowngrade(plan.id);
                    }}
                    disabled={isCurrentPlan}
                    className={cn(
                      'w-full py-2 rounded-lg font-medium transition-colors',
                      isCurrentPlan
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}` : ''}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate billing with custom plans
 */
export function generateCustomBillingOverview(
  plans: BillingPlan[],
  options?: Partial<BillingOverviewOptions>
): string {
  return generateBillingOverview({
    plans,
    ...options,
  });
}
