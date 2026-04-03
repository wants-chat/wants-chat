/**
 * Subscription Generator
 *
 * Generates subscription-related components:
 * - SubscriptionCard: Display subscription plans with features
 */

import { pascalCase } from 'change-case';

export interface SubscriptionFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  description?: string;
  features: SubscriptionFeature[];
  popular?: boolean;
  ctaText?: string;
}

export interface SubscriptionCardOptions {
  componentName?: string;
  plans?: SubscriptionPlan[];
  showToggle?: boolean;
  endpoint?: string;
  currentPlanEndpoint?: string;
}

/**
 * Generate a SubscriptionCard component
 */
export function generateSubscriptionCard(options: SubscriptionCardOptions = {}): string {
  const {
    componentName = 'SubscriptionCard',
    plans = [],
    showToggle = true,
    endpoint = '/subscriptions/plans',
    currentPlanEndpoint = '/subscriptions/current',
  } = options;

  const defaultPlans: SubscriptionPlan[] = plans.length > 0 ? plans : [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingPeriod: 'monthly',
      description: 'For individuals getting started',
      features: [
        { text: '5 projects', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Email support', included: true },
        { text: 'API access', included: false },
        { text: 'Custom integrations', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19,
      billingPeriod: 'monthly',
      description: 'For professionals and small teams',
      popular: true,
      features: [
        { text: 'Unlimited projects', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Priority support', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: false },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      billingPeriod: 'monthly',
      description: 'For large organizations',
      features: [
        { text: 'Unlimited projects', included: true },
        { text: 'Advanced analytics', included: true },
        { text: '24/7 dedicated support', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: true },
      ],
    },
  ];

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  X,
  Zap,
  Crown,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface SubscriptionFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  description?: string;
  features: SubscriptionFeature[];
  popular?: boolean;
  ctaText?: string;
}

interface ${componentName}Props {
  plans?: SubscriptionPlan[];
  currentPlanId?: string;
  className?: string;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  onUpgrade?: (plan: SubscriptionPlan) => void;
}

const defaultPlans: SubscriptionPlan[] = ${JSON.stringify(defaultPlans, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  plans: propPlans,
  currentPlanId: propCurrentPlanId,
  className,
  onSelectPlan,
  onUpgrade,
}) => {
  const queryClient = useQueryClient();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // Fetch plans if not provided
  const { data: fetchedPlans, isLoading: loadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        return [];
      }
    },
    enabled: !propPlans || propPlans.length === 0,
  });

  // Fetch current plan
  const { data: currentPlan } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${currentPlanEndpoint}');
        return response?.data || response;
      } catch (err) {
        return null;
      }
    },
    enabled: !propCurrentPlanId,
  });

  const plans = propPlans && propPlans.length > 0 ? propPlans : (fetchedPlans || defaultPlans);
  const currentPlanId = propCurrentPlanId || currentPlan?.planId;

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.post('/subscriptions/subscribe', { planId, billingPeriod });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    },
  });

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
      return;
    }

    if (onUpgrade && currentPlanId && plan.id !== currentPlanId) {
      onUpgrade(plan);
      return;
    }

    setProcessingPlanId(plan.id);
    try {
      await subscribeMutation.mutateAsync(plan.id);
    } finally {
      setProcessingPlanId(null);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (billingPeriod === 'yearly' && plan.billingPeriod === 'monthly') {
      return plan.price * 10; // 2 months free
    }
    return plan.price;
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    if (plan.popular) return <Crown className="w-5 h-5" />;
    if (plan.price === 0) return <Zap className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  if (loadingPlans) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      ${showToggle ? `{/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn(
          'text-sm font-medium',
          billingPeriod === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'
        )}>
          Monthly
        </span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          className={cn(
            'relative w-14 h-7 rounded-full transition-colors',
            billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
          )}
        >
          <div className={cn(
            'absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
            billingPeriod === 'yearly' ? 'translate-x-8' : 'translate-x-1'
          )} />
        </button>
        <span className={cn(
          'text-sm font-medium',
          billingPeriod === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'
        )}>
          Yearly
          <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-semibold">
            Save 17%
          </span>
        </span>
      </div>` : ''}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;
          const isProcessing = processingPlanId === plan.id;
          const price = getPrice(plan);

          return (
            <div
              key={plan.id}
              className={cn(
                'relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 transition-all',
                plan.popular
                  ? 'border-blue-500 dark:border-blue-400'
                  : 'border-gray-200 dark:border-gray-700',
                isCurrentPlan && 'ring-2 ring-green-500'
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    <Crown className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                    <Check className="w-3 h-3" />
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'p-2 rounded-lg',
                    plan.popular
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}>
                    {getPlanIcon(plan)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plan.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      \${price === 0 ? 'Free' : \`$\${price}\`}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">
                        /{billingPeriod === 'yearly' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {billingPeriod === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={cn(
                        'text-sm',
                        feature.included
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-600'
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan || isProcessing}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors',
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50',
                    isCurrentPlan && 'cursor-not-allowed'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    <>
                      {plan.ctaText || (price === 0 ? 'Get Started' : 'Upgrade')}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate subscription card for specific domain
 */
export function generateDomainSubscriptionCard(
  domain: string,
  options?: Partial<SubscriptionCardOptions>
): string {
  return generateSubscriptionCard({
    componentName: pascalCase(domain) + 'SubscriptionCard',
    ...options,
  });
}
