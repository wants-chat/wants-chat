/**
 * Subscription Constants
 * Matches mobile app subscription_constants.dart
 */

export type PlanType = 'free' | 'basic' | 'pro' | 'premium';

export interface SubscriptionPlanConfig {
  type: PlanType;
  name: string;
  maxApps: number; // -1 = unlimited
  aiRequestsPerDay: number;
  aiRequestsLifetime: number; // For free tier only
  familyMembers: number;
  hasOneTimeLock: boolean; // Whether app selection is locked after first save
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlanConfig> = {
  free: {
    type: 'free',
    name: 'Free',
    maxApps: 1,
    aiRequestsPerDay: 0,
    aiRequestsLifetime: 2,
    familyMembers: 0,
    hasOneTimeLock: true,
    features: [
      '14-day free trial with full access',
      '1 app of your choice after trial',
      '2 lifetime AI requests',
      'No ads ever',
    ],
  },
  basic: {
    type: 'basic',
    name: 'Starter',
    maxApps: 5,
    aiRequestsPerDay: 10,
    aiRequestsLifetime: 0,
    familyMembers: 0,
    hasOneTimeLock: true,
    features: [
      'Access to 5 apps of your choice',
      '10 AI requests per day',
      'Cloud sync',
      'Email support',
    ],
  },
  pro: {
    type: 'pro',
    name: 'Pro',
    maxApps: -1, // Unlimited
    aiRequestsPerDay: 20,
    aiRequestsLifetime: 0,
    familyMembers: 0,
    hasOneTimeLock: false,
    features: [
      'Access to all 70+ apps',
      '20 AI requests per day',
      'Cloud sync across devices',
      'Export to PDF & CSV',
      'Priority email support',
    ],
  },
  premium: {
    type: 'premium',
    name: 'Premium',
    maxApps: -1, // Unlimited
    aiRequestsPerDay: 100,
    aiRequestsLifetime: 0,
    familyMembers: 5,
    hasOneTimeLock: false,
    features: [
      'Access to all 70+ apps',
      '100 AI requests per day',
      'Cloud sync across devices',
      'Export to PDF & CSV',
      'Priority email support',
      'Family sharing (up to 5 members)',
    ],
  },
};

export const getPlanConfig = (planType: PlanType): SubscriptionPlanConfig => {
  return SUBSCRIPTION_PLANS[planType] || SUBSCRIPTION_PLANS.free;
};

export const hasUnlimitedApps = (planType: PlanType): boolean => {
  const plan = getPlanConfig(planType);
  return plan.maxApps === -1;
};

export const canModifyAppsFreely = (planType: PlanType): boolean => {
  const plan = getPlanConfig(planType);
  return !plan.hasOneTimeLock;
};
