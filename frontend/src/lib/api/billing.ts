/**
 * Billing API for Wants Chat
 * Handles subscription plans, credits, and payment management
 */

import { api } from '../api';

// Type definitions
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  includedCredits: number;
  maxRequestsPerDay: number | null;
  maxTokensPerRequest: number | null;
  allowedModelTiers: string[];
  features: string[];
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string;
  creditAmount: number;
  price: number;
  bonusAmount: number;
  isPopular: boolean;
}

export interface Subscription {
  id?: string;
  plan: string;
  planName?: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  interval?: 'monthly' | 'yearly';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  includedCredits: number;
  maxRequestsPerDay: number | null;
  maxTokensPerRequest: number | null;
  allowedModelTiers: string[];
  features: string[];
}

export interface Credits {
  balance: number;
  includedBalance: number;
  purchasedBalance: number;
  lifetimeUsage: number;
}

export interface Transaction {
  id: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface UsageStats {
  period: {
    start: string;
    end: string;
  };
  byModel: Array<{
    modelId: string;
    requestCount: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    avgLatency: number;
  }>;
  totals: {
    requests: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
  media?: {
    byType: Array<{
      type: string;
      displayName: string;
      count: number;
      cost: number;
    }>;
    totals: {
      operations: number;
      cost: number;
    };
  };
}

export interface CheckoutResponse {
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  tier: 'free' | 'standard' | 'premium' | 'enterprise';
  contextWindow: number;
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
  costPer1MInput: number;
  costPer1MOutput: number;
}

class BillingAPI {
  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    return api.get('/stripe/plans');
  }

  /**
   * Get available credit packages
   */
  async getCreditPackages(): Promise<CreditPackage[]> {
    return api.get('/stripe/packages');
  }

  /**
   * Get current user's subscription
   */
  async getSubscription(): Promise<Subscription> {
    return api.get('/stripe/subscription');
  }

  /**
   * Get current user's credit balance
   */
  async getCredits(): Promise<Credits> {
    return api.get('/stripe/credits');
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(limit?: number, offset?: number): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    return api.get(`/stripe/transactions?${params.toString()}`);
  }

  /**
   * Get user's usage statistics
   */
  async getUsageStats(startDate?: string, endDate?: string): Promise<UsageStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/stripe/usage?${params.toString()}`);
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(
    planId: string,
    interval: 'monthly' | 'yearly',
    successUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutResponse> {
    return api.post('/stripe/checkout-session', {
      planId,
      interval,
      successUrl,
      cancelUrl,
    });
  }

  /**
   * Create checkout session for credit purchase
   */
  async createCreditCheckout(
    packageId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutResponse> {
    return api.post('/stripe/credit-checkout', {
      packageId,
      successUrl,
      cancelUrl,
    });
  }

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(returnUrl: string): Promise<BillingPortalResponse> {
    return api.post('/stripe/billing-portal', { returnUrl });
  }

  /**
   * Get all available models
   */
  async getModels(): Promise<AIModel[]> {
    return api.get('/stripe/models');
  }

  /**
   * Get models available to the current user based on their subscription
   */
  async getAvailableModels(): Promise<AIModel[]> {
    return api.get('/stripe/available-models');
  }
}

export const billingAPI = new BillingAPI();
export default billingAPI;
