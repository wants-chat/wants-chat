/**
 * User Progress hooks with React Query integration
 * Provides data fetching and mutations for user-specific progress tracking
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  languageApiService,
  UserProgress,
  LessonProgressResponse,
  UnitProgress,
  ProgressSyncRequest
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const userProgressKeys = {
  all: ['userProgress'] as const,
  users: () => [...userProgressKeys.all, 'user'] as const,
  user: (userId: string) => [...userProgressKeys.users(), userId] as const,
  lessons: () => [...userProgressKeys.all, 'lesson'] as const,
  lesson: (userId: string, lessonId: string) => [...userProgressKeys.lessons(), userId, lessonId] as const,
  units: () => [...userProgressKeys.all, 'unit'] as const,
  unit: (userId: string, unitId: string) => [...userProgressKeys.units(), userId, unitId] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch user's overall progress
 */
export function useUserProgress(userId: string) {
  return useQuery({
    queryKey: userProgressKeys.user(userId),
    queryFn: () => languageApiService.getUserProgress(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch lesson progress for a specific user and lesson
 */
export function useLessonProgress(userId: string, lessonId: string) {
  return useQuery({
    queryKey: userProgressKeys.lesson(userId, lessonId),
    queryFn: () => languageApiService.getLessonProgress(userId, lessonId),
    enabled: !!userId && !!lessonId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch unit progress for a specific user and unit
 */
export function useUnitProgress(userId: string, unitId: string) {
  return useQuery({
    queryKey: userProgressKeys.unit(userId, unitId),
    queryFn: () => languageApiService.getUnitProgress(userId, unitId),
    enabled: !!userId && !!unitId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ==============================================
// MUTATION HOOKS
// ==============================================

/**
 * Hook to sync progress activities
 */
export function useSyncProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, syncData }: { userId: string; syncData: ProgressSyncRequest }) =>
      languageApiService.syncProgress(userId, syncData),
    onSuccess: (response, { userId }) => {
      // Invalidate all progress-related queries for this user
      queryClient.invalidateQueries({ queryKey: userProgressKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: userProgressKeys.lessons() });
      queryClient.invalidateQueries({ queryKey: userProgressKeys.units() });
    },
    onError: (error) => {
      console.error('Failed to sync progress:', error);
    },
  });
}

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to calculate overall learning statistics
 */
export function useLearningStats(userId: string) {
  const { data: userProgress, isLoading } = useUserProgress(userId);

  const stats = React.useMemo(() => {
    if (!userProgress) return null;

    // Calculate level progress (assuming each level requires 1000 XP)
    const xpPerLevel = 1000;
    const currentLevelXP = userProgress.total_xp % xpPerLevel;
    const levelProgress = (currentLevelXP / xpPerLevel) * 100;

    // Calculate completion rates
    const avgExercisesPerLesson = 10; // assumption
    const estimatedTotalLessons = userProgress.exercises_completed / avgExercisesPerLesson;
    const completionRate = estimatedTotalLessons > 0 ? (userProgress.lessons_completed / estimatedTotalLessons) * 100 : 0;

    // Calculate study efficiency (XP per minute)
    const studyEfficiency = userProgress.study_time_minutes > 0 
      ? userProgress.total_xp / userProgress.study_time_minutes 
      : 0;

    return {
      ...userProgress,
      levelProgress,
      completionRate: Math.min(completionRate, 100), // Cap at 100%
      studyEfficiency,
      xpToNextLevel: xpPerLevel - currentLevelXP,
      estimatedStudyTime: Math.round(userProgress.study_time_minutes / 60), // Convert to hours
    };
  }, [userProgress]);

  return {
    stats,
    isLoading,
  };
}

/**
 * Hook to track progress changes in real-time
 */
export function useProgressTracker(userId: string) {
  const queryClient = useQueryClient();
  const syncProgressMutation = useSyncProgress();

  const trackActivity = React.useCallback((activity: {
    type: 'lesson_started' | 'lesson_completed' | 'exercise_completed' | 'vocabulary_learned';
    lesson_id?: string;
    unit_id?: string;
    exercise_id?: string;
    vocabulary_id?: string;
    xp_earned: number;
    time_spent_minutes: number;
  }) => {
    const syncData: ProgressSyncRequest = {
      activities: [{
        ...activity,
        timestamp: new Date().toISOString(),
      }]
    };

    // Optimistically update local cache
    queryClient.setQueryData(userProgressKeys.user(userId), (oldData: UserProgress | undefined) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        total_xp: oldData.total_xp + activity.xp_earned,
        study_time_minutes: oldData.study_time_minutes + activity.time_spent_minutes,
        exercises_completed: activity.type === 'exercise_completed' 
          ? oldData.exercises_completed + 1 
          : oldData.exercises_completed,
        lessons_completed: activity.type === 'lesson_completed'
          ? oldData.lessons_completed + 1
          : oldData.lessons_completed,
        words_learned: activity.type === 'vocabulary_learned'
          ? oldData.words_learned + 1
          : oldData.words_learned,
        last_activity: new Date().toISOString(),
      };
    });

    // Sync with server
    syncProgressMutation.mutate({ userId, syncData });
  }, [userId, queryClient, syncProgressMutation]);

  return {
    trackActivity,
    isSyncing: syncProgressMutation.isPending,
    syncError: syncProgressMutation.error,
  };
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch progress data for better UX
 */
export function usePrefetchUserProgress() {
  const queryClient = useQueryClient();

  const prefetchUserProgress = React.useCallback((userId: string) => {
    return queryClient.prefetchQuery({
      queryKey: userProgressKeys.user(userId),
      queryFn: () => languageApiService.getUserProgress(userId),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchLessonProgress = React.useCallback((userId: string, lessonId: string) => {
    return queryClient.prefetchQuery({
      queryKey: userProgressKeys.lesson(userId, lessonId),
      queryFn: () => languageApiService.getLessonProgress(userId, lessonId),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchUnitProgress = React.useCallback((userId: string, unitId: string) => {
    return queryClient.prefetchQuery({
      queryKey: userProgressKeys.unit(userId, unitId),
      queryFn: () => languageApiService.getUnitProgress(userId, unitId),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchUserProgress,
    prefetchLessonProgress,
    prefetchUnitProgress,
  };
}