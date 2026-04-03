/**
 * Hook for fetching today's workouts
 */

import { useCallback } from 'react';
import { useApi } from '../useApi';
import { fitnessService } from '../../services/fitnessService';
import { TodayWorkoutsResponse } from '../../types/fitness';

export function useTodayWorkouts(enabled = true, planType?: 'gym' | 'home') {
  
  const onSuccess = useCallback((data: TodayWorkoutsResponse) => {
    // Success handled
  }, []);

  const onError = useCallback((error: string) => {
    // Error handled
  }, []);

  const apiFunction = useCallback(() => {
    return fitnessService.getTodayWorkouts(planType);
  }, [planType]);
  
  return useApi<TodayWorkoutsResponse>(
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