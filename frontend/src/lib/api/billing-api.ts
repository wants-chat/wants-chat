/**
 * Billing API Client
 * Handles subscription, plans, invoices, and payment methods
 */

import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Subscription,
  SubscriptionPlan,
  Invoice,
  PaymentMethod,
  CheckoutSession,
  CreateCheckoutRequest,
  CancelSubscriptionRequest,
} from '@/types/billing';

// Query Keys
export const billingKeys = {
  all: ['billing'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  paymentMethods: () => [...billingKeys.all, 'paymentMethods'] as const,
};

// API Functions
export const billingApi = {
  /**
   * Get current subscription for the user
   */
  async getSubscription(): Promise<Subscription> {
    return api.get<Subscription>(`/billing/subscription`);
  },

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get<{ plans: SubscriptionPlan[] }>(`/billing/plans`);
    return response.plans;
  },

  /**
   * Create Stripe checkout session
   */
  async createCheckout(data: CreateCheckoutRequest): Promise<CheckoutSession> {
    return api.post<CheckoutSession>(`/billing/checkout`, data);
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(data: CancelSubscriptionRequest): Promise<Subscription> {
    return api.post<Subscription>(`/billing/subscription/cancel`, data);
  },

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(): Promise<Subscription> {
    return api.post<Subscription>(`/billing/subscription/resume`, {});
  },

  /**
   * Get invoices for the user
   */
  async getInvoices(options?: { limit?: number; offset?: number }): Promise<{ invoices: Invoice[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<{ invoices: Invoice[]; total: number }>(`/billing/invoices${query}`);
  },

  /**
   * Get payment methods for the user
   */
  async getPaymentMethods(): Promise<{ paymentMethods: PaymentMethod[] }> {
    return api.get<{ paymentMethods: PaymentMethod[] }>(`/billing/payment-methods`);
  },

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/billing/payment-methods/${paymentMethodId}`);
  },

  /**
   * Create Stripe Customer Portal session
   * Redirects user to Stripe's hosted portal to manage subscription, payment methods, invoices
   */
  async createCustomerPortal(returnUrl?: string): Promise<{ url: string }> {
    return api.post<{ url: string }>(`/billing/customer-portal`, { returnUrl });
  },
};

// React Query Hooks

/**
 * Hook to get current subscription
 */
export const useSubscription = () => {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: () => billingApi.getSubscription(),
  });
};

/**
 * Hook to get available plans
 */
export const usePlans = () => {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => billingApi.getPlans(),
  });
};

/**
 * Hook to create checkout session
 */
export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: (data: CreateCheckoutRequest) => billingApi.createCheckout(data),
  });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelSubscriptionRequest) => billingApi.cancelSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
    },
  });
};

/**
 * Hook to resume subscription
 */
export const useResumeSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => billingApi.resumeSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() });
    },
  });
};

/**
 * Hook to get invoices
 */
export const useInvoices = (options?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: [...billingKeys.invoices(), options],
    queryFn: async () => {
      const response = await billingApi.getInvoices(options);
      return response.invoices;
    },
  });
};

/**
 * Hook to get payment methods
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: billingKeys.paymentMethods(),
    queryFn: async () => {
      const response = await billingApi.getPaymentMethods();
      return response.paymentMethods;
    },
  });
};

/**
 * Hook to delete payment method
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) => billingApi.deletePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() });
    },
  });
};

/**
 * Hook to create customer portal session
 * Opens Stripe's hosted portal for subscription/payment management
 */
export const useCustomerPortal = () => {
  return useMutation({
    mutationFn: (returnUrl?: string) => billingApi.createCustomerPortal(returnUrl),
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
};
