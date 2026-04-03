/**
 * useOnboarding Hook
 *
 * Manages onboarding state and flow for the application.
 * Checks if user has completed onboarding and provides methods to update progress.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getOnboardingStatus,
  getOnboarding,
  updateOnboardingStep,
  completeOnboarding,
  skipOnboarding,
  OnboardingStatus,
  OnboardingData,
  CompleteOnboardingDto,
  UpdateStepDto,
} from '@/services/onboardingApi';

export interface UseOnboardingOptions {
  /** Whether to enable the hook (only fetch when true) */
  enabled?: boolean;
}

export interface UseOnboardingReturn {
  /** Whether onboarding has been completed */
  isCompleted: boolean;
  /** Current onboarding step (0-5) */
  currentStep: number;
  /** Full onboarding data */
  data: OnboardingData | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether onboarding check is done */
  checked: boolean;
  /** Refresh onboarding status */
  refresh: () => Promise<void>;
  /** Update step data */
  updateStep: (step: number, data?: Partial<CompleteOnboardingDto>) => Promise<void>;
  /** Complete onboarding with all data */
  complete: (data: CompleteOnboardingDto) => Promise<void>;
  /** Skip onboarding (not recommended) */
  skip: () => Promise<void>;
  /** Whether user should see onboarding */
  shouldShowOnboarding: boolean;
}

export function useOnboarding(options: UseOnboardingOptions = {}): UseOnboardingReturn {
  const { enabled = true } = options;

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [checked, setChecked] = useState(false);

  const checkOnboarding = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const statusResult = await getOnboardingStatus();
      setStatus(statusResult);

      // If not completed, also fetch full data for the form
      if (!statusResult.onboarding_completed) {
        const fullData = await getOnboarding();
        setData(fullData);
      }
    } catch (err) {
      console.error('Failed to check onboarding status:', err);
      setError(err instanceof Error ? err : new Error('Failed to check onboarding'));
      // Default to completed on error to not block the user
      setStatus({ onboarding_completed: true, onboarding_step: 5 });
    } finally {
      setLoading(false);
      setChecked(true);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      checkOnboarding();
    } else {
      // Reset state when disabled
      setLoading(false);
      setChecked(false);
    }
  }, [enabled, checkOnboarding]);

  const updateStep = useCallback(async (step: number, stepData?: Partial<CompleteOnboardingDto>) => {
    setLoading(true);
    setError(null);

    try {
      const dto: UpdateStepDto = { step, data: stepData };
      const result = await updateOnboardingStep(dto);
      setData(result);
      setStatus({
        onboarding_completed: result.onboarding_completed,
        onboarding_step: result.onboarding_step,
        onboarding_completed_at: result.onboarding_completed_at,
      });
    } catch (err) {
      console.error('Failed to update onboarding step:', err);
      setError(err instanceof Error ? err : new Error('Failed to update step'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const complete = useCallback(async (completeData: CompleteOnboardingDto) => {
    setLoading(true);
    setError(null);

    try {
      const result = await completeOnboarding(completeData);
      setData(result);
      setStatus({
        onboarding_completed: true,
        onboarding_step: 5,
        onboarding_completed_at: result.onboarding_completed_at,
      });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setError(err instanceof Error ? err : new Error('Failed to complete onboarding'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const skip = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await skipOnboarding();
      setData(result);
      setStatus({
        onboarding_completed: true,
        onboarding_step: 0,
        onboarding_completed_at: result.onboarding_completed_at,
      });
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
      setError(err instanceof Error ? err : new Error('Failed to skip onboarding'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isCompleted: status?.onboarding_completed ?? false,
    currentStep: status?.onboarding_step ?? 0,
    data,
    loading,
    error,
    checked,
    refresh: checkOnboarding,
    updateStep,
    complete,
    skip,
    shouldShowOnboarding: checked && !loading && !(status?.onboarding_completed),
  };
}

export default useOnboarding;
