/**
 * Language learning hooks
 */

import { useCallback, useState } from 'react';
import { api } from '../lib/api';
import { useApi, useMutation, usePaginatedApi } from './useApi';

// Types
export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
}

export interface UserLanguage {
  id: string;
  languageId: string;
  userId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'native';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'native';
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  language: Language;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  languageId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'vocabulary' | 'grammar' | 'conversation' | 'listening' | 'reading' | 'writing';
  content: any;
  xpReward: number;
  duration: number;
  prerequisites?: string[];
  isLocked: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  definition?: string;
  example?: string;
  exampleTranslation?: string;
  languageId: string;
  userId: string;
  difficultyLevel: number;
  mastered: boolean;
  timesCorrect: number;
  timesIncorrect: number;
  lastPracticed?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface PracticeSession {
  id: string;
  languageId: string;
  userId: string;
  type: 'vocabulary' | 'grammar' | 'conversation' | 'listening' | 'reading' | 'writing';
  questionsCount: number;
  correctAnswers: number;
  xpEarned: number;
  duration: number;
  completedAt: string;
}

export interface LanguageProgress {
  languageId: string;
  userId: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'native';
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  vocabularyMastered: number;
  practiceSessionsThisWeek: number;
  practiceSessionsThisMonth: number;
  averageAccuracy: number;
  timeSpentLearning: number;
  lastActivityAt?: string;
}

export interface AddUserLanguageData {
  languageId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'native';
  targetLevel: 'beginner' | 'intermediate' | 'advanced' | 'native';
  dailyGoal: number;
}

export interface UpdateUserLanguageData {
  level?: 'beginner' | 'intermediate' | 'advanced' | 'native';
  targetLevel?: 'beginner' | 'intermediate' | 'advanced' | 'native';
  dailyGoal?: number;
  isActive?: boolean;
}

export interface CompleteLessonData {
  score: number;
  duration: number;
  answers?: any[];
}

export interface AddVocabularyData {
  word: string;
  translation: string;
  pronunciation?: string;
  definition?: string;
  example?: string;
  exampleTranslation?: string;
  languageId: string;
  tags?: string[];
}

export interface UpdateVocabularyData {
  word?: string;
  translation?: string;
  pronunciation?: string;
  definition?: string;
  example?: string;
  exampleTranslation?: string;
  tags?: string[];
  mastered?: boolean;
}

export interface PracticeResult {
  questions: Array<{
    id: string;
    type: string;
    correct: boolean;
    timeSpent: number;
  }>;
  totalScore: number;
  duration: number;
}

// Language hooks

/**
 * Get all available languages
 */
export function useLanguages() {
  return useApi<Language[]>(
    () => api.getLanguages(),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Get user's languages
 */
export function useUserLanguages() {
  return useApi<UserLanguage[]>(
    () => api.getUserLanguages(),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Add a language for the user
 */
export function useAddUserLanguage() {
  return useMutation<UserLanguage, AddUserLanguageData>(
    (data) => api.addUserLanguage(data),
    {
      onSuccess: (data) => {
        console.log('Language added successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to add language:', error);
      },
    }
  );
}

/**
 * Update user language settings
 */
export function useUpdateUserLanguage() {
  return useMutation<UserLanguage, { id: string; data: UpdateUserLanguageData }>(
    ({ id, data }) => api.updateUserLanguage(id, data),
    {
      onSuccess: (data) => {
        console.log('Language updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update language:', error);
      },
    }
  );
}

/**
 * Remove a language from user's list
 */
export function useRemoveUserLanguage() {
  return useMutation<void, string>(
    (id) => api.removeUserLanguage(id),
    {
      onSuccess: () => {
        console.log('Language removed successfully');
      },
      onError: (error) => {
        console.error('Failed to remove language:', error);
      },
    }
  );
}

// Lesson hooks

/**
 * Get lessons for a language
 */
export function useLessons(
  languageId: string | null,
  params?: {
    level?: 'beginner' | 'intermediate' | 'advanced';
    type?: 'vocabulary' | 'grammar' | 'conversation' | 'listening' | 'reading' | 'writing';
    completed?: boolean;
    sortBy?: 'title' | 'createdAt' | 'level';
    sortOrder?: 'asc' | 'desc';
  }
) {
  return usePaginatedApi(
    useCallback(
      ({ page, limit }) => api.getLessons(languageId!, { ...params, page, limit }),
      [languageId, params]
    ),
    {
      enabled: !!languageId,
      refetchOnMount: true,
    }
  );
}

/**
 * Get a single lesson
 */
export function useLesson(id: string | null) {
  return useApi<Lesson>(
    () => api.getLesson(id!),
    {
      enabled: !!id,
      refetchOnMount: true,
    }
  );
}

/**
 * Complete a lesson
 */
export function useCompleteLesson() {
  return useMutation<any, { lessonId: string; data: CompleteLessonData }>(
    ({ lessonId, data }) => api.completeLesson(lessonId, data),
    {
      onSuccess: (data) => {
        console.log('Lesson completed successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to complete lesson:', error);
      },
    }
  );
}

// Vocabulary hooks

/**
 * Get vocabulary for a language
 */
export function useVocabulary(
  languageId: string | null,
  params?: {
    mastered?: boolean;
    search?: string;
    tags?: string[];
    difficultyLevel?: number;
    sortBy?: 'word' | 'createdAt' | 'lastPracticed' | 'difficultyLevel';
    sortOrder?: 'asc' | 'desc';
  }
) {
  return usePaginatedApi(
    useCallback(
      ({ page, limit }) => api.getVocabulary(languageId!, { ...params, page, limit }),
      [languageId, params]
    ),
    {
      enabled: !!languageId,
      refetchOnMount: true,
    }
  );
}

/**
 * Add new vocabulary
 */
export function useAddVocabulary() {
  return useMutation<Vocabulary, AddVocabularyData>(
    (data) => api.addVocabulary(data),
    {
      onSuccess: (data) => {
        console.log('Vocabulary added successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to add vocabulary:', error);
      },
    }
  );
}

/**
 * Update vocabulary
 */
export function useUpdateVocabulary() {
  return useMutation<Vocabulary, { id: string; data: UpdateVocabularyData }>(
    ({ id, data }) => api.updateVocabulary(id, data),
    {
      onSuccess: (data) => {
        console.log('Vocabulary updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update vocabulary:', error);
      },
    }
  );
}

/**
 * Delete vocabulary
 */
export function useDeleteVocabulary() {
  return useMutation<void, string>(
    (id) => api.deleteVocabulary(id),
    {
      onSuccess: () => {
        console.log('Vocabulary deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete vocabulary:', error);
      },
    }
  );
}

// Practice hooks

/**
 * Get practice session for vocabulary
 */
export function usePracticeVocabulary(
  languageId: string | null,
  params?: {
    type?: 'flashcards' | 'quiz' | 'matching' | 'spelling';
    difficulty?: 'easy' | 'medium' | 'hard';
    count?: number;
    includeReview?: boolean;
  }
) {
  return useApi<any>(
    () => api.practiceVocabulary(languageId!, params),
    {
      enabled: !!languageId && false, // Only fetch when explicitly called
      refetchOnMount: false,
    }
  );
}

/**
 * Submit practice result
 */
export function useSubmitPracticeResult() {
  return useMutation<PracticeSession, PracticeResult>(
    (data) => api.submitPracticeResult(data),
    {
      onSuccess: (data) => {
        console.log('Practice result submitted successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to submit practice result:', error);
      },
    }
  );
}

/**
 * Get language progress
 */
export function useLanguageProgress(languageId: string | null) {
  return useApi<LanguageProgress>(
    () => api.getLanguageProgress(languageId!),
    {
      enabled: !!languageId,
      refetchOnMount: true,
    }
  );
}

// Utility hooks

/**
 * Combined hook for language management actions
 */
export function useLanguageActions() {
  const updateUserLanguage = useUpdateUserLanguage();
  const removeUserLanguage = useRemoveUserLanguage();

  return {
    updateSettings: updateUserLanguage.mutate,
    remove: removeUserLanguage.mutate,
    toggleActive: useCallback(async (id: string, isCurrentlyActive: boolean) => {
      try {
        await updateUserLanguage.mutate({ id, data: { isActive: !isCurrentlyActive } });
      } catch (error) {
        console.error('Failed to toggle language active status:', error);
        throw error;
      }
    }, [updateUserLanguage]),
    
    isUpdating: updateUserLanguage.loading,
    isRemoving: removeUserLanguage.loading,
  };
}

/**
 * Hook for vocabulary management actions
 */
export function useVocabularyActions() {
  const updateVocabulary = useUpdateVocabulary();
  const deleteVocabulary = useDeleteVocabulary();

  return {
    update: updateVocabulary.mutate,
    delete: deleteVocabulary.mutate,
    toggleMastered: useCallback(async (id: string, isCurrentlyMastered: boolean) => {
      try {
        await updateVocabulary.mutate({ id, data: { mastered: !isCurrentlyMastered } });
      } catch (error) {
        console.error('Failed to toggle vocabulary mastered status:', error);
        throw error;
      }
    }, [updateVocabulary]),
    
    isUpdating: updateVocabulary.loading,
    isDeleting: deleteVocabulary.loading,
  };
}

/**
 * Get active user languages only
 */
export function useActiveUserLanguages() {
  const userLanguages = useUserLanguages();
  
  return {
    ...userLanguages,
    data: userLanguages.data?.filter(lang => lang.isActive) || null,
  };
}

/**
 * Get lessons for current level
 */
export function useLessonsForLevel(
  languageId: string | null,
  level: 'beginner' | 'intermediate' | 'advanced'
) {
  return useLessons(languageId, {
    level,
    completed: false,
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });
}

/**
 * Get vocabulary for practice (unmastered words)
 */
export function useVocabularyForPractice(languageId: string | null) {
  return useVocabulary(languageId, {
    mastered: false,
    sortBy: 'lastPracticed',
    sortOrder: 'asc',
  });
}

/**
 * Hook for language learning dashboard
 */
export function useLanguageDashboard(languageId: string | null) {
  const userLanguages = useUserLanguages();
  const progress = useLanguageProgress(languageId);
  const lessonsAvailable = useLessons(languageId, { completed: false });
  const vocabularyToReview = useVocabulary(languageId, { mastered: false });

  const currentLanguage = userLanguages.data?.find(lang => lang.languageId === languageId);

  return {
    currentLanguage,
    progress: progress.data,
    availableLessons: lessonsAvailable.data?.data || [],
    vocabularyToReview: vocabularyToReview.data?.data || [],
    
    loading: userLanguages.loading || progress.loading || lessonsAvailable.loading || vocabularyToReview.loading,
    error: userLanguages.error || progress.error || lessonsAvailable.error || vocabularyToReview.error,
    
    refetch: useCallback(() => {
      userLanguages.refetch();
      progress.refetch();
      lessonsAvailable.refetch();
      vocabularyToReview.refetch();
    }, [userLanguages, progress, lessonsAvailable, vocabularyToReview]),
  };
}

/**
 * Hook for practice session management
 */
export function usePracticeSession(languageId: string | null) {
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [sessionResults, setSessionResults] = useState<PracticeResult | null>(null);
  
  const startPractice = usePracticeVocabulary(languageId);
  const submitResults = useSubmitPracticeResult();

  const startSession = useCallback(async (params?: any) => {
    try {
      await startPractice.refetch();
      // Access data from the hook state after refetch
      const sessionData = startPractice.data;
      setCurrentSession(sessionData);
      setSessionResults(null);
      return sessionData;
    } catch (error) {
      console.error('Failed to start practice session:', error);
      throw error;
    }
  }, [startPractice]);

  const endSession = useCallback(async (results: PracticeResult) => {
    try {
      setSessionResults(results);
      const response = await submitResults.mutate(results);
      return response;
    } catch (error) {
      console.error('Failed to end practice session:', error);
      throw error;
    }
  }, [submitResults]);

  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setSessionResults(null);
  }, []);

  return {
    currentSession,
    sessionResults,
    startSession,
    endSession,
    resetSession,
    isStarting: startPractice.loading,
    isSubmitting: submitResults.loading,
  };
}

/**
 * Hook for bulk vocabulary operations
 */
export function useBulkVocabularyOperations() {
  const updateVocabulary = useUpdateVocabulary();
  const deleteVocabulary = useDeleteVocabulary();

  return {
    bulkMarkMastered: useCallback(async (vocabularyIds: string[]) => {
      const promises = vocabularyIds.map(id => 
        updateVocabulary.mutate({ id, data: { mastered: true } })
      );
      await Promise.all(promises);
    }, [updateVocabulary]),

    bulkDelete: useCallback(async (vocabularyIds: string[]) => {
      const promises = vocabularyIds.map(id => deleteVocabulary.mutate(id));
      await Promise.all(promises);
    }, [deleteVocabulary]),

    bulkAddTags: useCallback(async (vocabularyIds: string[], tags: string[]) => {
      // Note: This would need to merge with existing tags
      const promises = vocabularyIds.map(id => 
        updateVocabulary.mutate({ id, data: { tags } })
      );
      await Promise.all(promises);
    }, [updateVocabulary]),

    isPerforming: updateVocabulary.loading || deleteVocabulary.loading,
  };
}

/**
 * General language hook - returns user's language profile
 * For compatibility with existing components
 */
export function useLanguage() {
  const userLanguages = useUserLanguages();
  const updateUserLanguage = useUpdateUserLanguage();

  // Get the first active language as the primary profile
  const profile = userLanguages.data?.find(lang => lang.isActive) || userLanguages.data?.[0];

  return {
    profile,
    languages: userLanguages.data || [],
    loading: userLanguages.loading,
    error: userLanguages.error,
    updateProfile: useCallback((data: UpdateUserLanguageData) => {
      if (profile) {
        return updateUserLanguage.mutate({ id: profile.id, data });
      }
    }, [profile, updateUserLanguage]),
    refetch: userLanguages.refetch,
    isUpdating: updateUserLanguage.loading,
  };
}