/**
 * Hook for fetching fitness reminders
 */

import { useCallback } from 'react';
import { useApi } from '../useApi';
import { fitnessService } from '../../services/fitnessService';
import { Reminder } from '../../types/fitness';

export function useReminders(enabled = true, planType?: 'gym' | 'home', limit = 10) {
  
  const onSuccess = useCallback((data: { data: Reminder[]; total: number }) => {
    // Success handled
  }, []);

  const onError = useCallback((error: string) => {
    // Error handled
  }, []);

  const apiFunction = useCallback(() => {
    return fitnessService.getReminders(planType, limit);
  }, [planType, limit]);
  
  return useApi<{ data: Reminder[]; total: number }>(
    apiFunction,
    {
      enabled,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      retryOnError: true,
      retryAttempts: 2,
      retryDelay: 1000,
      onSuccess,
      onError
    }
  );
}