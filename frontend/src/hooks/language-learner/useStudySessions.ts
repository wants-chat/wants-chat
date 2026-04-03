/**
 * Study Sessions hooks with React Query integration
 * Provides data fetching and mutations for study session management
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  languageApiService, 
  StudySession, 
  CreateStudySessionRequest, 
  UpdateStudySessionRequest,
  StudySessionQueryParams 
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const studySessionKeys = {
  all: ['studySessions'] as const,
  lists: () => [...studySessionKeys.all, 'list'] as const,
  list: (filters: StudySessionQueryParams) => [...studySessionKeys.lists(), filters] as const,
  details: () => [...studySessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...studySessionKeys.details(), id] as const,
  byLanguage: (languageCode: string) => [...studySessionKeys.all, 'language', languageCode] as const,
  byType: (sessionType: string) => [...studySessionKeys.all, 'type', sessionType] as const,
  active: () => [...studySessionKeys.all, 'active'] as const,
  stats: (languageCode?: string) => [...studySessionKeys.all, 'stats', languageCode] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch study sessions with filtering and pagination
 */
export function useStudySessions(params?: StudySessionQueryParams) {
  return useQuery({
    queryKey: studySessionKeys.list(params || {}),
    queryFn: () => languageApiService.getStudySessions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (sessions change frequently)
  });
}

/**
 * Hook to fetch sessions by language
 */
