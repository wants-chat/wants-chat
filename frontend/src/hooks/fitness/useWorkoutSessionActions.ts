/**
 * Hook for workout session actions (create, update, complete)
 */

import { useState, useCallback } from 'react';
import { fitnessService } from '../../services/fitnessService';
import { CreateWorkoutSessionRequest, CurrentWorkoutSession } from '../../types/fitness';

interface UseWorkoutSessionActionsReturn {
  createSession: (data: CreateWorkoutSessionRequest) => Promise<CurrentWorkoutSession>;
  updateSession: (sessionId: string, data: CreateWorkoutSessionRequest) => Promise<CurrentWorkoutSession>;
  completeSession: (sessionId: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isCompleting: boolean;
  error: string | null;
}

export function useWorkoutSessionActions(): UseWorkoutSessionActionsReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (data: CreateWorkoutSessionRequest): Promise<CurrentWorkoutSession> => {
    setIsCreating(true);
    setError(null);
    
    try {
      console.log('Creating workout session:', data);
      const result = await fitnessService.createWorkoutSession(data);
      console.log('Workout session created successfully:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workout session';
      console.error('Error creating workout session:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, data: CreateWorkoutSessionRequest): Promise<CurrentWorkoutSession> => {
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log('Updating workout session:', sessionId, data);
      const result = await fitnessService.updateWorkoutSession(sessionId, data);
      console.log('Workout session updated successfully:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workout session';
      console.error('Error updating workout session:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const completeSession = useCallback(async (sessionId: string): Promise<void> => {
    setIsCompleting(true);
    setError(null);
    
    try {
      console.log('Completing workout session:', sessionId);
      await fitnessService.completeWorkoutSession(sessionId);
      console.log('Workout session completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete workout session';
      console.error('Error completing workout session:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsCompleting(false);
    }
  }, []);

  return {
    createSession,
    updateSession,
    completeSession,
    isCreating,
    isUpdating,
    isCompleting,
    error
  };
}