/**
 * Hook for fetching current workout session
 */

import { useCallback } from 'react';
import { useApi } from '../useApi';
import { fitnessService } from '../../services/fitnessService';
import { CurrentWorkoutSession } from '../../types/fitness';

export function useCurrentWorkoutSession(enabled = true) {
  console.log('useCurrentWorkoutSession hook called with enabled:', enabled);
  
  const onSuccess = useCallback((data: CurrentWorkoutSession) => {
    console.log('Current workout session API success:', data);
  }, []);

  const onError = useCallback((error: string) => {
    console.log('Current workout session API error:', error);
  }, []);

  const apiFunction = useCallback(() => {
    console.log('Calling fitnessService.getCurrentWorkoutSession()');
    return fitnessService.getCurrentWorkoutSession();
  }, []);
  
  return useApi<CurrentWorkoutSession>(
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