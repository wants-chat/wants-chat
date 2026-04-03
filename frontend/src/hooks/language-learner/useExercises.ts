/**
 * Exercises hooks with React Query integration
 * Provides data fetching and mutations for exercise management
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  languageApiService,
  Exercise,
  ExerciseQueryParams,
  UnitExercisesResponse,
  PaginatedResponse,
  SubmitExerciseRequest,
  SubmitExerciseResponse
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const,
  list: (filters: ExerciseQueryParams) => [...exerciseKeys.lists(), filters] as const,
  details: () => [...exerciseKeys.all, 'detail'] as const,
  detail: (id: string) => [...exerciseKeys.details(), id] as const,
  unitExercises: (unitId: string, params?: Omit<ExerciseQueryParams, 'unit_id'>) =>
    [...exerciseKeys.all, 'unit', unitId, params] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch exercises with filtering and pagination
 */
export function useExercises(params?: ExerciseQueryParams) {
  return useQuery({
    queryKey: exerciseKeys.list(params || {}),
    queryFn: () => languageApiService.getExercises(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a single exercise by ID
 */
export function useExercise(exerciseId: string, params?: Omit<ExerciseQueryParams, 'exercise_id'>) {
  return useQuery({
    queryKey: exerciseKeys.detail(exerciseId),
    queryFn: () => languageApiService.getExerciseById(exerciseId, params),
    enabled: !!exerciseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch unit exercises
 */
export function useUnitExercises(unitId: string, params?: Omit<ExerciseQueryParams, 'unit_id'>) {
  return useQuery({
    queryKey: exerciseKeys.unitExercises(unitId, params),
    queryFn: () => languageApiService.getUnitExercises(unitId, params),
    enabled: !!unitId,
    staleTime: 5 * 60 * 1000, // 5 minutes (exercises may change more frequently during learning)
  });
}

/**
 * Hook to fetch lesson units
 */
export function useLessonUnits(lessonId: string, params?: { user_id?: string; include_locked?: boolean; include_exercises?: boolean; sort_by?: string; sort_order?: string }) {
  return useQuery({
    queryKey: ['lesson-units', lessonId, params],
    queryFn: () => languageApiService.getLessonUnits(lessonId, params),
    enabled: !!lessonId,
    staleTime: 10 * 60 * 1000, // 10 minutes (units don't change frequently)
  });
}

// ==============================================
// MUTATION HOOKS
// ==============================================

/**
 * Hook to create new exercise
 */
export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseData: any) =>
      languageApiService.createExercise(exerciseData),
    onSuccess: (newExercise) => {
      // Invalidate and refetch exercise lists
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });

      // Update specific caches
      if (newExercise.unit_id) {
        queryClient.invalidateQueries({
          queryKey: [...exerciseKeys.all, 'unit', newExercise.unit_id]
        });
      }

      // Set the new exercise in cache
      queryClient.setQueryData(exerciseKeys.detail(newExercise.id), newExercise);
    },
    onError: (error) => {
      console.error('Failed to create exercise:', error);
    },
  });
}

/**
 * Hook to submit exercise answer
 */
export function useSubmitExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exerciseId, submissionData }: { exerciseId: string; submissionData: SubmitExerciseRequest }) =>
      languageApiService.submitExercise(exerciseId, submissionData),
    onSuccess: (response, { exerciseId }) => {
      // Update the exercise cache with new user progress
      queryClient.setQueryData(exerciseKeys.detail(exerciseId), (oldData: Exercise | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          user_progress: {
            ...oldData.user_progress,
            status: response.progress.exercise_completed ? 'completed' : 'in_progress',
            is_correct: response.is_correct,
            user_answer: response.user_answer,
            attempts_count: response.attempts_count,
            points_earned: response.points_earned,
            completed_at: response.progress.exercise_completed ? new Date().toISOString() : null,
          }
        };
      });

      // Invalidate unit exercises to reflect progress updates
      queryClient.invalidateQueries({ 
        queryKey: [...exerciseKeys.all, 'unit'] 
      });

      // Invalidate progress-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['progress'] 
      });
    },
    onError: (error) => {
      console.error('Failed to submit exercise:', error);
    },
  });
}

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to get exercise statistics for a unit
 */
export function useUnitExerciseStats(unitId: string) {
  const { data: unitExercises, isLoading } = useUnitExercises(unitId, { include_answers: false });

  const stats = React.useMemo(() => {
    if (!unitExercises?.data) return null;

    const exercises = unitExercises.data;
    const totalExercises = exercises.length;
    const completedExercises = exercises.filter(ex => ex.user_progress.status === 'completed').length;
    
    const inProgressExercises = exercises.filter(ex => ex.user_progress.status === 'in_progress').length;
    const notAttemptedExercises = exercises.filter(ex => ex.user_progress.status === 'not_attempted').length;

    // Calculate difficulty distribution
    const difficultyDistribution = exercises.reduce((acc, ex) => {
      acc[ex.difficulty_level] = (acc[ex.difficulty_level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Calculate type distribution
    const typeDistribution = exercises.reduce((acc, ex) => {
      acc[ex.type] = (acc[ex.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate points
    const totalPointsEarned = exercises.reduce((sum, ex) => sum + ex.user_progress.points_earned, 0);
    const maxPossiblePoints = exercises.reduce((sum, ex) => sum + ex.points, 0);

    return {
      totalExercises,
      completedExercises,
      inProgressExercises,
      notAttemptedExercises,
      completionRate: totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0,
      difficultyDistribution,
      typeDistribution,
      totalPointsEarned,
      maxPossiblePoints,
      pointsPercentage: maxPossiblePoints > 0 ? (totalPointsEarned / maxPossiblePoints) * 100 : 0,
      unitInfo: unitExercises.unit_info,
      userUnitProgress: unitExercises.user_unit_progress,
    };
  }, [unitExercises]);

  return {
    stats,
    isLoading,
  };
}

/**
 * Hook to get the next exercise for a unit
 */
export function useNextExercise(unitId: string) {
  const { data: unitExercises } = useUnitExercises(unitId, { include_answers: false });

  const nextExercise = React.useMemo(() => {
    if (!unitExercises?.data) return null;

    // Find the first not attempted exercise
    const notAttempted = unitExercises.data.find(ex => ex.user_progress.status === 'not_attempted');
    if (notAttempted) return notAttempted;

    // If all attempted, find first in progress
    const inProgress = unitExercises.data.find(ex => ex.user_progress.status === 'in_progress');
    if (inProgress) return inProgress;

    // If all completed, return null (unit is complete)
    return null;
  }, [unitExercises?.data]);

  return nextExercise;
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch exercises for better UX
 */
export function usePrefetchExercises() {
  const queryClient = useQueryClient();

  const prefetchUnitExercises = React.useCallback((unitId: string, params?: Omit<ExerciseQueryParams, 'unit_id'>) => {
    return queryClient.prefetchQuery({
      queryKey: exerciseKeys.unitExercises(unitId, params),
      queryFn: () => languageApiService.getUnitExercises(unitId, params),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchUnitExercises,
  };
}