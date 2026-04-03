/**
 * Unit Action hooks with React Query integration
 * Provides mutations for starting and completing units
 */

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  languageApiService,
  UnitStartRequest,
  UnitStartResponse,
  UnitCompleteRequest,
  UnitCompleteResponse
} from '../../services/languageApi';

// Import other hook keys for cache invalidation
import { userProgressKeys } from './useUserProgress';
import { achievementKeys } from './useAchievements';
import { analyticsKeys } from './useAnalytics';
import { exerciseKeys } from './useExercises';

// ==============================================
// MUTATION HOOKS
// ==============================================

/**
 * Hook to start a unit
 */
export function useStartUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, unitId, startData }: { 
      userId: string; 
      unitId: string; 
      startData: UnitStartRequest 
    }) => languageApiService.startUnit(userId, unitId, startData),
    onSuccess: (response, { userId, unitId }) => {
      // Invalidate unit progress
      queryClient.invalidateQueries({ 
        queryKey: userProgressKeys.unit(userId, unitId) 
      });
      
      // Invalidate user progress
      queryClient.invalidateQueries({ 
        queryKey: userProgressKeys.user(userId) 
      });

      // Invalidate unit exercises to refresh status
      queryClient.invalidateQueries({
        queryKey: [...exerciseKeys.all, 'unit', unitId]
      });

      console.log('Unit started successfully:', response);
    },
    onError: (error) => {
      console.error('Failed to start unit:', error);
    },
  });
}

/**
 * Hook to complete a unit
 */
export function useCompleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, unitId, completeData }: { 
      userId: string; 
      unitId: string; 
      completeData: UnitCompleteRequest 
    }) => languageApiService.completeUnit(userId, unitId, completeData),
    onSuccess: (response, { userId, unitId }) => {
      // Invalidate all progress-related queries
      queryClient.invalidateQueries({ 
        queryKey: userProgressKeys.user(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: userProgressKeys.unit(userId, unitId) 
      });

      // Invalidate achievements if any were unlocked
      if (response.achievements_unlocked.length > 0) {
        queryClient.invalidateQueries({ 
          queryKey: achievementKeys.user(userId) 
        });
      }

      // Invalidate analytics for updated stats
      queryClient.invalidateQueries({ 
        queryKey: analyticsKeys.user(userId) 
      });

      // Invalidate unit exercises
      queryClient.invalidateQueries({
        queryKey: [...exerciseKeys.all, 'unit', unitId]
      });

      console.log('Unit completed successfully:', response);
    },
    onError: (error) => {
      console.error('Failed to complete unit:', error);
    },
  });
}

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to manage unit session state
 */
