import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';
import { getPlanConfig, type PlanType } from '../constants/subscription';

/**
 * Trial Status Interface
 * Matches mobile app's TrialStatusResponse
 */
export interface TrialStatus {
  isTrialActive: boolean;
  daysRemaining: number;
  trialStartDate: string | null;
  trialEndDate: string | null;
  trialEnded: boolean;
  freeAppSelected: string | null;
  needsAppSelection: boolean;
}

/**
 * Subscription Info Interface
 */
export interface SubscriptionInfo {
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionContextType {
  // Trial status
  trialStatus: TrialStatus | null;
  isTrialActive: boolean;
  daysRemaining: number;
  needsAppSelection: boolean;
  freeAppSelected: string | null;

  // Subscription info
  subscription: SubscriptionInfo | null;
  currentPlan: PlanType;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Methods
  refreshTrialStatus: () => Promise<void>;
  canAccessApp: (appId: string) => boolean;
  selectFreeApp: (appId: string) => Promise<void>;
  getMaxApps: () => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Cache timestamp for hourly refresh (matches mobile implementation)
let lastTrialStatusCheck: number = 0;
const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trial status from server
  const fetchTrialStatus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setTrialStatus(null);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await api.get('/users/trial-status');

      // Handle response structure - API returns data directly or wrapped
      const data = response.data || response;

      setTrialStatus({
        isTrialActive: data.isTrialActive ?? false,
        daysRemaining: data.daysRemaining ?? 0,
        trialStartDate: data.trialStartDate ?? null,
        trialEndDate: data.trialEndDate ?? null,
        trialEnded: data.trialEnded ?? false,
        freeAppSelected: data.freeAppSelected ?? null,
        needsAppSelection: data.needsAppSelection ?? false,
      });

      // Update last check timestamp
      lastTrialStatusCheck = Date.now();
    } catch (err) {
      console.error('Failed to fetch trial status:', err);
      setError('Failed to fetch trial status');
      // Default to trial active for new users on error
      setTrialStatus({
        isTrialActive: true,
        daysRemaining: 14,
        trialStartDate: null,
        trialEndDate: null,
        trialEnded: false,
        freeAppSelected: null,
        needsAppSelection: false,
      });
    }
  }, [isAuthenticated, user]);

  // Fetch subscription info
  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSubscription(null);
      return;
    }

    try {
      const response = await api.get('/billing/subscription');
      const data = response.data || response;

      setSubscription({
        plan: (data.plan || 'free') as PlanType,
        status: data.status || 'active',
        currentPeriodEnd: data.currentPeriodEnd || null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
      });
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      // Default to free plan on error
      setSubscription({
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initial fetch when user authenticates
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchTrialStatus(), fetchSubscription()]);
      setIsLoading(false);
    };

    fetchAll();
  }, [fetchTrialStatus, fetchSubscription]);

  // Check if we should refresh trial status (hourly)
  const shouldRefreshTrialStatus = useCallback((): boolean => {
    if (lastTrialStatusCheck === 0) return true;
    return Date.now() - lastTrialStatusCheck > REFRESH_INTERVAL;
  }, []);

  // Refresh trial status from server
  const refreshTrialStatus = useCallback(async () => {
    await fetchTrialStatus();
  }, [fetchTrialStatus]);

  // Get current plan type
  const currentPlan = useMemo((): PlanType => {
    return subscription?.plan || 'free';
  }, [subscription]);

  // Check if trial is active
  const isTrialActive = useMemo((): boolean => {
    return trialStatus?.isTrialActive ?? false;
  }, [trialStatus]);

  // Get days remaining
  const daysRemaining = useMemo((): number => {
    return trialStatus?.daysRemaining ?? 0;
  }, [trialStatus]);

  // Check if user needs to select free app
  const needsAppSelection = useMemo((): boolean => {
    return trialStatus?.needsAppSelection ?? false;
  }, [trialStatus]);

  // Get free app selected
  const freeAppSelected = useMemo((): string | null => {
    return trialStatus?.freeAppSelected ?? null;
  }, [trialStatus]);

  // Get max apps based on plan and trial status
  const getMaxApps = useCallback((): number => {
    // During trial, unlimited apps
    if (isTrialActive) return -1;

    // After trial, if needs app selection, only 1 app
    if (needsAppSelection) return 1;

    // Otherwise, based on plan
    const planConfig = getPlanConfig(currentPlan);
    return planConfig.maxApps;
  }, [isTrialActive, needsAppSelection, currentPlan]);

  // Check if user can access a specific app
  const canAccessApp = useCallback((appId: string): boolean => {
    // Pro/Premium have unlimited access
    const planConfig = getPlanConfig(currentPlan);
    if (planConfig.maxApps === -1) return true;

    // Check if should refresh (hourly check like mobile)
    if (shouldRefreshTrialStatus()) {
      // Fire and forget - async refresh
      fetchTrialStatus();
    }

    // During trial, full access to all apps
    if (isTrialActive) return true;

    // After trial, if user has selected a free app, only that app is accessible
    if (freeAppSelected) {
      return appId === freeAppSelected;
    }

    // If needs app selection, no access until selection is made
    if (needsAppSelection) return false;

    // For other plans, would need to check selected apps
    // (This would be handled by AppPreferencesContext)
    return true;
  }, [currentPlan, isTrialActive, freeAppSelected, needsAppSelection, shouldRefreshTrialStatus, fetchTrialStatus]);

  // Select free app after trial ends
  const selectFreeApp = useCallback(async (appId: string) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated');
    }

    try {
      setIsLoading(true);
      await api.request('/users/select-free-app', {
        method: 'POST',
        body: JSON.stringify({ appId }),
      });

      // Refresh trial status to get updated state
      await fetchTrialStatus();
    } catch (err) {
      console.error('Failed to select free app:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchTrialStatus]);

  const value = useMemo(() => ({
    trialStatus,
    isTrialActive,
    daysRemaining,
    needsAppSelection,
    freeAppSelected,
    subscription,
    currentPlan,
    isLoading,
    error,
    refreshTrialStatus,
    canAccessApp,
    selectFreeApp,
    getMaxApps,
  }), [
    trialStatus,
    isTrialActive,
    daysRemaining,
    needsAppSelection,
    freeAppSelected,
    subscription,
    currentPlan,
    isLoading,
    error,
    refreshTrialStatus,
    canAccessApp,
    selectFreeApp,
    getMaxApps,
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