export function useStudySessionsByLanguage(languageCode: string, params?: Omit<StudySessionQueryParams, 'language_code'>) {
  const queryParams = { ...params, language_code: languageCode };
  
  return useQuery({
    queryKey: studySessionKeys.byLanguage(languageCode),
    queryFn: () => languageApiService.getStudySessions(queryParams),
    enabled: !!languageCode,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch recent study sessions
 */
export function useRecentStudySessions(languageCode?: string, limit = 10) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 7 days

  return useQuery({
    queryKey: [...studySessionKeys.all, 'recent', languageCode, limit],
    queryFn: () => languageApiService.getStudySessions({
      language_code: languageCode,
      start_date: startDate,
      end_date: endDate,
      limit,
      sort_by: 'start_time',
      sort_order: 'desc'
    }),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get active (uncompleted) sessions
 */
export function useActiveStudySessions(languageCode?: string) {
  return useQuery({
    queryKey: studySessionKeys.active(),
    queryFn: async () => {
      const response = await languageApiService.getStudySessions({
        language_code: languageCode,
        limit: 50
      });
      
      // Filter sessions that don't have end_time (still active)
      const activeSessions = response.data.filter(session => !session.end_time);
      
      return {
        ...response,
        data: activeSessions,
        total: activeSessions.length,
      };
    },
    staleTime: 30 * 1000, // 30 seconds (very fresh data for active sessions)
  });
}

// ==============================================
// MUTATION HOOKS
// ==============================================

/**
 * Hook to start a new study session
 */
// Disabled: Causing 400 errors and not needed per user request
/*export function useStartStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionData: CreateStudySessionRequest) => 
      languageApiService.startStudySession(sessionData),
    onSuccess: (newSession) => {
      // Invalidate session lists
      queryClient.invalidateQueries({ queryKey: studySessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });
      
      // Update language-specific cache
      if (newSession.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: studySessionKeys.byLanguage(newSession.language_code) 
        });
      }

      // Set the new session in cache
      queryClient.setQueryData(studySessionKeys.detail(newSession.id), newSession);
    },
    onError: (error) => {
      console.error('Failed to start study session:', error);
    },
  });
}*/

/**
 * Hook to update a study session
 */
export function useUpdateStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudySessionRequest }) => 
      languageApiService.updateStudySession(id, data),
    onSuccess: (updatedSession) => {
      // Update the specific session cache
      queryClient.setQueryData(studySessionKeys.detail(updatedSession.id), updatedSession);
      
      // Invalidate lists for consistency
      queryClient.invalidateQueries({ queryKey: studySessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });
      
      // Update language-specific cache
      if (updatedSession.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: studySessionKeys.byLanguage(updatedSession.language_code) 
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update study session:', error);
    },
  });
}

/**
 * Hook to complete a study session
 */
// Disabled: Causing 400 errors and not needed per user request
/*export function useCompleteStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudySessionRequest }) => 
      languageApiService.completeStudySession(id, data),
    onSuccess: (completedSession) => {
      // Update the specific session cache
      queryClient.setQueryData(studySessionKeys.detail(completedSession.id), completedSession);
      
      // Invalidate all session-related caches
      queryClient.invalidateQueries({ queryKey: studySessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });
      
      // Update language-specific cache
      if (completedSession.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: studySessionKeys.byLanguage(completedSession.language_code) 
        });
        
        // Invalidate stats for immediate update
        queryClient.invalidateQueries({ 
          queryKey: studySessionKeys.stats(completedSession.language_code) 
        });
      }
      
      // Invalidate progress queries as completing a session affects progress
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: (error) => {
      console.error('Failed to complete study session:', error);
    },
  });
}*/

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to get study session statistics
 */
export function useStudySessionStats(languageCode?: string, days = 30) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return useQuery({
    queryKey: studySessionKeys.stats(languageCode),
    queryFn: async () => {
      const response = await languageApiService.getStudySessions({
        language_code: languageCode,
        start_date: startDate,
        end_date: endDate,
        limit: 1000 // Get all sessions for accurate stats
      });

      const sessions = response.data.filter(session => session.end_time); // Only completed sessions
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          totalTimeMinutes: 0,
          totalExercises: 0,
          averageAccuracy: 0,
          totalXpEarned: 0,
          averageSessionLength: 0,
          sessionsPerDay: 0,
          typeDistribution: {},
          dailyActivity: [],
          streakData: { currentStreak: 0, longestStreak: 0 },
        };
      }

      // Basic stats
      const totalSessions = sessions.length;
      const totalTimeMinutes = sessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
      const totalExercises = sessions.reduce((sum, session) => sum + session.exercises_completed, 0);
      const totalXpEarned = sessions.reduce((sum, session) => sum + session.xp_earned, 0);
      
      // Calculate average accuracy (only for sessions with accuracy data)
      const sessionsWithAccuracy = sessions.filter(session => session.accuracy_rate !== null);
      const averageAccuracy = sessionsWithAccuracy.length > 0
        ? sessionsWithAccuracy.reduce((sum, session) => sum + (session.accuracy_rate || 0), 0) / sessionsWithAccuracy.length
        : 0;

      const averageSessionLength = totalTimeMinutes / totalSessions;
      const sessionsPerDay = totalSessions / days;

      // Session type distribution
      const typeDistribution = sessions.reduce((acc, session) => {
        acc[session.session_type] = (acc[session.session_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Daily activity for the last 30 days
      const dailyActivity = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const daysSessions = sessions.filter(session => 
          session.start_time.split('T')[0] === dateStr
        );
        
        dailyActivity.unshift({
          date: dateStr,
          sessions: daysSessions.length,
          timeMinutes: daysSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
          xp: daysSessions.reduce((sum, s) => sum + s.xp_earned, 0),
        });
      }

      // Calculate streak data
      const streakData = calculateStreakData(dailyActivity);

      return {
        totalSessions,
        totalTimeMinutes,
        totalExercises,
        averageAccuracy,
        totalXpEarned,
        averageSessionLength,
        sessionsPerDay,
        typeDistribution,
        dailyActivity,
        streakData,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get today's study progress
 */
export function useTodayStudyProgress(languageCode?: string) {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: [...studySessionKeys.all, 'today', languageCode],
    queryFn: async () => {
      const response = await languageApiService.getStudySessions({
        language_code: languageCode,
        start_date: today,
        end_date: today,
        limit: 100
      });

      const todaySessions = response.data;
      const completedSessions = todaySessions.filter(session => session.end_time);
      const activeSessions = todaySessions.filter(session => !session.end_time);

      const totalTimeMinutes = completedSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
      const totalXp = completedSessions.reduce((sum, session) => sum + session.xp_earned, 0);
      const totalExercises = completedSessions.reduce((sum, session) => sum + session.exercises_completed, 0);

      return {
        totalSessions: completedSessions.length,
        activeSessions: activeSessions.length,
        totalTimeMinutes,
        totalXp,
        totalExercises,
        sessions: todaySessions,
      };
    },
    staleTime: 60 * 1000, // 1 minute (fresh data for today's progress)
  });
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Calculate current and longest streak from daily activity data
 */
function calculateStreakData(dailyActivity: Array<{ date: string; sessions: number; timeMinutes: number; xp: number }>) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort by date descending (most recent first)
  const sortedActivity = [...dailyActivity].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate current streak (from today backwards)
  for (let i = 0; i < sortedActivity.length; i++) {
    if (sortedActivity[i].sessions > 0) {
      if (i === 0 || currentStreak > 0) { // Either first day or continuing streak
        currentStreak++;
      } else {
        break; // Streak is broken
      }
    } else if (i === 0) {
      break; // No activity today, no current streak
    } else {
      break; // Streak is broken
    }
  }

  // Calculate longest streak
  for (const day of dailyActivity) {
    if (day.sessions > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch study sessions for better UX
 */
export function usePrefetchStudySessions() {
  const queryClient = useQueryClient();

  const prefetchStudySessions = React.useCallback((params: StudySessionQueryParams) => {
    return queryClient.prefetchQuery({
      queryKey: studySessionKeys.list(params),
      queryFn: () => languageApiService.getStudySessions(params),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchActiveStudySessions = React.useCallback(() => {
    return queryClient.prefetchQuery({
      queryKey: studySessionKeys.active(),
      queryFn: async () => {
        const response = await languageApiService.getStudySessions({ limit: 50 });
        const activeSessions = response.data.filter(session => !session.end_time);
        return { ...response, data: activeSessions, total: activeSessions.length };
      },
      staleTime: 30 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchStudySessions,
    prefetchActiveStudySessions,
  };
}