export function useUnitSession(userId: string, unitId: string) {
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [sessionStats, setSessionStats] = React.useState({
    startTime: null as Date | null,
    exercisesCompleted: 0,
    totalXP: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  });

  const startUnitMutation = useStartUnit();
  const completeUnitMutation = useCompleteUnit();

  // Start unit session
  const startSession = React.useCallback(async (startData: UnitStartRequest) => {
    try {
      const response = await startUnitMutation.mutateAsync({ 
        userId, 
        unitId, 
        startData 
      });
      
      setSessionId(response.session_id);
      setSessionStats(prev => ({
        ...prev,
        startTime: new Date(),
      }));
      
      return response;
    } catch (error) {
      console.error('Failed to start unit session:', error);
      throw error;
    }
  }, [userId, unitId, startUnitMutation]);

  // Complete unit session
  const completeSession = React.useCallback(async () => {
    if (!sessionId || !sessionStats.startTime) {
      throw new Error('No active session to complete');
    }

    const timeSpentMinutes = Math.round(
      (Date.now() - sessionStats.startTime.getTime()) / (1000 * 60)
    );

    const accuracyRate = sessionStats.totalAnswers > 0 
      ? (sessionStats.correctAnswers / sessionStats.totalAnswers) * 100 
      : 0;

    const completeData: UnitCompleteRequest = {
      session_id: sessionId,
      xp_earned: sessionStats.totalXP,
      exercises_completed: sessionStats.exercisesCompleted,
      accuracy_rate: accuracyRate,
      time_spent_minutes: timeSpentMinutes,
    };

    try {
      const response = await completeUnitMutation.mutateAsync({
        userId,
        unitId,
        completeData,
      });

      // Reset session state
      setSessionId(null);
      setSessionStats({
        startTime: null,
        exercisesCompleted: 0,
        totalXP: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      });

      return response;
    } catch (error) {
      console.error('Failed to complete unit session:', error);
      throw error;
    }
  }, [sessionId, sessionStats, userId, unitId, completeUnitMutation]);

  // Update session stats
  const updateSessionStats = React.useCallback((update: {
    exercisesCompleted?: number;
    xpEarned?: number;
    correctAnswer?: boolean;
  }) => {
    setSessionStats(prev => ({
      ...prev,
      exercisesCompleted: prev.exercisesCompleted + (update.exercisesCompleted || 0),
      totalXP: prev.totalXP + (update.xpEarned || 0),
      correctAnswers: prev.correctAnswers + (update.correctAnswer ? 1 : 0),
      totalAnswers: prev.totalAnswers + (update.correctAnswer !== undefined ? 1 : 0),
    }));
  }, []);

  // Calculate current session metrics
  const sessionMetrics = React.useMemo(() => {
    const timeSpent = sessionStats.startTime 
      ? Math.round((Date.now() - sessionStats.startTime.getTime()) / (1000 * 60))
      : 0;

    const accuracy = sessionStats.totalAnswers > 0 
      ? (sessionStats.correctAnswers / sessionStats.totalAnswers) * 100 
      : 0;

    return {
      timeSpentMinutes: timeSpent,
      accuracyRate: accuracy,
      isActive: !!sessionId,
      ...sessionStats,
    };
  }, [sessionId, sessionStats]);

  return {
    sessionId,
    sessionMetrics,
    startSession,
    completeSession,
    updateSessionStats,
    isStarting: startUnitMutation.isPending,
    isCompleting: completeUnitMutation.isPending,
    startError: startUnitMutation.error,
    completeError: completeUnitMutation.error,
  };
}

/**
 * Hook to handle automatic unit progression
 */
export function useUnitProgression(userId: string) {
  const startUnitMutation = useStartUnit();
  const completeUnitMutation = useCompleteUnit();

  // Auto-start next unit based on completion
  const progressToNextUnit = React.useCallback(async (
    completedUnitId: string,
    nextUnitId: string,
    languageCode: string
  ) => {
    try {
      // Start the next unit automatically
      const startData: UnitStartRequest = {
        language_code: languageCode,
        difficulty_level: 'progressive', // Automatically adjust difficulty
      };

      const response = await startUnitMutation.mutateAsync({
        userId,
        unitId: nextUnitId,
        startData,
      });

      return response;
    } catch (error) {
      console.error('Failed to progress to next unit:', error);
      throw error;
    }
  }, [userId, startUnitMutation]);

  return {
    progressToNextUnit,
    isProgressing: startUnitMutation.isPending,
    progressError: startUnitMutation.error,
  };
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Calculate unit performance rating
 */
export function calculatePerformanceRating(
  accuracyRate: number,
  completionTime: number,
  targetTime: number
): 'excellent' | 'good' | 'fair' | 'needs_improvement' {
  if (accuracyRate >= 90 && completionTime <= targetTime) {
    return 'excellent';
  } else if (accuracyRate >= 80 && completionTime <= targetTime * 1.2) {
    return 'good';
  } else if (accuracyRate >= 70) {
    return 'fair';
  } else {
    return 'needs_improvement';
  }
}

/**
 * Get recommended next unit based on performance
 */
export function getRecommendedDifficulty(
  currentDifficulty: string,
  performanceRating: string
): string {
  const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = difficultyLevels.indexOf(currentDifficulty);

  switch (performanceRating) {
    case 'excellent':
      // Increase difficulty if not at max
      return currentIndex < difficultyLevels.length - 1 
        ? difficultyLevels[currentIndex + 1] 
        : currentDifficulty;
    
    case 'good':
      // Keep same difficulty
      return currentDifficulty;
    
    case 'fair':
      // Keep same or slightly decrease
      return currentDifficulty;
    
    case 'needs_improvement':
      // Decrease difficulty if not at min
      return currentIndex > 0 
        ? difficultyLevels[currentIndex - 1] 
        : currentDifficulty;
    
    default:
      return currentDifficulty;
  }
}