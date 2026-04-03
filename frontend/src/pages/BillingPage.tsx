import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import {
  billingAPI,
  type Subscription,
  type Credits,
  type SubscriptionPlan,
  type CreditPackage,
  type Transaction,
  type UsageStats,
} from '../lib/api/billing';
import { toast } from 'sonner';
import {
  CreditCard,
  Zap,
  Crown,
  Heart,
  Check,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Calendar,
  Coins,
  BarChart3,
  History,
  Settings,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { AppSidebar } from '../components/AppSidebar';
import { SettingsSubmenu } from '../components/layout/SettingsSubmenu';

const BillingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'subscription' | 'credits' | 'usage' | 'history'>('subscription');
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // Check for success/cancel from Stripe checkout
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'credits') {
      setActiveTab('credits');
    }

    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Your account has been updated.');
      navigate('/billing' + (tab ? `?tab=${tab}` : ''), { replace: true });
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Payment was canceled.');
      navigate('/billing' + (tab ? `?tab=${tab}` : ''), { replace: true });
    }
  }, [searchParams, navigate]);

  // Default plans for when API fails - iOS App Store pricing tiers
  const defaultPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Experience everything we offer',
      priceMonthly: 0,
      priceYearly: 0,
      includedCredits: 1000000,
      maxRequestsPerDay: 3,
      maxTokensPerRequest: 4096,
      allowedModelTiers: ['free', 'standard'],
      features: [
        '3 AI messages/day',
        'All 30+ AI models',
        '500+ tools (3 pins max)',
        '3 image generations/month',
        '1 app project',
        'Limited workflows',
        'Community support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For individuals who want more',
      priceMonthly: 1999, // $19.99
      priceYearly: 19999, // $199.99
      includedCredits: 20000000,
      maxRequestsPerDay: null,
      maxTokensPerRequest: 16384,
      allowedModelTiers: ['free', 'standard', 'premium'],
      features: [
        '2,500 AI messages/month',
        'All 30+ AI models',
        'Unlimited tool uses',
        '100 image generations/month',
        '10 video generations/month',
        'All export formats',
        'Basic workflows (50/mo)',
        'Priority support',
      ],
    },
    {
      id: 'team',
      name: 'Team',
      description: 'For teams & power users',
      priceMonthly: 4999, // $49.99
      priceYearly: 49999, // $499.99
      includedCredits: 60000000,
      maxRequestsPerDay: null,
      maxTokensPerRequest: 32768,
      allowedModelTiers: ['free', 'standard', 'premium', 'enterprise'],
      features: [
        'Unlimited AI messages',
        'Unlimited image generation',
        '100 video generations/month',
        'No-code app builder',
        'Full workflow automation',
        '5 team members included',
        'API access',
        'Advanced analytics',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For organizations at scale',
      priceMonthly: 14999, // $149.99
      priceYearly: 149999, // $1499.99
      includedCredits: 100000000,
      maxRequestsPerDay: null,
      maxTokensPerRequest: null,
      allowedModelTiers: ['free', 'standard', 'premium', 'enterprise'],
      features: [
        'Everything unlimited',
        'Unlimited team members',
        'Custom AI model training',
        'SSO & SAML',
        'Dedicated account manager',
        'Custom integrations',
        '99.9% SLA guarantee',
        'On-premise deployment',
      ],
    },
  ];

  // Fetch subscription plans
  const { data: fetchedPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => billingAPI.getPlans(),
    retry: 1,
  });

  const plans = fetchedPlans && fetchedPlans.length > 0 ? fetchedPlans : defaultPlans;

  // Fetch credit packages
  const { data: creditPackages = [] } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: () => billingAPI.getCreditPackages(),
    retry: 1,
  });

  // Default subscription for when API fails
  const defaultSubscription: Subscription = {
    plan: 'free',
    planName: 'Free',
    status: 'active',
    includedCredits: 1000000,
    maxRequestsPerDay: 50,
    maxTokensPerRequest: 4096,
    allowedModelTiers: ['free', 'standard'],
    features: ['Access to standard models', '50 messages per day', 'Basic features'],
  };

  // Default credits for when API fails
  const defaultCredits: Credits = {
    balance: 1000000,
    includedBalance: 1000000,
    purchasedBalance: 0,
    lifetimeUsage: 0,
  };

  // Fetch current subscription
  const { data: fetchedSubscription, isLoading: subscriptionLoading, error: subscriptionError } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: () => billingAPI.getSubscription(),
    retry: 1,
  });

  // Use fetched subscription or default
  const subscription = fetchedSubscription || defaultSubscription;

  // Fetch credits
  const { data: fetchedCredits } = useQuery({
    queryKey: ['user-credits'],
    queryFn: () => billingAPI.getCredits(),
    retry: 1,
  });

  // Use fetched credits or default
  const credits = fetchedCredits || defaultCredits;

  // Fetch usage stats
  const { data: usageStats } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: () => billingAPI.getUsageStats(),
    enabled: activeTab === 'usage',
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => billingAPI.getTransactions(50),
    enabled: activeTab === 'history',
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: ({ planId, interval }: { planId: string; interval: 'monthly' | 'yearly' }) =>
      billingAPI.createCheckoutSession(
        planId,
        interval,
        `${window.location.origin}/billing?success=true`,
        `${window.location.origin}/billing?canceled=true`,
      ),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error('Failed to start checkout. Please try again.');
    },
  });

  // Credit checkout mutation
  const creditCheckoutMutation = useMutation({
    mutationFn: (packageId: string) =>
      billingAPI.createCreditCheckout(
        packageId,
        `${window.location.origin}/billing?success=true&tab=credits`,
        `${window.location.origin}/billing?canceled=true&tab=credits`,
      ),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error('Failed to start checkout. Please try again.');
    },
  });

  // Billing portal mutation
  const billingPortalMutation = useMutation({
    mutationFn: () =>
      billingAPI.createBillingPortalSession(`${window.location.origin}/billing`),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error('Failed to open billing portal.');
    },
  });

  const formatCredits = (microcents: number) => {
    const dollars = microcents / 1000000;
    return `$${dollars.toFixed(2)}`;
  };

  const formatPrice = (cents: number) => {
    const dollars = cents / 100;
    // Show decimals if price has cents, otherwise show whole number
    return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return Heart;
      case 'pro':
        return Zap;
      case 'team':
        return Sparkles;
      case 'enterprise':
        return Crown;
      default:
        return Heart;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'text-gray-500';
      case 'pro':
        return 'text-blue-500';
      case 'team':
        return 'text-purple-500';
      case 'enterprise':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };

  if (subscriptionLoading) {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center',
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      )}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className={cn(
      'flex h-full',
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    )}>
      {/* Sidebar */}
      <AppSidebar />

      {/* Settings Submenu */}
      <SettingsSubmenu />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={cn(
          'border-b px-6 py-4',
          isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
        )}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold">{t('billing.title')}</h1>
            <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
              {t('billing.subtitle')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className={cn('border-b', isDark ? 'border-gray-800' : 'border-gray-200')}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex gap-6">
              {[
                { id: 'subscription', label: t('billing.tabs.subscription'), icon: CreditCard },
                { id: 'credits', label: t('billing.tabs.credits'), icon: Coins },
                { id: 'usage', label: t('billing.tabs.usage'), icon: BarChart3 },
                { id: 'history', label: t('billing.tabs.history'), icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 py-4 border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-500'
                      : cn(
                          'border-transparent',
                          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        )
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-8">
            {/* Current Plan Card */}
            <div className={cn(
              'p-6 rounded-xl border',
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('billing.currentPlan.title')}</h2>
                {subscription?.plan !== 'free' && (
                  <button
                    onClick={() => billingPortalMutation.mutate()}
                    disabled={billingPortalMutation.isPending}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
                      isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    {t('billing.currentPlan.manageBilling')}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {subscription && React.createElement(getPlanIcon(subscription.plan), {
                  className: cn('h-10 w-10', getPlanColor(subscription.plan))
                })}
                <div>
                  <h3 className="text-2xl font-bold capitalize">
                    {subscription?.planName || subscription?.plan || 'Free'}
                  </h3>
                  <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {subscription?.status === 'active' ? t('billing.currentPlan.active') : t('billing.currentPlan.noActive')}
                    {subscription?.currentPeriodEnd && (
                      <> · Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>

              {subscription?.cancelAtPeriodEnd && (
                <div className={cn(
                  'mt-4 p-4 rounded-lg flex items-start gap-2',
                  isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'
                )}>
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">
                      Subscription ending
                    </p>
                    <p className={cn('text-sm', isDark ? 'text-yellow-300/70' : 'text-yellow-700')}>
                      Your subscription will end on {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Billing Interval Toggle */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setSelectedInterval('monthly')}
                className={cn(
                  'px-6 py-3 rounded-xl transition-colors font-medium',
                  selectedInterval === 'monthly'
                    ? 'bg-emerald-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                )}
              >
                {t('billing.interval.monthly')}
              </button>
              <button
                onClick={() => setSelectedInterval('yearly')}
                className={cn(
                  'px-6 py-3 rounded-xl transition-colors flex items-center gap-2 font-medium',
                  selectedInterval === 'yearly'
                    ? 'bg-emerald-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                )}
              >
                {t('billing.interval.yearly')}
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full font-semibold',
                  selectedInterval === 'yearly'
                    ? 'bg-white/20 text-white'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                )}>
                  {t('billing.interval.twoMonthsFree')}
                </span>
              </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrentPlan = subscription?.plan === plan.id;
                const price = selectedInterval === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                const PlanIcon = getPlanIcon(plan.id);

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'relative p-6 rounded-xl border transition-all',
                      isCurrentPlan && 'ring-2 ring-emerald-500',
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
                      plan.id === 'pro' && 'border-blue-500'
                    )}
                  >
                    {plan.id === 'pro' && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                        Popular
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <PlanIcon className={cn('h-6 w-6', getPlanColor(plan.id))} />
                      {isCurrentPlan && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                        )}>
                          Current
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className={cn(
                      'text-sm mb-4',
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    )}>
                      {plan.description}
                    </p>

                    <div className="mb-4">
                      <span className="text-3xl font-bold">
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          /{selectedInterval === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.features.length > 4 && (
                      <button
                        onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                        className={cn(
                          'flex items-center gap-1 text-sm mb-4',
                          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        )}
                      >
                        {expandedPlan === plan.id ? (
                          <>Show less <ChevronUp className="h-4 w-4" /></>
                        ) : (
                          <>Show more <ChevronDown className="h-4 w-4" /></>
                        )}
                      </button>
                    )}

                    {expandedPlan === plan.id && (
                      <ul className="space-y-2 mb-6">
                        {plan.features.slice(4).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      onClick={() => {
                        if (plan.id !== 'free' && !isCurrentPlan) {
                          checkoutMutation.mutate({ planId: plan.id, interval: selectedInterval });
                        }
                      }}
                      disabled={isCurrentPlan || plan.id === 'free' || checkoutMutation.isPending}
                      className={cn(
                        'w-full py-2 rounded-lg font-medium transition-colors',
                        isCurrentPlan || plan.id === 'free'
                          ? isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                          : plan.id === 'pro'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : plan.id === 'enterprise'
                              ? 'bg-amber-500 text-white hover:bg-amber-600'
                              : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      )}
                    >
                      {isCurrentPlan ? t('billing.plans.currentPlan') : plan.id === 'free' ? t('billing.plans.currentPlan') : t('billing.plans.selectPlan')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="space-y-8">
            {/* Current Balance */}
            <div className={cn(
              'p-6 rounded-xl border',
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <h2 className="text-lg font-semibold mb-4">{t('billing.credits.title')}</h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{t('billing.credits.totalBalance')}</p>
                  <p className="text-3xl font-bold text-emerald-500">{formatCredits(credits?.balance || 0)}</p>
                </div>
                <div>
                  <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{t('billing.credits.includedMonthly')}</p>
                  <p className="text-2xl font-semibold">{formatCredits(credits?.includedBalance || 0)}</p>
                </div>
                <div>
                  <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{t('billing.credits.purchased')}</p>
                  <p className="text-2xl font-semibold">{formatCredits(credits?.purchasedBalance || 0)}</p>
                </div>
              </div>
            </div>

            {/* Credit Packages */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('billing.credits.buyMore')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      'relative p-4 rounded-xl border transition-all',
                      pkg.isPopular && 'ring-2 ring-emerald-500',
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    )}
                  >
                    {pkg.isPopular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}

                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <p className={cn('text-sm mb-3', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {pkg.description}
                    </p>

                    <p className="text-2xl font-bold mb-1">
                      {formatCredits(pkg.creditAmount)}
                    </p>
                    {pkg.bonusAmount > 0 && (
                      <p className="text-sm text-emerald-500 mb-3">
                        +{formatCredits(pkg.bonusAmount)} bonus
                      </p>
                    )}

                    <button
                      onClick={() => creditCheckoutMutation.mutate(pkg.id)}
                      disabled={creditCheckoutMutation.isPending}
                      className={cn(
                        'w-full py-2 rounded-lg font-medium transition-colors',
                        pkg.isPopular
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      )}
                    >
                      Buy for {formatPrice(pkg.price)}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-8">
            <div className={cn(
              'p-6 rounded-xl border',
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <h2 className="text-lg font-semibold mb-4">{t('billing.usage.title')}</h2>

              {usageStats ? (
                <>
                  {/* Totals */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className={cn('p-4 rounded-lg', isDark ? 'bg-gray-700' : 'bg-gray-100')}>
                      <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{t('billing.usage.totalRequests')}</p>
                      <p className="text-2xl font-bold">{usageStats.totals.requests.toLocaleString()}</p>
                    </div>
                    <div className={cn('p-4 rounded-lg', isDark ? 'bg-gray-700' : 'bg-gray-100')}>
                      <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{t('billing.usage.inputTokens')}</p>
                      <p className="text-2xl font-bold">{usageStats.totals.inputTokens.toLocaleString()}</p>
                    </div>
                    <div className={cn('p-4 rounded-lg', isDark ? 'bg-gray-700' : 'bg-gray-100')}>
                      <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{t('billing.usage.outputTokens')}</p>
                      <p className="text-2xl font-bold">{usageStats.totals.outputTokens.toLocaleString()}</p>
                    </div>
                    <div className={cn('p-4 rounded-lg', isDark ? 'bg-gray-700' : 'bg-gray-100')}>
                      <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{t('billing.usage.totalCost')}</p>
                      <p className="text-2xl font-bold">{formatCredits(usageStats.totals.cost)}</p>
                    </div>
                  </div>

                  {/* By Model */}
                  {usageStats.byModel.length > 0 && (
                    <>
                      <h3 className="font-semibold mb-4">Chat & AI Models</h3>
                      <div className="space-y-3 mb-8">
                        {usageStats.byModel.map((model, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'p-4 rounded-lg flex items-center justify-between',
                              isDark ? 'bg-gray-700' : 'bg-gray-100'
                            )}
                          >
                            <div>
                              <p className="font-medium">{model.modelId}</p>
                              <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                                {model.requestCount} requests · {model.totalInputTokens.toLocaleString()} in / {model.totalOutputTokens.toLocaleString()} out
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCredits(model.totalCost)}</p>
                              <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                                ~{model.avgLatency?.toFixed(0) || 0}ms avg
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Media Usage (Images, Video, Audio) */}
                  {usageStats.media && usageStats.media.byType.length > 0 && (
                    <>
                      <h3 className="font-semibold mb-4">Media Generation</h3>
                      <div className="space-y-3">
                        {usageStats.media.byType.map((item, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'p-4 rounded-lg flex items-center justify-between',
                              isDark ? 'bg-gray-700' : 'bg-gray-100'
                            )}
                          >
                            <div>
                              <p className="font-medium">{item.displayName}</p>
                              <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                                {item.count} {item.count === 1 ? 'operation' : 'operations'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCredits(item.cost)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Empty state */}
                  {usageStats.byModel.length === 0 && (!usageStats.media || usageStats.media.byType.length === 0) && (
                    <div className="text-center py-8">
                      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No usage data for this period</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className={cn('h-12 w-12 mx-auto mb-4', isDark ? 'text-gray-600' : 'text-gray-400')} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No usage data available yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={cn(
            'p-6 rounded-xl border',
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          )}>
            <h2 className="text-lg font-semibold mb-4">{t('billing.history.title')}</h2>

            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      'p-4 rounded-lg flex items-center justify-between',
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-full',
                        tx.amount > 0
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      )}>
                        {tx.amount > 0 ? <TrendingUp className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'font-medium',
                        tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {tx.amount > 0 ? '+' : ''}{formatCredits(tx.amount)}
                      </p>
                      <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        Balance: {formatCredits(tx.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className={cn('h-12 w-12 mx-auto mb-4', isDark ? 'text-gray-600' : 'text-gray-400')} />
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('billing.history.noTransactions')}</p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
