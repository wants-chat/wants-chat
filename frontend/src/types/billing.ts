/**
 * Billing Types
 * Type definitions for subscription, plans, invoices, and payment methods
 */

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'pro' | 'premium';
  interval?: 'month' | 'year'; // Billing interval (not present for free plan)
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string | null; // null for free plan (no billing period)
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  trialEnd?: string | null;
  createdAt: string;
  updatedAt: string;
  // Payment source - helps identify where subscription was purchased
  source?: 'stripe' | 'apple' | 'google' | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  stripePriceId: string | null;
  stripePriceIdYearly?: string | null;
  interval: 'month' | 'year';
  price: number; // Monthly price in cents
  yearlyPrice?: number; // Yearly price in cents
  currency: string;
  features: string[];
  isPopular?: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
  receiptUrl?: string;
  description?: string;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface CreateCheckoutRequest {
  priceId: string;
  trialPeriodDays?: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CancelSubscriptionRequest {
  cancelAtPeriodEnd: boolean;
  reason?: string;
}
